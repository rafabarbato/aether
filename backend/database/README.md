# Database Initialization

This directory contains the database initialization script for the Aether Task Management System.

## Quick Start

### Fresh Database Setup

To initialize or rebuild the database from scratch:

```bash
# Stop and remove existing containers (this will delete all data!)
docker compose down -v

# Start fresh with new database
docker compose up -d postgres

# Wait for database to initialize (check logs)
docker compose logs -f postgres
```

The `init.sql` script will automatically run when the PostgreSQL container starts for the first time or when the volume is recreated.

### What Gets Created

The `init.sql` script creates all tables and indexes:

1. **Core Tables:**
   - `users` - User accounts with authentication
   - `teams` - Team organization
   - `groups` - Top-level project organization
   - `projects` - Projects within groups
   - `milestones` - Milestones and sprints for projects
   - `tasks` - Individual tasks

2. **Junction Tables:**
   - `user_team_assignments` - Many-to-many user-team relationships
   - `task_assignees` - Many-to-many task-user assignments

3. **Supporting Tables:**
   - `comments` - Task comments with threading support
   - `attachments` - File attachments for tasks
   - `notifications` - User notifications

4. **Features:**
   - Proper foreign key constraints
   - Indexes for performance
   - Triggers for automatic `updated_at` timestamps
   - Soft deletes (`deleted_at`) for data recovery
   - Check constraints for data validation

## Database Schema Hierarchy

```
Groups
  └── Projects
        ├── Milestones/Sprints
        │     └── Tasks
        │           ├── Multiple Assignees
        │           ├── Comments
        │           └── Attachments
        └── Tasks (can be standalone)
```

## Seeding Test Data

After the database is initialized, you can seed it with test data:

```bash
# Run the seed script
docker compose exec backend npm run seed
```

This will create:
- Demo users (admin, manager, member)
- Sample groups, projects, milestones, and tasks

## Manual Database Access

To access the database directly:

```bash
# Via Docker
docker compose exec postgres psql -U postgres -d aether_task_management

# Or if you have psql installed locally
psql -h localhost -U postgres -d aether_task_management
```

## Troubleshooting

### Database not initializing
If the init script doesn't run, make sure:
1. The PostgreSQL volume is being recreated: `docker compose down -v`
2. The init.sql file path is correct in docker-compose.yml
3. Check PostgreSQL logs: `docker compose logs postgres`

### Need to reset database
```bash
# Complete reset (deletes all data!)
docker compose down -v
docker compose up -d postgres

# Then seed if needed
docker compose exec backend npm run seed
```

### Schema changes
When you modify `init.sql`:
1. Stop containers: `docker compose down -v`
2. Start fresh: `docker compose up -d`
3. The new schema will be applied automatically

## Migration from Old Migrations

If you were using migrations before:
1. The `init.sql` contains all schema changes
2. Old migration files can be removed
3. Simply rebuild the database to apply the new schema
