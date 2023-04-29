import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SignUpDto } from '../src/iam/authentication/dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateProjectDto } from '../src/projects/dto/create-project.dto';
import { UpdateProjectDto } from '../src/projects/dto/update-project.dto';
import { Project } from '../src/projects/entities/project.entity';

function attachAccessToken(req: request.Test, accessToken: string) {
  return req.set('Authorization', `Bearer ${accessToken}`);
}

describe('ProjectsController (e2e)', () => {
  const path = '/projects';
  let app: INestApplication;
  let prisma: PrismaService;
  let user: User;
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
    prisma = app.get(PrismaService);

    const signUpDto: SignUpDto = {
      email: 'tester@example.io',
      password: 'password',
    };

    const res = await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send(signUpDto);

    accessToken = res.body.accessToken;
    user = res.body.user;
  });

  afterEach(async () => {
    prisma = app.get(PrismaService);
    await prisma.user.deleteMany();
  });

  describe('POST /projects', () => {
    describe('Validation', () => {
      it('should throw BadRequestException when required fields are omitted', async () => {
        const req = request(app.getHttpServer()).post(path);
        const res = await attachAccessToken(req, accessToken);
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });

      it('should throw BadRequestException when the "name" exceeds the max length', async () => {
        const createProjectDto: CreateProjectDto = {
          name: new Array<string>(Project.Name.MAX_LENGTH + 2).join(''),
        };

        const req = request(app.getHttpServer())
          .post(path)
          .send(createProjectDto);

        const res = await attachAccessToken(req, accessToken);

        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });

      it('should throw BadRequestException when the "view" is not an enum value', async () => {
        const req = request(app.getHttpServer()).post(path).send({
          name: 'e2e tests are fun',
          view: 'NOT a VIEW',
        });

        const res = await attachAccessToken(req, accessToken);
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it('should create a new Project', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'e2e tests are fun',
      };

      const req = request(app.getHttpServer())
        .post(path)
        .send(createProjectDto);

      const res = await attachAccessToken(req, accessToken);

      expect(res.status).toEqual(HttpStatus.CREATED);
    });
  });

  describe('GET /projects', () => {
    it('should return a "Paginated List" of projects', async () => {
      const req = request(app.getHttpServer()).get(path);
      const res = await attachAccessToken(req, accessToken);

      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /projects/:id', () => {
    describe('Validation', () => {
      it('should throw BadRequestException when the "id" is not a number', async () => {
        const req = request(app.getHttpServer()).get(`${path}/abc`);
        const res = await attachAccessToken(req, accessToken);
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it('should return 404 Not Found', async () => {
      const req = request(app.getHttpServer()).get(`${path}/0`);
      const res = await attachAccessToken(req, accessToken);
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /projects/:id', () => {
    describe('Validation', () => {
      it('should throw BadRequestException when the "id" is not a number', async () => {
        const updateProjectDto: UpdateProjectDto = { name: 'Updated' };

        const req = request(app.getHttpServer())
          .patch(`${path}/abc`)
          .send(updateProjectDto);

        const res = await attachAccessToken(req, accessToken);

        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it('should return 404 Not Found', async () => {
      const updateProjectDto: UpdateProjectDto = { name: 'Updated' };

      const req = request(app.getHttpServer())
        .patch(`${path}/0`)
        .send(updateProjectDto);

      const res = await attachAccessToken(req, accessToken);

      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should update a Project', async () => {
      const prisma = app.get(PrismaService);
      const project = await prisma.project.create({
        data: {
          name: 'Project',
          userId: user.id,
        },
      });

      const updateProjectDto: UpdateProjectDto = { name: 'Bar' };
      const req = request(app.getHttpServer())
        .patch(`${path}/${project.id}`)
        .send(updateProjectDto);

      const res = await attachAccessToken(req, accessToken);

      expect(res.status).toEqual(HttpStatus.OK);
    });
  });

  describe('DELETE /projects/:id', () => {
    describe('Validation', () => {
      it('should throw BadRequestException when the "id" is not a number', async () => {
        const req = request(app.getHttpServer()).delete(`${path}/abc`);
        const res = await attachAccessToken(req, accessToken);
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it('should return 404 Not Found', async () => {
      const req = request(app.getHttpServer()).delete(`${path}/0`);
      const res = await attachAccessToken(req, accessToken);
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should delete a Project', async () => {
      const prisma = app.get(PrismaService);
      const project = await prisma.project.create({
        data: {
          name: 'Project',
          userId: user.id,
        },
      });

      const req = request(app.getHttpServer()).delete(`${path}/${project.id}`);
      const res = await attachAccessToken(req, accessToken);

      expect(res.status).toEqual(HttpStatus.NO_CONTENT);
    });
  });
});
