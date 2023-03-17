import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Project, User } from '@prisma/client';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SignUpDto } from '../src/iam/authentication/dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateTaskDto } from '../src/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../src/tasks/dto/update-task.dto';
import { Task } from '../src/tasks/entities/task.entity';

const resourcePathFrom = (projectId: number, taskId?: number) => {
  const path = `/projects/${projectId}/tasks`;
  if (taskId !== undefined) {
    return `${path}/${taskId}`;
  }

  return path;
};

function attachAccessToken(req: request.Test, accessToken: string) {
  return req.set('Authorization', `Bearer ${accessToken}`);
}

describe('TasksController', () => {
  let app: INestApplication;
  let user: User;
  let project: Project;
  let accessToken: string;

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
    const signUpDto: SignUpDto = {
      email: 'tester@example.io',
      password: 'password',
    };

    const res = await request(app.getHttpServer())
      .post('/authentication/sign-up')
      .send(signUpDto);

    accessToken = res.body.accessToken;
    user = res.body.user;

    project = await app.get(PrismaService).project.create({
      data: {
        name: 'Project',
        userId: user.id,
      },
    });
  });

  afterEach(async () => {
    const prisma = app.get(PrismaService);
    await prisma.user.deleteMany();
  });

  describe('POST Create task', () => {
    describe('Validation', () => {
      it('should return 400 when given an invalid priority value', async () => {
        const req = request(app.getHttpServer())
          .post(resourcePathFrom(project.id))
          .send({
            name: 'Task',
            projectId: project.id,
            priority: 'Invalid Priority Value',
          });

        const res = await attachAccessToken(req, accessToken);

        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });

      it('should return 400 when given an invalid date', async () => {
        const createTaskDto: CreateTaskDto = {
          title: 'Task',
          projectId: project.id,
          dueDate: '10-10-2010',
        };

        const req = request(app.getHttpServer())
          .post(resourcePathFrom(project.id))
          .send(createTaskDto);

        const res = await attachAccessToken(req, accessToken);

        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });

      it('should return 400 when given the Title is too long', async () => {
        const createTaskDto: CreateTaskDto = {
          title: ' '.repeat(Task.Title.MAX_LENGTH + 1),
          projectId: project.id,
        };

        const req = request(app.getHttpServer())
          .post(resourcePathFrom(project.id))
          .send(createTaskDto);

        const res = await attachAccessToken(req, accessToken);

        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });

      it('should return 400 when given the Content is too long', async () => {
        const createTaskDto: CreateTaskDto = {
          title: 'Task',
          projectId: project.id,
          content: ' '.repeat(Task.Content.MAX_LENGTH + 1),
        };
        const req = request(app.getHttpServer())
          .post(resourcePathFrom(project.id))
          .send(createTaskDto);

        const res = await attachAccessToken(req, accessToken);

        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it('should throw BadRequestException when the project does not exist', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Task',
        projectId: 0,
      };

      const req = request(app.getHttpServer())
        .post(resourcePathFrom(createTaskDto.projectId))
        .send(createTaskDto);

      const res = await attachAccessToken(req, accessToken);

      expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
    });

    it('should create a new Task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Task',
        projectId: project.id,
      };

      const req = request(app.getHttpServer())
        .post(resourcePathFrom(project.id))
        .send(createTaskDto);

      const res = await attachAccessToken(req, accessToken);

      expect(res.status).toEqual(HttpStatus.CREATED);
    });
  });

  describe('GET Get task by id', () => {
    let taskId: number;

    beforeEach(async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Mock Task',
        projectId: project.id,
      };

      const req = request(app.getHttpServer())
        .post(resourcePathFrom(project.id))
        .send(createTaskDto);

      const res = await attachAccessToken(req, accessToken);

      taskId = parseInt(res.body.id);
    });

    it('should return 404 when a task does not exist', async () => {
      const taskId = 0;
      const req = request(app.getHttpServer()).get(
        resourcePathFrom(project.id, taskId),
      );

      const res = await attachAccessToken(req, accessToken);

      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should return a Task', async () => {
      const req = request(app.getHttpServer()).get(
        resourcePathFrom(project.id, taskId),
      );

      const res = await attachAccessToken(req, accessToken);

      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body).toBeDefined();
    });
  });

  describe('DELETE Delete a task', () => {
    let taskId: number;

    beforeEach(async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Mock Task',
        projectId: project.id,
      };

      const req = request(app.getHttpServer())
        .post(resourcePathFrom(project.id))
        .send(createTaskDto);

      const res = await attachAccessToken(req, accessToken);

      taskId = parseInt(res.body.id);
    });

    it('should return 404 when a task does not exist', async () => {
      const taskId = 0;
      const req = request(app.getHttpServer()).delete(
        resourcePathFrom(project.id, taskId),
      );

      const res = await attachAccessToken(req, accessToken);
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should delete a Task', async () => {
      const req = request(app.getHttpServer()).delete(
        resourcePathFrom(project.id, taskId),
      );

      const res = await attachAccessToken(req, accessToken);
      expect(res.status).toEqual(HttpStatus.NO_CONTENT);
    });
  });

  describe('PATCH Update task', () => {
    let taskId: number;

    beforeEach(async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Mock Task',
        projectId: project.id,
      };

      const task = await app.get(PrismaService).task.create({
        data: {
          ...createTaskDto,
          userId: user.id,
        },
      });

      taskId = task.id;
    });

    it('should return 404 when a task does not exist', async () => {
      const taskId = 0;
      const req = request(app.getHttpServer()).patch(
        resourcePathFrom(project.id, taskId),
      );

      const res = await attachAccessToken(req, accessToken);

      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should update a Task', async () => {
      const updateTaskDto: UpdateTaskDto = { title: 'Updated via PATCH' };
      const req = request(app.getHttpServer())
        .patch(resourcePathFrom(project.id, taskId))
        .send(updateTaskDto);

      const res = await attachAccessToken(req, accessToken);

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
