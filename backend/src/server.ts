import express, { Application } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import routes from './routes';
import errorHandler from './middleware/errorHandler';
import WebSocketServer from './websocket/WebSocketServer';
import logger from './utils/logger';
import ApiError from './utils/ApiError';

// Import models to initialize associations
import './database/models';

class Server {
  private app: Application;
  private httpServer: http.Server;

  constructor() {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddleware(): void {
    // Security
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: config.security.corsOrigin,
        credentials: true,
      })
    );

    // Parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression
    this.app.use(compression());

    // Logging
    if (config.env === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(
        morgan('combined', {
          stream: {
            write: (message: string) => logger.info(message.trim()),
          },
        })
      );
    }
  }

  private configureRoutes(): void {
    // API routes
    this.app.use(config.apiPrefix, routes);

    // 404 handler
    this.app.use('*', (req, res, next) => {
      next(ApiError.notFound(`Route ${req.originalUrl} not found`));
    });
  }

  private configureErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await connectDatabase();

      // Connect to Redis
      await connectRedis();

      // Initialize WebSocket server
      WebSocketServer.initialize(this.httpServer);

      // Start HTTP server
      this.httpServer.listen(config.port, () => {
        logger.info(`Server running on port ${config.port} in ${config.env} mode`);
        logger.info(`API available at http://localhost:${config.port}${config.apiPrefix}`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public getApp(): Application {
    return this.app;
  }

  public getHttpServer(): http.Server {
    return this.httpServer;
  }
}

// Start server
const server = new Server();
server.start();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.getHttpServer().close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default server;
