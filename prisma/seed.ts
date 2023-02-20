import { PrismaClient, Section, Task } from '@prisma/client';
const prisma = new PrismaClient();

const main = async () => {
  const projects = await prisma.project.create({
    data: {
      name: 'Yata API',
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
      { content: 'Create controllers', projectId: projects.id },
      { content: 'Create services', projectId: projects.id },
      { content: 'e2e tests', projectId: projects.id },
    ] as Task[],
  });
};

main()
  .then(() => {
    console.log('Seeded the database');
  })
  .catch((error) => {
    console.error(error);
  });
