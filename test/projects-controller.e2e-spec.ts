import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateProjectDto } from '../src/projects/dto/create-project.dto';
import { UpdateProjectDto } from '../src/projects/dto/update-project.dto';
import { Project } from '../src/projects/entities/project.entity';

describe('ProjectsController (e2e)', () => {
  const path = '/projects';
  let app: INestApplication;

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

  describe('POST /projects', () => {
    describe('Validation', () => {
      it('should throw BadRequestException when required fields are omitted', async () => {
        const res = await request(app.getHttpServer()).post(path);
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
      it('should throw BadRequestException when the "name" exceeds the max length', async () => {
        const createProjectDto: CreateProjectDto = {
          name: new Array<string>(Project.Name.MAX_LENGTH + 2).join(''),
        };
        const res = await request(app.getHttpServer())
          .post(path)
          .send(createProjectDto);
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
      it('should throw BadRequestException when the "view" is not an enum value', async () => {
        const res = await request(app.getHttpServer()).post(path).send({
          name: 'e2e tests are fun',
          view: 'NOT a VIEW',
        });
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it('should create a new Project', async () => {
      const res = await request(app.getHttpServer())
        .post(path)
        .send({
          name: 'e2e tests are fun',
        } as CreateProjectDto);

      expect(res.status).toEqual(HttpStatus.CREATED);
    });
  });

  describe('GET /projects', () => {
    it('should return a "Paginated List" of projects', async () => {
      const res = await request(app.getHttpServer()).get(path);

      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /projects/:id', () => {
    describe('Validation', () => {
      it('should throw BadRequestException when the "id" is not a number', async () => {
        const res = await request(app.getHttpServer()).get(`${path}/abc`);
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it('should return 404 Not Found', async () => {
      const res = await request(app.getHttpServer()).get(`${path}/0`);
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });
  });

  describe('PUT /projects/:id', () => {
    describe('Validation', () => {
      it('should throw BadRequestException when the "id" is not a number', async () => {
        const res = await request(app.getHttpServer())
          .put(`${path}/abc`)
          .send({ name: 'foo' } as UpdateProjectDto);
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it('should return 404 Not Found', async () => {
      const res = await request(app.getHttpServer())
        .put(`${path}/0`)
        .send({ name: 'foo' } as UpdateProjectDto);
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should update a Project', async () => {
      const createProjectDto: CreateProjectDto = { name: 'Foo' };
      const updateProjectDto: UpdateProjectDto = { name: 'Bar' };
      const prisma = app.get(PrismaService);
      const project = await prisma.project.create({ data: createProjectDto });
      const res = await request(app.getHttpServer())
        .put(`${path}/${project.id}`)
        .send(updateProjectDto);

      expect(res.status).toEqual(HttpStatus.OK);
    });
  });

  describe('DELETE /projects/:id', () => {
    describe('Validation', () => {
      it('should throw BadRequestException when the "id" is not a number', async () => {
        const res = await request(app.getHttpServer()).delete(`${path}/abc`);
        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    it('should return 404 Not Found', async () => {
      const res = await request(app.getHttpServer()).delete(`${path}/0`);
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should delete a Project', async () => {
      const createProjectDto: CreateProjectDto = { name: 'Foo' };
      const updateProjectDto: UpdateProjectDto = { name: 'Bar' };
      const prisma = app.get(PrismaService);
      const project = await prisma.project.create({ data: createProjectDto });
      const res = await request(app.getHttpServer())
        .delete(`${path}/${project.id}`)
        .send(updateProjectDto);

      expect(res.status).toEqual(HttpStatus.NO_CONTENT);
    });
  });
});
