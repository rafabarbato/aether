-- Aether Task Management System - Database Initialization
-- This script creates all tables and initial data from scratch
-- Run this to initialize or rebuild the database

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS task_assignees CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS user_team_assignments CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  photo_url TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- ============================================================================
-- TEAMS TABLE
-- ============================================================================
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  color VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_teams_deleted_at ON teams(deleted_at);

-- ============================================================================
-- USER_TEAM_ASSIGNMENTS TABLE (Many-to-Many)
-- ============================================================================
CREATE TABLE user_team_assignments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  role VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, team_id)
);

CREATE INDEX idx_user_team_assignments_user_id ON user_team_assignments(user_id);
CREATE INDEX idx_user_team_assignments_team_id ON user_team_assignments(team_id);

-- ============================================================================
-- GROUPS TABLE
-- ============================================================================
CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT '#3B82F6',
  icon_url TEXT,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_groups_owner_id ON groups(owner_id);
CREATE INDEX idx_groups_is_active ON groups(is_active);
CREATE INDEX idx_groups_deleted_at ON groups(deleted_at);

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  color VARCHAR(20),
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_team_id ON projects(team_id);
CREATE INDEX idx_projects_group_id ON projects(group_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at);

-- ============================================================================
-- MILESTONES TABLE
-- ============================================================================
CREATE TABLE milestones (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL DEFAULT 'milestone' CHECK (type IN ('milestone', 'sprint')),
  status VARCHAR(20) NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  icon_url TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_milestones_created_by ON milestones(created_by);
CREATE INDEX idx_milestones_type ON milestones(type);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_milestones_deleted_at ON milestones(deleted_at);

-- ============================================================================
-- TASKS TABLE
-- ============================================================================
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
  milestone_id INTEGER REFERENCES milestones(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'in_progress', 'in_review', 'done')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  tag_label VARCHAR(50),
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  estimated_hours DECIMAL(10, 2),
  actual_hours DECIMAL(10, 2),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_group_id ON tasks(group_id);
CREATE INDEX idx_tasks_milestone_id ON tasks(milestone_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_deleted_at ON tasks(deleted_at);

-- ============================================================================
-- TASK_ASSIGNEES TABLE (Many-to-Many for multiple assignees)
-- ============================================================================
CREATE TABLE task_assignees (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(task_id, user_id)
);

CREATE INDEX idx_task_assignees_task_id ON task_assignees(task_id);
CREATE INDEX idx_task_assignees_user_id ON task_assignees(user_id);

-- ============================================================================
-- COMMENTS TABLE
-- ============================================================================
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_deleted_at ON comments(deleted_at);

-- ============================================================================
-- ATTACHMENTS TABLE
-- ============================================================================
CREATE TABLE attachments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_attachments_task_id ON attachments(task_id);
CREATE INDEX idx_attachments_user_id ON attachments(user_id);
CREATE INDEX idx_attachments_deleted_at ON attachments(deleted_at);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  related_task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  related_project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_related_task_id ON notifications(related_task_id);
CREATE INDEX idx_notifications_related_project_id ON notifications(related_project_id);
CREATE INDEX idx_notifications_deleted_at ON notifications(deleted_at);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE groups IS 'Top-level organization entities for projects';
COMMENT ON TABLE milestones IS 'Milestones or sprints within projects for tracking progress';
COMMENT ON TABLE task_assignees IS 'Many-to-many relationship table for task assignments to multiple users';
COMMENT ON COLUMN groups.is_active IS 'Soft activation flag for groups';
COMMENT ON COLUMN milestones.type IS 'Distinguishes between milestone and sprint';
COMMENT ON COLUMN tasks.assigned_to IS 'Deprecated: Use task_assignees table for multiple assignees';

-- ============================================================================
-- INITIAL DATA (Optional - for development/testing)
-- ============================================================================

-- Note: Passwords should be hashed with bcrypt before inserting
-- These are just examples - you should run the seed script instead
-- or use the application's registration endpoint

-- Initial success message
DO $$
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Aether Database Initialized Successfully!';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - users';
  RAISE NOTICE '  - teams';
  RAISE NOTICE '  - groups';
  RAISE NOTICE '  - projects';
  RAISE NOTICE '  - milestones';
  RAISE NOTICE '  - tasks';
  RAISE NOTICE '  - task_assignees';
  RAISE NOTICE '  - comments';
  RAISE NOTICE '  - attachments';
  RAISE NOTICE '  - notifications';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Run: npm run seed (to populate test data)';
  RAISE NOTICE '  2. Start backend: npm run dev';
  RAISE NOTICE '  3. Start frontend: cd frontend && npm run dev';
  RAISE NOTICE '================================================';
END $$;
