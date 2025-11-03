import sequelize from '../config/database';
import { User, Team, Project, Task } from './models';
import bcrypt from 'bcrypt';

const seed = async () => {
  try {
    console.log('Starting database seed...');

    await sequelize.sync({ force: false });

    const hashedPassword = await bcrypt.hash('password123', 10);

    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@aether.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
    });

    const managerUser = await User.create({
      username: 'manager',
      email: 'manager@aether.com',
      password: hashedPassword,
      firstName: 'Manager',
      lastName: 'User',
      role: 'manager',
      isActive: true,
    });

    const memberUser1 = await User.create({
      username: 'john_doe',
      email: 'john@aether.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'member',
      isActive: true,
    });

    const memberUser2 = await User.create({
      username: 'jane_smith',
      email: 'jane@aether.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'member',
      isActive: true,
    });

    console.log('✓ Users created');

    const engineeringTeam = await Team.create({
      name: 'Engineering',
      description: 'Software development team',
      ownerId: adminUser.id,
    });

    const designTeam = await Team.create({
      name: 'Design',
      description: 'Product design team',
      ownerId: managerUser.id,
    });

    await engineeringTeam.addMembers([adminUser, managerUser, memberUser1]);
    await designTeam.addMembers([managerUser, memberUser2]);

    console.log('✓ Teams created');

    const project1 = await Project.create({
      name: 'Aether Platform',
      description: 'Core task management platform',
      ownerId: adminUser.id,
      teamId: engineeringTeam.id,
      status: 'active',
    });

    const project2 = await Project.create({
      name: 'Mobile App',
      description: 'Mobile application for Aether',
      ownerId: managerUser.id,
      teamId: engineeringTeam.id,
      status: 'active',
    });

    const project3 = await Project.create({
      name: 'UI Redesign',
      description: 'Complete UI/UX overhaul',
      ownerId: managerUser.id,
      teamId: designTeam.id,
      status: 'planning',
    });

    console.log('✓ Projects created');

    await Task.create({
      projectId: project1.id,
      title: 'Setup authentication system',
      description: 'Implement JWT-based authentication',
      status: 'done',
      priority: 'high',
      tagLabel: 'backend',
      assignedTo: memberUser1.id,
      createdBy: adminUser.id,
      estimatedHours: 8,
      actualHours: 7.5,
      position: 0,
    });

    await Task.create({
      projectId: project1.id,
      title: 'Create user dashboard',
      description: 'Build the main user dashboard with task overview',
      status: 'in_progress',
      priority: 'high',
      tagLabel: 'frontend',
      assignedTo: memberUser1.id,
      createdBy: adminUser.id,
      estimatedHours: 16,
      position: 1,
    });

    await Task.create({
      projectId: project1.id,
      title: 'Implement real-time notifications',
      description: 'Add WebSocket support for real-time updates',
      status: 'in_progress',
      priority: 'medium',
      tagLabel: 'backend',
      assignedTo: memberUser1.id,
      createdBy: managerUser.id,
      estimatedHours: 12,
      position: 2,
    });

    await Task.create({
      projectId: project1.id,
      title: 'Write API documentation',
      description: 'Document all REST API endpoints',
      status: 'ready',
      priority: 'medium',
      tagLabel: 'docs',
      createdBy: adminUser.id,
      estimatedHours: 4,
      position: 3,
    });

    await Task.create({
      projectId: project1.id,
      title: 'Setup CI/CD pipeline',
      description: 'Configure automated testing and deployment',
      status: 'ready',
      priority: 'low',
      tagLabel: 'devops',
      createdBy: adminUser.id,
      estimatedHours: 6,
      position: 4,
    });

    await Task.create({
      projectId: project2.id,
      title: 'Design mobile app wireframes',
      description: 'Create initial wireframes for mobile app',
      status: 'done',
      priority: 'high',
      tagLabel: 'design',
      assignedTo: memberUser2.id,
      createdBy: managerUser.id,
      estimatedHours: 8,
      actualHours: 9,
      position: 0,
    });

    await Task.create({
      projectId: project2.id,
      title: 'Setup React Native project',
      description: 'Initialize React Native project structure',
      status: 'in_progress',
      priority: 'high',
      tagLabel: 'mobile',
      assignedTo: memberUser1.id,
      createdBy: managerUser.id,
      estimatedHours: 4,
      position: 1,
    });

    await Task.create({
      projectId: project3.id,
      title: 'Conduct user research',
      description: 'Interview users about current UI pain points',
      status: 'ready',
      priority: 'high',
      tagLabel: 'research',
      assignedTo: memberUser2.id,
      createdBy: managerUser.id,
      estimatedHours: 16,
      position: 0,
    });

    console.log('✓ Tasks created');

    console.log('\n✓ Database seeded successfully!');
    console.log('\nTest Users:');
    console.log('Admin: admin@aether.com / password123');
    console.log('Manager: manager@aether.com / password123');
    console.log('Member: john@aether.com / password123');
    console.log('Member: jane@aether.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();