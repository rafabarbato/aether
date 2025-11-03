# System Architecture Documentation

## Overview

This document provides detailed technical architecture documentation for the Aether Task Management System. The system follows a three-tier architecture with clear separation between presentation, business logic, and data layers.

## Architecture Layers

### 1. Presentation Layer (Frontend)

**Technology**: React 18 + TypeScript + Vite

**Responsibilities**:
- User interface rendering
- Client-side state management
- User interaction handling
- Real-time updates via WebSocket

**Key Components**:

```
src/
├── components/          # Reusable UI components
├── pages/              # Page-level components
├── services/           # API communication layer
├── hooks/              # Custom React hooks
├── store/              # Global state management
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

**State Management Strategy**:
- Local state: React useState/useReducer
- Server state: React Query
- Global state: Zustand (lightweight)
- Real-time state: WebSocket events

### 2. Application Layer (Backend)

**Technology**: Node.js + Express + TypeScript

**Responsibilities**:
- Request routing and validation
- Business logic execution
- Authentication and authorization
- WebSocket connection management

**Layered Architecture**:

```
src/
├── routes/             # Express route definitions
│   └── *.routes.ts     # Route handlers with middleware
├── controllers/        # Request/response handlers
│   └── *Controller.ts  # HTTP layer logic
├── services/           # Business logic layer
│   └── *Service.ts     # Domain operations
├── repositories/       # Data access layer
│   └── *Repository.ts  # Database operations
├── middleware/         # Express middleware
│   ├── auth.ts         # Authentication
│   ├── validate.ts     # Request validation
│   └── errorHandler.ts # Error handling
├── websocket/          # WebSocket server
│   └── WebSocketServer.ts
└── utils/              # Utility functions
```

**Request Flow**:

```
HTTP Request
    ↓
Routes (routing + middleware)
    ↓
Controller (request handling)
    ↓
Service (business logic)
    ↓
Repository (data access)
    ↓
Model (ORM)
    ↓
Database
```

### 3. Data Layer

**Primary Database**: PostgreSQL 15

**Responsibilities**:
- Persistent data storage
- Transactional integrity (ACID)
- Relational data management

**Cache Layer**: Redis 7

**Responsibilities**:
- Session storage
- Query result caching
- Rate limiting data
- WebSocket pub/sub

## Design Patterns Implementation

### Repository Pattern

**Purpose**: Abstracts data access logic

**Implementation**:

```typescript
// repositories/TaskRepository.ts
class TaskRepository {
  async findById(id: number): Promise<Task | null> {
    return await Task.findOne({ where: { id } });
  }

  async create(data: TaskCreationAttributes): Promise<Task> {
    return await Task.create(data);
  }

  async update(id: number, updates: Partial<Task>): Promise<Task> {
    const task = await this.findById(id);
    if (!task) throw ApiError.notFound('Task not found');
    return await task.update(updates);
  }
}
```

**Benefits**:
- Testability: Easy to mock for unit tests
- Flexibility: Can swap data sources without affecting business logic
- Maintainability: Single responsibility principle

### Service Layer Pattern

**Purpose**: Encapsulates business logic

**Implementation**:

```typescript
// services/TaskService.ts
class TaskService {
  constructor(
    private taskRepository: TaskRepository,
    private notificationService: NotificationService
  ) {}

  async createTask(data: CreateTaskDto, userId: number): Promise<Task> {
    // Business logic
    await this.validateProjectAccess(data.projectId, userId);

    // Create task
    const task = await this.taskRepository.create({
      ...data,
      createdBy: userId
    });

    // Side effects
    if (task.assignedTo) {
      await this.notificationService.notifyTaskAssignment(task);
    }

    return task;
  }
}
```

**Benefits**:
- Reusability: Services can be used by multiple controllers
- Testability: Business logic isolated from HTTP layer
- Composition: Services can use other services

### Observer Pattern (WebSocket)

**Purpose**: Real-time updates to connected clients

**Implementation**:

```typescript
class WebSocketServer {
  notifyProject(projectId: number, event: string, data: any): void {
    this.io.to(`project:${projectId}`).emit(event, data);
  }

