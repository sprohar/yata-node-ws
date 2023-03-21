import { PrismaClient, Section } from '@prisma/client';
import { Task } from '../src/tasks/entities/task.entity';
import { ArgonService } from '../src/iam/hashing/argon.service';
const prisma = new PrismaClient();
const argon = new ArgonService();

const main = async () => {
  const pwd = await argon.hash('password');
  const user = await prisma.user.create({
    data: {
      email: 'daniel@sprohar.dev',
      pwd,
    },
  });

  const projects = await prisma.project.create({
    data: {
      name: 'Yata API',
      userId: user.id,
      sections: {
        create: [
          { name: 'To-Do' },
          { name: 'In Progress' },
          { name: 'Testing' },
          { name: 'Complete' },
        ] as Section[],
      },
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Create controllers',
        projectId: projects.id,
        sectionId: 4,
        userId: user.id,
      },
      {
        title: 'Create services',
        projectId: projects.id,
        sectionId: 4,
        userId: user.id,
      },
      {
        title: 'e2e tests',
        projectId: projects.id,
        sectionId: 4,
        userId: user.id,
      },
      {
        title: 'High priority task 3',
        projectId: projects.id,
        sectionId: 2,
        userId: user.id,
        priority: Task.Priority.HIGH,
      },
      {
        title: 'High priority task 3',
        projectId: projects.id,
        sectionId: 2,
        userId: user.id,
        priority: Task.Priority.HIGH,
      },
      {
        title: 'High priority task 3',
        projectId: projects.id,
        sectionId: 2,
        userId: user.id,
        priority: Task.Priority.HIGH,
      },
      {
        title: 'Medium priority task 1',
        projectId: projects.id,
        sectionId: 1,
        userId: user.id,
        priority: Task.Priority.MEDIUM,
      },
      {
        title: 'Medium priority task 2',
        projectId: projects.id,
        sectionId: 1,
        userId: user.id,
        priority: Task.Priority.MEDIUM,
      },
      {
        title: 'Medium priority task 3',
        projectId: projects.id,
        sectionId: 1,
        userId: user.id,
        priority: Task.Priority.MEDIUM,
      },
      {
        title: 'Low priority task 3',
        projectId: projects.id,
        sectionId: 3,
        userId: user.id,
        priority: Task.Priority.LOW,
      },
      {
        title: 'Low priority task 3',
        projectId: projects.id,
        sectionId: 3,
        userId: user.id,
        priority: Task.Priority.LOW,
      },
      {
        title: 'Low priority task 3',
        projectId: projects.id,
        sectionId: 3,
        userId: user.id,
        priority: Task.Priority.LOW,
      },
      {
        title: 'Low priority task 3',
        projectId: projects.id,
        sectionId: 3,
        userId: user.id,
        priority: Task.Priority.LOW,
      },
    ],
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: 'Project Activities',
        taskId: 1,
      },
      {
        title: 'Task Activities',
        taskId: 1,
      },
      {
        title: 'Tags',
        taskId: 1,
      },
    ],
  });
};

main()
  .then(() => {
    console.log('Seeded the database');
  })
  .catch((error) => {
    console.error(error);
  });
