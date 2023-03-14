import { PrismaClient, Section } from '@prisma/client';
const prisma = new PrismaClient();

const main = async () => {
  const user = await prisma.user.create({
    data: {
      email: 'daniel@sprohar.dev',
      pwd: 'password@123',
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
        sectionId: 1,
        userId: user.id,
      },
      {
        title: 'Create services',
        projectId: projects.id,
        sectionId: 1,
        userId: user.id,
      },
      {
        title: 'e2e tests',
        projectId: projects.id,
        sectionId: 1,
        userId: user.id,
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
