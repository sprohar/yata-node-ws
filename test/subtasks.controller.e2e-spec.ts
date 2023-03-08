import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateSubtaskDto } from '../src/subtasks/dto/create-subtask.dto';
import { UpdateSubtaskDto } from '../src/subtasks/dto/update-subtask.dto';
import { CreateTaskDto } from '../src/tasks/dto/create-task.dto';

describe('SubtasksController', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let projectId: number;
  let taskId: number;
  let subtaskId: number;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
  });

  beforeEach(async () => {
    prismaService = app.get(PrismaService);
    const project = await prismaService.project.create({
      data: {
        name: 'Project 1',
      },
    });
    projectId = project.id;

    const task = await prismaService.task.create({
      select: {
        id: true,
      },
      data: {
        title: 'Task 1',
        projectId: project.id,
        subtasks: {
          create: [
            {
              title: 'Subtask 1',
            },
            {
              title: 'Subtask 2',
            },
          ],
        },
      },
    });

    taskId = task.id;

    const subtask = await prismaService.subtask.findFirst({
      select: {
        id: true,
      },
      where: {
        taskId: task.id,
      },
    });

    subtaskId = subtask.id;
  });

  afterEach(async () => {
    const prisma = app.get(PrismaService);
    await prisma.project.deleteMany();
  });

  describe('[GET] Get Subtasks', () => {
    let taskId: number;

    beforeEach(async () => {
      const createTaskDto: CreateTaskDto = {
        projectId,
        title: 'Task',
      };

      const res = await request(app.getHttpServer())
        .post(`/tasks`)
        .send(createTaskDto);

      taskId = res.body.id;

      const createSubtaskDto: CreateSubtaskDto = {
        title: 'Subtask',
        taskId,
      };

      await request(app.getHttpServer())
        .post(`/tasks/${taskId}/subtasks`)
        .send(createSubtaskDto);
    });

    it('should return a paginated list of subtasks', async () => {
      const res = await request(app.getHttpServer()).get(
        `/tasks/${taskId}/subtasks`,
      );

      expect(res.body).toBeDefined();
    });
  });

  describe('[POST] Create a Subtask', () => {
    it('should return 400 Bad Request when the parent task does not exist', async () => {
      const createSubtaskDto: CreateSubtaskDto = {
        title: 'Subtask',
        taskId: 0,
      };

      const res = await request(app.getHttpServer())
        .post(`/tasks/${taskId}/subtasks`)
        .send(createSubtaskDto);

      expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
    });

    it('should create a new Subtask', async () => {
      const createSubtaskDto: CreateSubtaskDto = {
        title: 'Subtask',
        taskId: taskId,
      };

      const res = await request(app.getHttpServer())
        .post(`/tasks/${taskId}/subtasks`)
        .send(createSubtaskDto);

      expect(res.status).toEqual(HttpStatus.CREATED);
    });
  });

  describe('[GET] Get Subtask by Id', () => {
    it('should return 404 Not Found', async () => {
      const res = await request(app.getHttpServer()).get(
        `/tasks${taskId}/subtasks/${subtaskId}`,
      );

      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should return a Subtask', async () => {
      const res = await request(app.getHttpServer()).get(
        `/tasks/${taskId}/subtasks/${subtaskId}`,
      );

      expect(res.body).toBeDefined();
      expect(res.status).toEqual(HttpStatus.OK);
    });
  });

  describe('[PATCH] Update a Subtask', () => {
    it('should return 404 Not Found', async () => {
      const updateSubtaskDto: UpdateSubtaskDto = {
        completed: true,
        taskId,
      };

      const res = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}/subtasks/0`)
        .send(updateSubtaskDto);

      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should return the updated Subtask', async () => {
      const updateSubtaskDto: UpdateSubtaskDto = {
        completed: true,
        taskId,
      };

      const res = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}/subtasks/${subtaskId}`)
        .send(updateSubtaskDto);

      expect(res.status).toEqual(HttpStatus.OK);
    });
  });

  describe('DELETE /subtasks/:id', () => {
    it('should return 404 Not Found', async () => {
      const res = await request(app.getHttpServer()).delete(
        `/tasks${taskId}/subtasks/0`,
      );

      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should return 204 No Content when a Subtask was deleted', async () => {
      const res = await request(app.getHttpServer()).delete(
        `/tasks/${taskId}/subtasks/${subtaskId}`,
      );

      expect(res.status).toEqual(HttpStatus.NO_CONTENT);
    });
  });
});
