import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const main = async () => {
  const projects = await prisma.project.create({
    data: {
      name: 'Yata API',
      sections: {
        create: [
          { name: 'To-Do'},
          { name: 'In Progress'},
          { name: 'Testing'},
          { name: 'Complete'},
        ]
      }
    },
  });

  await prisma.task.createMany({
    data: [
      { name: 'Create controllers', projectId: projects.id },
      { name: 'Create services', projectId: projects.id },
      { name: 'e2e tests', projectId: projects.id },
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
