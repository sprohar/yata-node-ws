import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SignUpDto } from 'src/iam/authentication/dto';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateSectionDto } from '../src/sections/dto/create-section.dto';
import { UpdateSectionDto } from '../src/sections/dto/update-section.dto';

function attachAccessToken(req: request.Test, accessToken: string) {
  return req.set('Authorization', `Bearer ${accessToken}`);
}

describe('SectionsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let projectId: number;
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
      .post('/authentication/sign-up')
      .send(signUpDto);

    accessToken = res.body.accessToken;

    const userId = res.body.user.id;
    const project = await prisma.project.create({
      data: {
        name: 'Test Project',
        userId,
      },
    });

    projectId = project.id;
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('POST /projects/:projectId/sections', () => {
    it('should return 400 Bad Request when the project does not exist', async () => {
      const createSectionDto: CreateSectionDto = {
        name: 'Section',
        projectId: 0,
      };

      const req = request(app.getHttpServer())
        .post(`/projects/${projectId}/sections`)
        .send(createSectionDto);

      const res = await attachAccessToken(req, accessToken);

      expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
    });

    it('should create a new Section', async () => {
      const createSectionDto: CreateSectionDto = {
        name: 'Section',
        projectId,
      };

      const req = request(app.getHttpServer())
        .post(`/projects/${projectId}/sections`)
        .send(createSectionDto);

      const res = await attachAccessToken(req, accessToken);

      expect(res.status).toEqual(HttpStatus.CREATED);
    });
  });

  describe('GET /projects/:projectId/sections/:sectionId', () => {
    let sectionId: number;

    beforeEach(async () => {
      const section = await prisma.section.create({
        data: {
          name: 'Section',
          projectId,
        },
      });

      sectionId = section.id;
    });

    it('should return 404 Not Found when the Section does not exist', async () => {
      const req = request(app.getHttpServer()).get(
        `/projects/${projectId}/sections/0`,
      );

      const res = await attachAccessToken(req, accessToken);

      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should return a Section', async () => {
      const req = request(app.getHttpServer()).get(
        `/projects/${projectId}/sections/${sectionId}`,
      );

      const res = await attachAccessToken(req, accessToken);

      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body).toBeDefined();
    });
  });

  describe('GET /projects/:projectId/sections/:sectionId', () => {
    let sectionId: number;

    beforeEach(async () => {
      const section = await prisma.section.create({
        data: {
          name: 'Section',
          projectId,
        },
      });

      sectionId = section.id;
    });

    it('should return a list of sections', async () => {
      const req = request(app.getHttpServer()).get(
        `/projects/${projectId}/sections`,
      );

      const res = await attachAccessToken(req, accessToken);

      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body).toBeDefined();
      expect(res.body.length).toEqual(1);
    });
  });

  describe('DELETE /projects/:projectId/sections/:sectionId', () => {
    let sectionId: number;

    beforeEach(async () => {
      const section = await prisma.section.create({
        data: {
          name: 'Section',
          projectId,
        },
      });

      sectionId = section.id;
    });

    it('should return 404 Not Found when the Section does not exist', async () => {
      const req = request(app.getHttpServer()).delete(
        `/projects/${projectId}/sections/0`,
      );

      const res = await attachAccessToken(req, accessToken);
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should return a Section', async () => {
      const req = request(app.getHttpServer()).delete(
        `/projects/${projectId}/sections/${sectionId}`,
      );

      const res = await attachAccessToken(req, accessToken);
      expect(res.status).toEqual(HttpStatus.NO_CONTENT);
      expect(res.body).toBeDefined();
    });
  });

  describe('PATCH /projects/:projectId/sections/:sectionId', () => {
    let sectionId: number;

    beforeEach(async () => {
      const section = await prisma.section.create({
        data: {
          name: 'Section',
          projectId,
        },
      });

      sectionId = section.id;
    });

    it('should return 404 Not Found when the Section does not exist', async () => {
      const updateSectionDto: UpdateSectionDto = { name: 'Section 2.0' };
      const req = request(app.getHttpServer())
        .patch(`/projects/${projectId}/sections/0`)
        .send(updateSectionDto);

      const res = await attachAccessToken(req, accessToken);
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should return a Section', async () => {
      const updateSectionDto: UpdateSectionDto = { name: 'Section 2.0' };
      const req = request(app.getHttpServer())
        .patch(`/projects/${projectId}/sections/${sectionId}`)
        .send(updateSectionDto);

      const res = await attachAccessToken(req, accessToken);
      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body).toBeDefined();
    });
  });
});
