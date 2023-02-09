import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Task } from '../src/tasks/entities/task.entity';
import { CreateTaskDto } from '../src/tasks/dto/create-task.dto';

describe('TasksController', () => {
  const path = '/tasks';
  let app: INestApplication;
  let projectId: number;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // strip props that are not defined in the DTO class
        transform: true,
      }),
    );
    await app.init();
  });

  beforeEach(async () => {
    const res = await request(app.getHttpServer())
      .post('/projects')
      .send({ name: 'Test Project' });
    projectId = Number.parseInt(res.body.id, 10);
  });

  afterEach(async () => {
    const prisma = app.get(PrismaService);
    await prisma.project.deleteMany();
  });

  describe('POST /tasks', () => {
    describe('Validation', () => {
      it('should return 400 when given an invalid priority value', async () => {
        const res = await request(app.getHttpServer()).post(path).send({
          name: 'Task',
          projectId: 0,
          priority: '0',
        });
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });

      it('should return 400 when given an invalid date', async () => {
        const res = await request(app.getHttpServer()).post(path).send({
          name: 'Task',
          projectId,
          dueDate: '10-10-2010',
        });
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });

      it('should return 400 when given the name is too long', async () => {
        const res = await request(app.getHttpServer())
          .post(path)
          .send({
            name: ' '.repeat(Task.Name.MAX_LENGTH + 1),
            projectId,
          });
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });

      it('should return 400 when given the description is too long', async () => {
        const res = await request(app.getHttpServer())
          .post(path)
          .send({
            name: 'Task',
            projectId,
            description: ' '.repeat(Task.Description.MAX_LENGTH + 1),
          });
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it('should throw NotFoundException when the project does not exist', async () => {
      const createTaskDto: CreateTaskDto = {
        name: 'Task',
        projectId: 0,
      };

      const res = await request(app.getHttpServer())
        .post(path)
        .send(createTaskDto);
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should create a new Task', async () => {
      const createTaskDto: CreateTaskDto = {
        name: 'Task',
        projectId,
      };

      const res = await request(app.getHttpServer())
        .post(path)
        .send(createTaskDto);
      expect(res.status).toEqual(HttpStatus.CREATED);
    });
  });

  describe('GET /tasks/:id', () => {
    let taskId: number;

    beforeEach(async () => {
      const res = await request(app.getHttpServer()).post(path).send({
        name: 'Tasked',
        projectId,
      });
      taskId = Number.parseInt(res.body.id, 10);
    });

    it('should return 404', async () => {
      const res = await request(app.getHttpServer()).get(`${path}/0`);
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should return a Task', async () => {
      const res = await request(app.getHttpServer()).get(`${path}/${taskId}`);
      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body).toBeDefined();
    });
  });

  describe('DELETE /tasks/:id', () => {
    let taskId: number;

    beforeEach(async () => {
      const res = await request(app.getHttpServer()).post(path).send({
        name: 'Tasked',
        projectId,
      });
      taskId = Number.parseInt(res.body.id, 10);
    });

    it('should return 404', async () => {
      const res = await request(app.getHttpServer()).delete(`${path}/0`);
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should delete a Task', async () => {
      const res = await request(app.getHttpServer()).delete(
        `${path}/${taskId}`,
      );
      expect(res.status).toEqual(HttpStatus.NO_CONTENT);
    });
  });

  describe('PUT /tasks/:id', () => {
    let taskId: number;

    beforeEach(async () => {
      const res = await request(app.getHttpServer()).post(path).send({
        name: 'Tasked',
        projectId,
      });
      taskId = Number.parseInt(res.body.id, 10);
    });

    it('should return 404', async () => {
      const res = await request(app.getHttpServer()).put(`${path}/0`);
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should update a Task', async () => {
      const res = await request(app.getHttpServer())
        .put(`${path}/${taskId}`)
        .send({ name: 'Updated via PUT' });
      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body).toBeDefined()
    });
  });

  describe('GET /tasks', () => {
    it.todo('should return paginated list of Tasks with the given priority')
    it.todo('should return paginated list of Tasks within the given date period')
    it.todo('should return paginated list of Tasks within the given labels')
  })
});
