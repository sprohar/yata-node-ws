import { PrismaClient, Section } from '@prisma/client';
import { ArgonService } from '../src/iam/hashing/argon.service';
import { Priority } from '../src/tasks/enum/priority.enum';

const prisma = new PrismaClient();
const argon = new ArgonService();

function getDueDates() {
  const today = new Date();
  today.setHours(23);
  today.setMinutes(59);
  today.setSeconds(59);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return {
    dayAfterTomorrow,
    nextWeek,
    today,
    tomorrow,
  };
}

async function main() {
  const { dayAfterTomorrow, nextWeek, today, tomorrow } = getDueDates();
  const pwd = await argon.hash('password');
  const user = await prisma.user.create({
    data: {
      email: 'testuser@yata.app',
      pwd,
    },
  });

  const projectYataApi = await prisma.project.create({
    data: {
      name: 'Yata API',
      userId: user.id,
      sections: {
        create: [
          { name: 'To-Do' },
          { name: 'In Progress' },
          { name: 'Testing' },
        ] as Section[],
      },
    },
  });

  const projectYataSpa = await prisma.project.create({
    data: {
      name: 'Yata SPA',
      userId: user.id,
      sections: {
        create: [
          { name: 'To-Do' },
          { name: 'In Progress' },
          { name: 'Testing' },
        ] as Section[],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Task with subtasks',
      projectId: projectYataApi.id,
      userId: user.id,
      subtasks: {
        createMany: {
          data: [
            {
              title: 'Subtask 1',
              projectId: projectYataApi.id,
              userId: user.id,
            },
            {
              title: 'Subtask 2',
              projectId: projectYataApi.id,
              userId: user.id,
            },
            {
              title: 'Subtask 3',
              projectId: projectYataApi.id,
              userId: user.id,
            },
          ],
        },
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Task with subtasks',
      projectId: projectYataSpa.id,
      userId: user.id,
      subtasks: {
        createMany: {
          data: [
            {
              title: 'Subtask 1',
              projectId: projectYataSpa.id,
              userId: user.id,
            },
            {
              title: 'Subtask 2',
              projectId: projectYataSpa.id,
              userId: user.id,
            },
            {
              title: 'Subtask 3',
              projectId: projectYataSpa.id,
              userId: user.id,
            },
          ],
        },
      },
    },
  });

  // Create 20 tasks for project 1
  await prisma.task.createMany({
    data: [
      {
        title: 'Create controllers',
        projectId: projectYataApi.id,
        sectionId: 3,
        userId: user.id,
        dueDate: today,
      },
      {
        title: 'Create services',
        projectId: projectYataApi.id,
        sectionId: 2,
        userId: user.id,
        dueDate: today,
      },
      {
        title: 'e2e tests',
        projectId: projectYataApi.id,
        sectionId: 1,
        userId: user.id,
        dueDate: today,
      },
      {
        title: 'High priority task 1',
        projectId: projectYataApi.id,
        sectionId: 2,
        userId: user.id,
        priority: Priority.HIGH,
        dueDate: today,
      },
      {
        title: 'High priority task 2',
        projectId: projectYataApi.id,
        sectionId: 2,
        userId: user.id,
        priority: Priority.HIGH,
        dueDate: today,
      },
      {
        title: 'High priority task 3',
        projectId: projectYataApi.id,
        sectionId: 2,
        userId: user.id,
        priority: Priority.HIGH,
        dueDate: today,
      },
      {
        title: 'High priority task 4',
        projectId: projectYataApi.id,
        sectionId: 2,
        userId: user.id,
        priority: Priority.HIGH,
        dueDate: tomorrow,
      },
      {
        title: 'High priority task 5',
        projectId: projectYataApi.id,
        sectionId: 2,
        userId: user.id,
        priority: Priority.HIGH,
        dueDate: tomorrow,
      },
      {
        title: 'High priority task 6',
        projectId: projectYataApi.id,
        sectionId: 2,
        userId: user.id,
        priority: Priority.HIGH,
        dueDate: tomorrow,
      },
      {
        title: 'Medium priority task 1',
        projectId: projectYataApi.id,
        sectionId: 1,
        userId: user.id,
        priority: Priority.MEDIUM,
        dueDate: dayAfterTomorrow,
        content: 'This can wait until next week',
      },
      {
        title: 'Medium priority task 2',
        projectId: projectYataApi.id,
        sectionId: 1,
        userId: user.id,
        priority: Priority.MEDIUM,
        dueDate: dayAfterTomorrow,
        content: 'This can wait until next week',
      },
      {
        title: 'Medium priority task 3',
        projectId: projectYataApi.id,
        sectionId: 1,
        userId: user.id,
        priority: Priority.MEDIUM,
        dueDate: dayAfterTomorrow,
        content: 'This can wait until next week',
      },
      {
        title: 'Medium priority task 4',
        projectId: projectYataApi.id,
        sectionId: 1,
        userId: user.id,
        priority: Priority.MEDIUM,
        dueDate: nextWeek,
        content: 'This can wait until next week',
      },
      {
        title: 'Medium priority task 5',
        projectId: projectYataApi.id,
        sectionId: 1,
        userId: user.id,
        priority: Priority.MEDIUM,
        dueDate: nextWeek,
        content: 'This can wait until next week',
      },
      {
        title: 'Medium priority task 6',
        projectId: projectYataApi.id,
        sectionId: 1,
        userId: user.id,
        priority: Priority.MEDIUM,
        dueDate: nextWeek,
        content: 'This can wait until next week',
      },
      {
        title: 'Low priority task 1',
        projectId: projectYataApi.id,
        sectionId: 3,
        userId: user.id,
        priority: Priority.LOW,
      },
      {
        title: 'Low priority task 2',
        projectId: projectYataApi.id,
        sectionId: 3,
        userId: user.id,
        priority: Priority.LOW,
      },
      {
        title: 'Low priority task 3',
        projectId: projectYataApi.id,
        sectionId: 3,
        userId: user.id,
        priority: Priority.LOW,
      },
      {
        title: 'Low priority task 4',
        projectId: projectYataApi.id,
        sectionId: 3,
        userId: user.id,
        priority: Priority.LOW,
      },
      {
        title: 'Low priority task 5',
        projectId: projectYataApi.id,
        sectionId: 3,
        userId: user.id,
        priority: Priority.LOW,
      },
    ],
  });

  // Create 20 tasks for project 2
  await prisma.task.createMany({
    data: [
      {
        title: 'SPA: Create controllers',
        projectId: projectYataSpa.id,
        sectionId: 4,
        userId: user.id,
        dueDate: today,
      },
      {
        title: 'SPA: Create services',
        projectId: projectYataSpa.id,
        sectionId: 4,
        userId: user.id,
        dueDate: today,
      },
      {
        title: 'SPA: e2e tests',
        projectId: projectYataSpa.id,
        sectionId: 4,
        userId: user.id,
        dueDate: today,
      },
      {
        title: 'High priority task 1',
        projectId: projectYataSpa.id,
        sectionId: 5,
        userId: user.id,
        priority: Priority.HIGH,
        dueDate: today,
      },
      {
        title: 'High priority task 2',
        projectId: projectYataSpa.id,
        sectionId: 5,
        userId: user.id,
        priority: Priority.HIGH,
        dueDate: today,
      },
      {
        title: 'High priority task 3',
        projectId: projectYataSpa.id,
        sectionId: 5,
        userId: user.id,
        priority: Priority.HIGH,
        dueDate: today,
      },
      {
        title: 'High priority task 4',
        projectId: projectYataSpa.id,
        sectionId: 5,
        userId: user.id,
        priority: Priority.HIGH,
        dueDate: tomorrow,
      },
      {
        title: 'High priority task 5',
        projectId: projectYataSpa.id,
        sectionId: 6,
        userId: user.id,
        priority: Priority.HIGH,
        dueDate: tomorrow,
      },
      {
        title: 'High priority task 6',
        projectId: projectYataSpa.id,
        sectionId: 4,
        userId: user.id,
        priority: Priority.HIGH,
        dueDate: tomorrow,
      },
      {
        title: 'Medium priority task 1',
        projectId: projectYataSpa.id,
        sectionId: 4,
        userId: user.id,
        priority: Priority.MEDIUM,
        dueDate: dayAfterTomorrow,
        content: 'This can wait until next week',
      },
      {
        title: 'Medium priority task 2',
        projectId: projectYataSpa.id,
        sectionId: 5,
        userId: user.id,
        priority: Priority.MEDIUM,
        dueDate: dayAfterTomorrow,
        content: 'This can wait until next week',
      },
      {
        title: 'Medium priority task 3',
        projectId: projectYataSpa.id,
        sectionId: 6,
        userId: user.id,
        priority: Priority.MEDIUM,
        dueDate: dayAfterTomorrow,
        content: 'This can wait until next week',
      },
      {
        title: 'Medium priority task 4',
        projectId: projectYataSpa.id,
        sectionId: 4,
        userId: user.id,
        priority: Priority.MEDIUM,
        dueDate: nextWeek,
        content: 'This can wait until next week',
      },
      {
        title: 'Medium priority task 5',
        projectId: projectYataSpa.id,
        sectionId: 4,
        userId: user.id,
        priority: Priority.MEDIUM,
        dueDate: nextWeek,
        content: 'This can wait until next week',
      },
      {
        title: 'Medium priority task 6',
        projectId: projectYataSpa.id,
        sectionId: 6,
        userId: user.id,
        priority: Priority.MEDIUM,
        dueDate: nextWeek,
        content: 'This can wait until next week',
      },
      {
        title: 'Low priority task 1',
        projectId: projectYataSpa.id,
        sectionId: 6,
        userId: user.id,
        priority: Priority.LOW,
      },
      {
        title: 'Low priority task 2',
        projectId: projectYataSpa.id,
        sectionId: 5,
        userId: user.id,
        priority: Priority.LOW,
      },
      {
        title: 'Low priority task 3',
        projectId: projectYataSpa.id,
        sectionId: 6,
        userId: user.id,
        priority: Priority.LOW,
      },
      {
        title: 'Low priority task 4',
        projectId: projectYataSpa.id,
        sectionId: 4,
        userId: user.id,
        priority: Priority.LOW,
      },
      {
        title: 'Low priority task 5',
        projectId: projectYataSpa.id,
        sectionId: 4,
        userId: user.id,
        priority: Priority.LOW,
      },
    ],
  });

  // await prisma.task.createMany({
  //   data: [
  //     {
  //       title: 'Project Activities',
  //       parentId: 1,
  //     },
  //     {
  //       title: 'Task Activities',
  //       parentId: 1,
  //     },
  //     {
  //       title: 'Tags',
  //       parentId: 1,
  //     },
  //   ],
  // });

  await prisma.tag.create({
    data: {
      name: 'C++',
      userId: user.id,
      tasks: {
        connect: [
          { id: 1 },
          { id: 2 },
          { id: 3 },
          { id: 21 },
          { id: 22 },
          { id: 23 },
        ],
      },
    },
  });

  await prisma.tag.create({
    data: {
      name: 'Java',
      userId: user.id,
      tasks: {
        connect: [
          { id: 4 },
          { id: 5 },
          { id: 6 },
          { id: 24 },
          { id: 25 },
          { id: 26 },
        ],
      },
    },
  });

  await prisma.tag.create({
    data: {
      name: 'TypeScript',
      userId: user.id,
      tasks: {
        connect: [
          { id: 7 },
          { id: 8 },
          { id: 9 },
          { id: 27 },
          { id: 28 },
          { id: 29 },
        ],
      },
    },
  });

  await prisma.tag.create({
    data: {
      name: 'SQL',
      userId: user.id,
      tasks: {
        connect: [
          { id: 10 },
          { id: 11 },
          { id: 12 },
          { id: 30 },
          { id: 31 },
          { id: 32 },
        ],
      },
    },
  });
}

main()
  .then(() => {
    console.log('Seeded the database');
  })
  .catch((error) => {
    console.error(error);
  });