  broadcastTaskUpdate(projectId: number, task: Task): void {
    this.notifyProject(projectId, 'task:updated', { task });
  }
}
```

**Events**:
- `task:created` - New task added
- `task:updated` - Task modified
- `task:deleted` - Task removed
- `task:assigned` - Task assigned to user
- `comment:added` - New comment on task

### Middleware Chain Pattern

**Purpose**: Request processing pipeline

**Implementation**:

```typescript
router.post('/tasks',
  authenticate,              // Verify JWT
  authorize('member'),       // Check permissions
  validate(createTaskSchema), // Validate request body
  TaskController.create      // Handle request
);
```

**Middleware Types**:
- Authentication: JWT verification
- Authorization: Role-based access control
- Validation: Request data validation
- Error handling: Centralized error responses
- Logging: Request/response logging

## Database Schema Design

### Core Entities

```sql
users
├── id (PK)
├── username (UNIQUE)
├── email (UNIQUE)
├── password (hashed with bcrypt)
├── role (ENUM: admin, manager, member)
└── timestamps (created_at, updated_at, deleted_at)

projects
├── id (PK)
├── name
├── owner_id (FK -> users)
├── team_id (FK -> teams)
├── status (ENUM: planning, active, on_hold, completed, archived)
└── timestamps

tasks
├── id (PK)
├── project_id (FK -> projects)
├── title
├── status (ENUM: ready, in_progress, in_review, done)
├── priority (ENUM: low, medium, high, urgent)
├── assigned_to (FK -> users)
├── created_by (FK -> users)
├── position (for kanban ordering)
└── timestamps

comments
├── id (PK)
├── task_id (FK -> tasks CASCADE)
├── user_id (FK -> users)
├── parent_id (FK -> comments, self-referencing for replies)
└── timestamps

attachments
├── id (PK)
├── task_id (FK -> tasks CASCADE)
├── user_id (FK -> users)
├── file_path
└── timestamps
```

### Indexing Strategy

**Primary Indexes** (automatically created on PKs and UNIQUEs):
- users: id, username, email
- projects: id
- tasks: id
- comments: id
- attachments: id

**Secondary Indexes** (for query optimization):

```sql
-- Task queries by project and status
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);

-- Task queries by assignee
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

-- Comment queries by task
CREATE INDEX idx_comments_task_id ON comments(task_id);

-- Attachment queries by task
CREATE INDEX idx_attachments_task_id ON attachments(task_id);

-- Soft delete queries
CREATE INDEX idx_tasks_deleted_at ON tasks(deleted_at);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
```

### Relationships

**One-to-Many**:
- User → Projects (as owner)
- Project → Tasks
- Task → Comments
- Task → Attachments
- User → Comments

**Many-to-Many**:
- User ↔ Team (through user_team_assignments)

**Self-Referencing**:
- Comment → Comment (parent_id for threaded discussions)

## Security Architecture

### Authentication Flow

```
1. User submits credentials
   ↓
2. Backend validates credentials
   ↓
3. Generate JWT access token (7 days)
   ↓
4. Generate JWT refresh token (30 days)
   ↓
5. Return both tokens to client
   ↓
6. Client stores tokens (localStorage)
   ↓
7. Client includes access token in Authorization header
   ↓
8. Backend validates token on each request
```

### Token Refresh Flow

```
1. Access token expires
   ↓
2. Client receives 401 Unauthorized
   ↓
3. Client sends refresh token to /auth/refresh-token
   ↓
4. Backend validates refresh token
   ↓
5. Generate new access token
   ↓
6. Return new access token
   ↓
7. Client retries original request
```

### Password Security

```typescript
// Hashing on user creation
const hashedPassword = await bcrypt.hash(password, 10);

