# API Documentation

## Base URL

```
Development: http://localhost:3000/api/v1
Production: https://api.aether.com/api/v1
```

## Authentication

All endpoints except authentication routes require a valid JWT token in the Authorization header.

```
Authorization: Bearer <access_token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

---

## Authentication Endpoints

### POST /auth/register

Register a new user.

**Request Body**:
```json
{
  "username": "string (3-50 chars, alphanumeric)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)",
  "firstName": "string",
  "lastName": "string",
  "role": "string (optional: admin, manager, member)"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "member",
      "isActive": true
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

### POST /auth/login

Authenticate user and receive tokens.

**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "member"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

### POST /auth/refresh-token

Refresh access token using refresh token.

**Request Body**:
```json
{
  "refreshToken": "string"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

### GET /auth/me

Get current authenticated user.

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "member",
      "photoUrl": null,
      "isActive": true
    }
  }
}
```

### POST /auth/logout

Logout current user.

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Task Endpoints

### GET /tasks

Get all tasks with optional filters.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `projectId` (number): Filter by project ID
- `status` (string): Filter by status (ready, in_progress, in_review, done)
- `priority` (string): Filter by priority (low, medium, high, urgent)
- `assignedTo` (number): Filter by assigned user ID
- `search` (string): Search in title/description

**Example**: `/tasks?projectId=1&status=in_progress`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 1,
        "projectId": 1,
        "title": "Implement user authentication",
        "description": "Add JWT authentication to API",
        "status": "in_progress",
        "priority": "high",
        "tagLabel": "#AUTH",
        "assignedTo": 2,
        "createdBy": 1,
        "estimatedHours": 8,
        "actualHours": 5,
        "dueDate": "2024-11-15T00:00:00.000Z",
        "position": 0,
        "createdAt": "2024-11-01T10:00:00.000Z",
        "updatedAt": "2024-11-02T14:30:00.000Z",
        "project": {
          "id": 1,
          "name": "Aether Project"
        },
        "assignee": {
          "id": 2,
          "username": "janedoe",
          "firstName": "Jane",
          "lastName": "Doe"
        }
      }
    ],
    "count": 1
  }
}
```

### GET /tasks/:id

Get single task by ID with full details.

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "task": {
      "id": 1,
      "projectId": 1,
      "title": "Implement user authentication",
      "description": "Add JWT authentication to API",
      "status": "in_progress",
      "priority": "high",
      "tagLabel": "#AUTH",
      "assignedTo": 2,
      "createdBy": 1,
      "estimatedHours": 8,
      "actualHours": 5,
      "dueDate": "2024-11-15T00:00:00.000Z",
      "position": 0,
      "project": {},
      "assignee": {},
      "creator": {},
      "comments": [],
      "attachments": []
    }
  }
}
```

### POST /tasks

Create a new task.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "projectId": 1,
  "title": "string (required)",
  "description": "string (optional)",
  "status": "ready (default)",
  "priority": "medium (default)",
  "tagLabel": "string (optional)",
  "assignedTo": 2,
  "estimatedHours": 8,
  "dueDate": "2024-11-15T00:00:00.000Z"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {}
  }
}
```

### PUT /tasks/:id

Update task.

**Headers**: `Authorization: Bearer <token>`

**Request Body** (all fields optional):
```json
{
  "title": "string",
  "description": "string",
  "status": "in_progress",
  "priority": "high",
  "assignedTo": 3,
  "estimatedHours": 10,
  "actualHours": 7,
  "dueDate": "2024-11-20T00:00:00.000Z"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "task": {}
  }
}
```

### PATCH /tasks/:id/status

Update task status only.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "status": "done"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "task": {}
  }
}
```

### PATCH /tasks/:id/position

Update task position (for kanban ordering).

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "position": 5
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Task position updated successfully",
  "data": {
    "task": {}
  }
}
```

### DELETE /tasks/:id

Delete task (soft delete).

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### GET /tasks/project/:projectId

Get all tasks for a specific project.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `status` (string, optional): Filter by status

**Response** (200):
```json
{
  "success": true,
  "data": {
    "tasks": [],
    "count": 0
  }
}
```

### GET /tasks/stats

Get task statistics for current user.

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 15,
      "ready": 3,
      "inProgress": 5,
      "inReview": 2,
      "done": 5,
      "overdue": 1
    }
  }
}
```

---

## WebSocket Events

### Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: accessToken
  }
});
```

### Client to Server

**join-project**: Join project room
```javascript
socket.emit('join-project', projectId);
```

**leave-project**: Leave project room
```javascript
socket.emit('leave-project', projectId);
```

### Server to Client

**task:created**: New task created
```javascript
socket.on('task:created', (data) => {
  console.log('New task:', data.task);
});
```

**task:updated**: Task updated
```javascript
socket.on('task:updated', (data) => {
  console.log('Task updated:', data.task);
});
```

**task:deleted**: Task deleted
```javascript
socket.on('task:deleted', (data) => {
  console.log('Task deleted:', data.taskId);
});
```

**task:assigned**: Task assigned to user
```javascript
socket.on('task:assigned', (data) => {
  console.log('Task assigned:', data.task);
});
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required or failed |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

---

## Rate Limiting

API requests are rate limited to 100 requests per 15 minutes per IP address.

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699876543
```