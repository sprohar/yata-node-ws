import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Task, User } from '@prisma/client';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SignUpDto } from '../src/iam/authentication/dto';
import { PaginatedList } from '../src/interfaces/paginated-list.interface';
import { PrismaService } from '../src/prisma/prisma.service';

function attachAccessToken(req: request.Test, accessToken: string) {
  return req.set('Authorization', `Bearer ${accessToken}`);
}

describe('ChronoController', () => {
  let app: INestApplication;
  let user: User;
  let accessToken: string;
  let prisma: PrismaService;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

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

    prisma = app.get(PrismaService);
    await prisma.project.create({
      data: {
        name: 'Project',
        userId: user.id,
        tasks: {
          createMany: {
            data: [
              {
                title: 'Task 1',
                userId: user.id,
                dueDate: today.toISOString(),
              },
              {
                title: 'Task 2',
                userId: user.id,
                dueDate: today.toISOString(),
              },
              {
                title: 'Task 3',
                userId: user.id,
                dueDate: tomorrow.toISOString(),
              },
              {
                title: 'Task 4',
                userId: user.id,
                dueDate: tomorrow.toISOString(),
              },
            ],
          },
        },
      },
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('#getTasks', () => {
    it("should get today's tasks", async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      const req = request(app.getHttpServer()).get(
        `/chrono/tasks?startDate=${start.toISOString()}&endDate=${end.toISOString()}`,
      );

      const res = await attachAccessToken(req, accessToken);

      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body).toBeDefined();

      const paginatedList: PaginatedList<Task> = res.body;
      expect(paginatedList.data.length).toEqual(2);
    });

    it("should get tomorrow's tasks", async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() + 1);

      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      const req = request(app.getHttpServer()).get(
        `/chrono/tasks?startDate=${start.toISOString()}&endDate=${end.toISOString()}`,
      );

      const res = await attachAccessToken(req, accessToken);

      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body).toBeDefined();

      const paginatedList: PaginatedList<Task> = res.body;
      expect(paginatedList.data.length).toEqual(2);
    });

    it("should get this week's tasks", async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      end.setDate(start.getDate() + 7);

      const req = request(app.getHttpServer()).get(
        `/chrono/tasks?startDate=${start.toISOString()}&endDate=${end.toISOString()}`,
      );

      const res = await attachAccessToken(req, accessToken);

      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body).toBeDefined();

      const paginatedList: PaginatedList<Task> = res.body;
      expect(paginatedList.data.length).toEqual(4);
    });

    it("should get last week's tasks", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const start = new Date(today);
      start.setDate(today.getDate() - 7);

      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      const req = request(app.getHttpServer()).get(
        `/chrono/tasks?startDate=${start.toISOString()}&endDate=${end.toISOString()}`,
      );

      const res = await attachAccessToken(req, accessToken);

      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body).toBeDefined();

      const paginatedList: PaginatedList<Task> = res.body;
      expect(paginatedList.data.length).toEqual(0);
    });
  });
});
