import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateSubtaskDto } from '../src/subtasks/dto/create-subtask.dto';
import { CreateTaskDto } from '../src/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../src/tasks/dto/update-task.dto';
import { Task } from '../src/tasks/entities/task.entity';

describe('TasksController', () => {
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

    projectId = parseInt(res.body.id);
  });

  afterEach(async () => {
    const prisma = app.get(PrismaService);
    await prisma.project.deleteMany();
  });

  describe('POST /tasks', () => {
    describe('Validation', () => {
      it('should return 400 when given an invalid priority value', async () => {
        const res = await request(app.getHttpServer())
          .post(`/tasks`)
          .send({
            name: 'Task',
            projectId: projectId,
            priority: '0',
          });
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });

      it('should return 400 when given an invalid date', async () => {
        const createTaskDto: CreateTaskDto = {
          title: 'Task',
          projectId,
          dueDate: '10-10-2010',
        };
        const res = await request(app.getHttpServer())
          .post(`/tasks`)
          .send(createTaskDto);
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });

      it('should return 400 when given the Title is too long', async () => {
        const createTaskDto: CreateTaskDto = {
          title: ' '.repeat(Task.Title.MAX_LENGTH + 1),
          projectId,
        };
        const res = await request(app.getHttpServer())
          .post(`/tasks`)
          .send(createTaskDto);
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });

      it('should return 400 when given the Content is too long', async () => {
        const createTaskDto: CreateTaskDto = {
          title: 'Task',
          projectId,
          content: ' '.repeat(Task.Content.MAX_LENGTH + 1),
        };
        const res = await request(app.getHttpServer())
          .post(`/tasks`)
          .send(createTaskDto);
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it('should throw BadRequestException when the project does not exist', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Task',
        projectId: 0,
      };

      const res = await request(app.getHttpServer())
        .post('/tasks')
        .send(createTaskDto);
      expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
    });

    it('should create a new Task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Task',
        projectId,
      };

      const res = await request(app.getHttpServer())
        .post(`/tasks`)
        .send(createTaskDto);
      expect(res.status).toEqual(HttpStatus.CREATED);
    });
  });

  describe('GET /tasks/:taskId', () => {
    let taskId: number;

    beforeEach(async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Mock Task',
        projectId,
      };

      const res = await request(app.getHttpServer())
        .post(`/tasks`)
        .send(createTaskDto);

      taskId = parseInt(res.body.id);
    });

    it('should return 404 when a task does not exist', async () => {
      const res = await request(app.getHttpServer()).get(
        `/tasks/0`,
      );
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should return a Task', async () => {
      const res = await request(app.getHttpServer()).get(
        `/tasks/${taskId}`,
      );
      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body).toBeDefined();
    });
  });

  describe('GET /tasks/:taskId/subtasks', () => {
    let taskId: number;

    beforeEach(async () => {
      const createTaskDto: CreateTaskDto = {
        projectId,
        title: 'Task',
      };

      const res = await request(app.getHttpServer())
        .post('/tasks')
        .send(createTaskDto);

      taskId = res.body.id;

      const createSubtaskDto: CreateSubtaskDto = {
        title: 'Subtask',
        taskId,
      }

      await request(app.getHttpServer()).post('/subtasks').send(createSubtaskDto);
    })

    it('should return a paginated list of subtasks', async () => {
      const res = await request(app.getHttpServer()).get(
        `/tasks/${taskId}/subtasks`,
      );

      expect(res.body).toBeDefined();
    });
  });

  describe('DELETE /tasks/:id', () => {
    let taskId: number;

    beforeEach(async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Mock Task',
        projectId,
      };
      const res = await request(app.getHttpServer())
        .post(`/tasks`)
        .send(createTaskDto);
      taskId = Number.parseInt(res.body.id, 10);
    });

    it('should return 404 when a task does not exist', async () => {
      const res = await request(app.getHttpServer()).delete(
        `/tasks/0`,
      );
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should delete a Task', async () => {
      const res = await request(app.getHttpServer()).delete(
        `/tasks/${taskId}`,
      );
      expect(res.status).toEqual(HttpStatus.NO_CONTENT);
    });
  });

  describe('PATCH /tasks/:id', () => {
    let taskId: number;

    beforeEach(async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Mock Task',
        projectId,
      };

      const res = await request(app.getHttpServer())
        .post(`/tasks`)
        .send(createTaskDto);

      taskId = parseInt(res.body.id);
    });

    it('should return 404 when a task does not exist', async () => {
      const res = await request(app.getHttpServer()).patch(
        `/tasks/0`,
      );

      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should update a Task', async () => {
      const updateTaskDto: UpdateTaskDto = { title: 'Updated via PATCH' };
      const res = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .send(updateTaskDto);

      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body).toBeDefined();
    });
  });

  describe('GET /tasks', () => {
    it.todo('should return paginated list of Tasks with the given priority');
    it.todo(
      'should return paginated list of Tasks within the given date period',
    );
    it.todo('should return paginated list of Tasks within the given labels');
  });
});