// Verification on login
const isValid = await bcrypt.compare(candidatePassword, user.password);
```

**Security Measures**:
- bcrypt with 10 rounds (adjustable via config)
- Passwords never stored in plaintext
- Passwords excluded from API responses

### API Security

**Rate Limiting**:
```typescript
// 100 requests per 15 minutes per IP
rateLimiter: {
  windowMs: 15 * 60 * 1000,
  max: 100
}
```

**CORS Configuration**:
```typescript
cors({
  origin: config.security.corsOrigin,
  credentials: true
});
```

**Security Headers** (Helmet.js):
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security
- Content-Security-Policy

**Input Validation**:
- Backend: Joi schemas
- Frontend: Zod schemas
- SQL Injection prevention: Sequelize ORM parameterized queries
- XSS prevention: Input sanitization

## Scalability Considerations

### Horizontal Scaling

**Stateless Design**:
- JWT tokens eliminate server-side session storage
- Any server instance can handle any request
- Load balancer can distribute requests evenly

**Database Connection Pooling**:
```typescript
pool: {
  max: 20,    // Maximum connections
  min: 2,     // Minimum connections
  acquire: 30000,  // Max time to get connection
  idle: 10000      // Max idle time
}
```

### Caching Strategy

**Redis Caching**:

```typescript
// Cache frequently accessed data
const cacheKey = `user:${userId}`;
let user = await redis.get(cacheKey);

if (!user) {
  user = await User.findByPk(userId);
  await redis.set(cacheKey, JSON.stringify(user), 'EX', 3600);
}
```

**Cache Invalidation**:
- Time-based: TTL (Time To Live)
- Event-based: Invalidate on data change

### Database Optimization

**Query Optimization**:
```typescript
// Use indexes
Task.findAll({
  where: {
    projectId: 123,
    status: 'in_progress'
  },
  include: [
    { model: User, as: 'assignee', attributes: ['id', 'username'] }
  ]
});

// Avoid N+1 queries with eager loading
```

**Pagination**:
```typescript
const tasks = await Task.findAll({
  limit: 20,
  offset: page * 20,
  order: [['createdAt', 'DESC']]
});
```

## Monitoring and Observability

### Logging Strategy

**Structured Logging** (Winston):

```typescript
logger.info('Task created', {
  taskId: task.id,
  userId: req.userId,
  projectId: task.projectId,
  timestamp: new Date().toISOString()
});
```

**Log Levels**:
- error: Application errors
- warn: Warning conditions
- info: Informational messages
- debug: Debug messages (development only)

### Error Tracking

**Error Categories**:
- 4xx: Client errors (validation, not found, unauthorized)
- 5xx: Server errors (internal, database, external service)

**Error Response Format**:
```json
{
  "success": false,
  "error": {
    "message": "Task not found",
    "statusCode": 404
  }
}
```

## Deployment Architecture

### Development Environment

```
localhost:5173 (Frontend - Vite dev server)
    ↓
localhost:3000 (Backend - Node.js)
    ↓
localhost:5432 (PostgreSQL)
localhost:6379 (Redis)
```

### Production Environment

```
Nginx (Reverse Proxy + SSL)
    ↓
Load Balancer
    ↓
Multiple Node.js Instances (PM2)
    ↓
PostgreSQL Primary (+ Replicas)
Redis Cluster
```

### CI/CD Pipeline

```
1. Git Push
   ↓
2. Run Tests (Jest)
   ↓
3. Lint Code (ESLint)
   ↓
4. Build TypeScript
   ↓
5. Build Docker Image
   ↓
6. Deploy to Environment
   ↓
7. Run Health Checks
```

## Performance Metrics

### Target Metrics

- **API Response Time**: < 200ms (p95)
- **Database Query Time**: < 50ms (p95)
- **WebSocket Latency**: < 100ms
- **Page Load Time**: < 3s
- **Time to Interactive**: < 5s

### Monitoring Tools

- Application Performance: New Relic / Datadog
- Database Performance: pg_stat_statements
- Real-time Monitoring: Grafana + Prometheus
- Error Tracking: Sentry