import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import logger from '../utils/logger';

export interface AuthenticatedSocket extends Socket {
  userId?: number;
}

class WebSocketServer {
  private io: SocketIOServer | null = null;

  initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: config.security.corsOrigin,
        credentials: true,
      },
    });

    this.io.use((socket: any, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      try {
        const decoded = jwt.verify(token, config.jwt.secret) as any;
        socket.userId = decoded.id;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket: any) => {
      logger.info(`Client connected: ${socket.id}, User: ${socket.userId}`);

      // Join user's personal room
      socket.join(`user:${socket.userId}`);

      socket.on('join-project', (projectId: number) => {
        socket.join(`project:${projectId}`);
        logger.info(`User ${socket.userId} joined project ${projectId}`);
      });

      socket.on('leave-project', (projectId: number) => {
        socket.leave(`project:${projectId}`);
        logger.info(`User ${socket.userId} left project ${projectId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });

    logger.info('WebSocket server initialized');
  }

  // Notification methods
  notifyUser(userId: number, event: string, data: any): void {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  notifyProject(projectId: number, event: string, data: any): void {
    if (this.io) {
      this.io.to(`project:${projectId}`).emit(event, data);
    }
  }

  broadcastTaskUpdate(projectId: number, task: any): void {
    this.notifyProject(projectId, 'task:updated', { task });
  }

  broadcastTaskCreated(projectId: number, task: any): void {
    this.notifyProject(projectId, 'task:created', { task });
  }

  broadcastTaskDeleted(projectId: number, taskId: number): void {
    this.notifyProject(projectId, 'task:deleted', { taskId });
  }

  notifyTaskAssignment(userId: number, task: any): void {
    this.notifyUser(userId, 'task:assigned', { task });
  }
}

export default new WebSocketServer();
