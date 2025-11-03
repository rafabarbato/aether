# Aether - Task Management and Productivity System for Remote Teams

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Functional Requirements](#functional-requirements)
- [Non-Functional Requirements](#non-functional-requirements)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Installation and Configuration](#installation-and-configuration)
- [System Usage](#system-usage)
- [UML Diagrams](#uml-diagrams)
- [Design Decisions](#design-decisions)

---

## Overview

This project implements a comprehensive web-based task management and productivity system specifically designed for remote teams. The system provides an interactive kanban board interface with drag-and-drop functionality, real-time notifications, project management, commenting system, file attachments, and productivity reporting.

### Project Objectives

1. Centralize task management, deadlines, and communication for remote teams
2. Improve visibility of project progress across distributed team members
3. Facilitate asynchronous collaboration between team members
4. Provide metrics and insights on team productivity

---

## Problem Statement

### Context

With the growth of remote work, distributed teams face significant challenges:

- **Lack of visibility**: Difficulty tracking individual team member activities
- **Fragmented communication**: Information scattered across multiple tools (email, chat, spreadsheets)
- **Deadline management**: Missed deadlines due to lack of centralized tracking
- **Meeting overhead**: Frequent synchronization meetings required
- **Prioritization difficulty**: Unclear task priorities

### Proposed Solution

A unified web system providing:

- Visual Kanban board with real-time updates
- Integrated commenting system for tasks
- Intelligent notifications to keep team informed
- Attachment management for centralized documentation
- Productivity reports with charts and metrics
- Permission control by team and role

---

## Functional Requirements

### RF01 - Authentication and Authorization
- Secure login with JWT
- User registration
- Role-based access control (Admin, Manager, Member)
- Logout and token refresh functionality

### RF02 - Project Management
- Create, edit, archive, and delete projects
- Associate projects with teams
- Define start and end dates
- Project status management (Planning, Active, On Hold, Completed, Archived)

### RF03 - Task Management (Kanban)
- Create tasks with title, description, priority, deadline
- Move tasks between columns (Ready, In Progress, In Review, Done)
- Assign tasks to team members
- Add tags/labels for categorization
- Estimate work hours
- Track actual hours worked
- Define and visualize deadlines

### RF04 - Commenting System
- Add comments to tasks
- Reply to comments (threaded discussions)
- Mention other users
- Edit and delete own comments

### RF05 - Attachment Management
- Upload files to tasks
- Support multiple file types (PDF, images, documents)
- Download attachments
- File size limit enforcement (10MB per file)

### RF06 - Real-Time Notifications
- Notification on task assignment
- Notification for new comments
- Notification for mentions
- Deadline proximity alerts
- In-app notification system
- WebSocket for instant updates

### RF07 - Reports and Dashboard
- Burndown chart per project
- Task statistics by status
- Overdue tasks tracking
- Team member productivity metrics
- Average task completion time
- Report export (CSV, PDF)

### RF08 - Team Management
- Create and manage teams
- Add/remove members
- Define roles within team
- View team activity

### RF09 - Search and Filters
- Search tasks by title/description
- Filter by status, priority, assignee
- Filter by project, team
- Filter by creation date/deadline

---

## Non-Functional Requirements

### RNF01 - Performance
- **Response time**: Less than 2 seconds for CRUD operations
- **Concurrent users**: Minimum 500 simultaneous users
- **Initial load time**: Less than 3 seconds
- **Query optimization**: Use of indexes and cache (Redis)

### RNF02 - Security
- **Password encryption**: bcrypt with 10 rounds
- **Secure transmission**: HTTPS mandatory in production
- **Attack protection**:
  - SQL Injection (using Sequelize ORM)
  - XSS (input sanitization)
  - CSRF (CSRF tokens)
- **Rate limiting**: 100 requests per 15 minutes per IP
- **Data validation**: Backend and frontend

### RNF03 - Availability and Reliability
- **Automatic backup**: Daily at 2:00 AM
- **Uptime**: 99.5% availability
- **Structured logs**: Winston for auditing
- **Soft delete**: Recovery of deleted data

### RNF04 - Usability and Accessibility
- **Responsive design**: Mobile-first approach
- **Light/dark theme**: User preference support
- **Accessibility**: WCAG 2.1 Level AA
  - Keyboard navigation
  - Screen reader compatible
  - Adequate color contrast
  - Alternative text for images
- **Internationalization**: Prepared for multiple languages

### RNF05 - Maintainability
- **Clean code**: Following SOLID and DRY principles
- **Documentation**: Complete README and code comments
- **Tests**: Minimum 70% coverage
- **Version control**: Git with GitFlow
- **CI/CD**: Automated pipeline

### RNF06 - Scalability
- **Modular architecture**: Separation of concerns
- **Stateless**: Support for horizontal scaling
- **Distributed cache**: Redis for sessions and cache
- **Database indexing**: Optimization of frequent queries

---

## System Architecture

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  React 18 + TypeScript + Vite                       │   │
│  │  - React Query (server state management)           │   │
│  │  - @dnd-kit (drag and drop)                         │   │
│  │  - Tailwind CSS (styling)                           │   │
│  │  - Socket.IO Client (WebSocket)                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTP/HTTPS + WebSocket
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Node.js + Express + TypeScript                     │   │
│  │                                                       │   │
│  │  LAYERS (SOLID):                                    │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  Routes (Express Router)                     │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  Controllers (request/response)              │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  Services (business logic)                   │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  Repositories (data access)                  │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  Models (Sequelize ORM)                      │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │   PostgreSQL 15      │    │     Redis 7          │      │
│  │   - Primary data     │    │     - Cache          │      │
│  │   - Relational       │    │     - Sessions       │      │
│  │   - ACID compliance  │    │     - Pub/Sub        │      │
│  └──────────────────────┘    └──────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns Applied

#### 1. Repository Pattern
Separates data access logic from business logic:

```typescript
class TaskRepository {
  async findById(id: number): Promise<Task | null> { }
  async create(data: TaskCreationAttributes): Promise<Task> { }
  async update(id: number, data: Partial<Task>): Promise<Task> { }
}

class TaskService {
  async createTask(data, userId) {
    const task = await TaskRepository.create(data);
    return task;
  }
}
```

#### 2. MVC (Model-View-Controller)
- **Model**: Sequelize models (User.ts, Task.ts)
- **View**: React components (KanbanBoard.tsx)
- **Controller**: Express controllers (TaskController.ts)

#### 3. Observer Pattern
Implemented via WebSocket for real-time notifications:

```typescript
WebSocketServer.notifyProject(projectId, 'task:updated', { task });
```

#### 4. Middleware Chain
Express middleware for authentication, validation, error handling:

```typescript
router.post('/tasks',
  authenticate,
  validate(schema),
  TaskController.create
);
```

#### 5. Dependency Injection
Services and repositories are injected to facilitate testing:

```typescript
class TaskController {
  constructor(private taskService: TaskService) {}
}
```

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2 | UI framework |
| **TypeScript** | 5.2 | Type safety |
| **Vite** | 5.0 | Build tool |
| **Tailwind CSS** | 3.3 | Utility-first CSS |
| **@dnd-kit** | 6.1 | Drag and drop |
| **React Query** | 5.13 | Server state management |
| **Socket.IO Client** | 4.6 | WebSocket client |
| **React Hook Form** | 7.49 | Form management |
| **Zod** | 3.22 | Schema validation |
| **Recharts** | 2.10 | Charts and dashboards |
| **Lucide React** | 0.294 | Icons |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express** | 4.18 | Web framework |
| **TypeScript** | 5.3 | Type safety |
| **Sequelize** | 6.35 | PostgreSQL ORM |
| **PostgreSQL** | 15 | Relational database |
| **Redis** | 7 | Cache and sessions |
| **Socket.IO** | 4.6 | WebSocket server |
| **JWT** | 9.0 | Stateless authentication |
| **Bcrypt** | 5.1 | Password hashing |
| **Joi** | 17.11 | Data validation |
| **Winston** | 3.11 | Structured logging |
| **Helmet** | 7.1 | Security headers |
| **CORS** | 2.8 | Cross-origin requests |

### Technical Justifications

#### React vs Vue/Angular
- Mature ecosystem with extensive library support
- Optimized Virtual DOM performance
- Large developer community and resources
- Modern Hooks API for functional programming

#### TypeScript
- Type safety reduces runtime bugs
- Enhanced IDE support with IntelliSense
- Safe refactoring capabilities
- Implicit documentation through types

#### Node.js/Express
- Full-stack JavaScript consistency
- Asynchronous event loop for I/O performance
- Extensive NPM ecosystem
- Lower learning curve

#### PostgreSQL
- ACID compliance for reliable transactions
- Relational structure ideal for hierarchical data
- Excellent performance for complex queries
- Native JSON support for flexibility

#### Redis
- Sub-millisecond latency for cache operations
- Session storage capabilities
- Pub/Sub support for WebSocket
- Horizontal scalability

---

## Installation and Configuration

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd Aether
```

### 2. Backend Configuration

```bash
cd backend
npm install
cd ..
cp .env.example .env
```

Configure environment variables in `.env` (located in project root):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aether_task_management
DB_USER=postgres
DB_PASSWORD=your_password

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret

PORT=3000
NODE_ENV=development
```

Create database:

```bash
psql -U postgres
CREATE DATABASE aether_task_management;
\q
```

Run migrations:

```bash
npm run migrate
```

Start development server:

```bash
npm run dev
```

Backend available at `http://localhost:3000`

### 3. Frontend Configuration

```bash
cd frontend
npm install
```

Frontend uses the API URL configured in `vite.config.ts` proxy settings. For production builds, set `VITE_API_URL` environment variable.

Start development server:

```bash
npm run dev
```

Frontend available at `http://localhost:5173`

### 4. Test Data (Optional)

Populate database with sample data:

```bash
cd backend
npm run seed
```

Test users created:
- Admin: `admin@aether.com` / `admin123`
- Manager: `manager@aether.com` / `manager123`
- Member: `user@aether.com` / `user123`

---

## System Usage

### 1. Registration and Login

Navigate to `http://localhost:5173/register`, complete registration form, and login with credentials.

### 2. Create Project

1. Navigate to Projects section
2. Click New Project
3. Complete form with project details
4. Submit creation

### 3. Kanban Task Management

#### Create Task
1. Access project view
2. Click New Task button
3. Complete task form
4. Task created in READY column

#### Move Tasks
Drag tasks between columns to update status. Changes propagate via WebSocket to all connected clients.

#### Edit Task
Click task card to view details and access edit functionality.

### 4. Comments and Collaboration

1. Open task detail view
2. Add comments in Comments section
3. Use `@username` syntax for mentions
4. Reply to existing comments

### 5. File Attachments

1. Open task detail view
2. Navigate to Attachments section
3. Upload files (maximum 10MB per file)
4. Files available for download by team members

### 6. Reports

1. Access Reports section
2. Select time period
3. View metrics:
   - Burndown chart
   - Task status distribution
   - User productivity
   - Overdue tasks
4. Export reports in CSV/PDF format

### 7. Notifications

Access notification center via bell icon in header. View:
- Task assignments
- Comment notifications
- Mentions
- Deadline alerts (2 days prior)

---

## UML Diagrams

### Use Case Diagram

```
Member (Team Member):
- Login/Logout
- View assigned tasks
- Update task status
- Add comments
- Upload attachments
- Receive notifications
- View personal dashboard

Manager (Project Manager):
Inherits Member capabilities plus:
- Create/edit/delete tasks
- Assign tasks to members
- Create projects
- Manage team
- View project reports
- Configure deadlines

Admin (Administrator):
Inherits Manager capabilities plus:
- Manage users (CRUD)
- Manage permissions
- View system logs
- Global configurations
- Backup and restore
```

### Entity-Relationship Diagram

```sql
USERS                    PROJECTS                 TEAMS
- id (PK)               - id (PK)               - id (PK)
- username              - name                  - name
- email                 - description           - description
- password              - owner_id (FK)         - color
- first_name            - team_id (FK)
- last_name             - status
- photo_url             - start_date
- role                  - end_date
- is_active

                        TASKS
                        - id (PK)
                        - project_id (FK)
                        - title
                        - description
                        - status
                        - priority
                        - tag_label
                        - assigned_to (FK)
                        - created_by (FK)
                        - estimated_hours
                        - actual_hours
                        - due_date
                        - position

    COMMENTS                        ATTACHMENTS
    - id (PK)                      - id (PK)
    - task_id (FK)                 - task_id (FK)
    - user_id (FK)                 - user_id (FK)
    - content                      - file_name
    - parent_id (FK)               - file_size
                                   - mime_type
                                   - file_path

    NOTIFICATIONS
    - id (PK)
    - user_id (FK)
    - type
    - title
    - message
    - related_task_id (FK)
    - is_read
    - read_at
```

### Sequence Diagram - Move Task in Kanban

```
User    Frontend    Backend     Database    WebSocket    Other Users
 |          |          |            |            |              |
 | Drag     |          |            |            |              |
 | task     |          |            |            |              |
 |--------->|          |            |            |              |
 |          | PATCH    |            |            |              |
 |          | /tasks/  |            |            |              |
 |          | 123/     |            |            |              |
 |          | status   |            |            |              |
 |          |--------->|            |            |              |
 |          |          | UPDATE     |            |              |
 |          |          | task       |            |              |
 |          |          |----------->|            |              |
 |          |          |            |            |              |
 |          |          |<-----------|            |              |
 |          |          | Task       |            |              |
 |          |          | updated    |            |              |
 |          |          |            |            |              |
 |          |          | Emit       |            |              |
 |          |          | event      |            |              |
 |          |          |------------------------>|              |
 |          |          |            |            | Broadcast    |
 |          |          |            |            |------------->|
 |          |<---------|            |            |              |
 |          | Response |            |            |              |
 |<---------|          |            |            |              |
 | UI       |          |            |            |              |
 | update   |          |            |            |              |
```

---

## Design Decisions

### 1. Repository Pattern

**Problem**: Coupling between business logic and data access

**Solution**: Repository Pattern separates concerns

**Benefits**:
- Facilitates testing through repository mocking
- Enables ORM/database changes without affecting services
- Cleaner code organization (SOLID compliance)

### 2. WebSocket vs Polling

**Comparison**:

| Approach | Latency | Bandwidth | Server Load |
|----------|---------|-----------|-------------|
| Polling | 5-10s | High | High |
| Long Polling | 1-3s | Medium | Medium |
| WebSocket | <100ms | Low | Low |

**Choice**: WebSocket provides superior real-time experience with minimal overhead.

### 3. JWT vs Sessions

**JWT Advantages**:
- Stateless: No server-side storage required
- Scalable: Multi-server deployment friendly
- Mobile-friendly: Native mobile app support
- Cross-domain: Multiple domain support

**Tradeoffs**:
- Revocation complexity (solution: Redis blacklist)
- Larger payload than session ID

### 4. Soft Delete vs Hard Delete

**Rationale**:
- Audit trail: Maintain change history
- Recovery: Undo deletion capability
- Referential integrity: Maintain relationships
- Compliance: Legal requirements

**Implementation**: `deleted_at` field with paranoid mode in Sequelize

### 5. TypeScript Adoption

**Bug Statistics**:
- JavaScript: approximately 15 bugs per 1000 lines
- TypeScript: approximately 5 bugs per 1000 lines

**ROI**: Additional development time (approximately 10%) offset by bug reduction (approximately 70%)