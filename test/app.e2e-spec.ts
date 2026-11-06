import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/app.setup.js';

// Requires a reachable Postgres at DATABASE_URL_TEST (see .env.example).
// test/setup.ts sets CORS_ORIGIN to ALLOWED_ORIGIN.
const ALLOWED_ORIGIN = 'http://localhost:3000';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('health', () => {
    it('GET /api/v1/health returns 200 with the documented body', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect({ status: 'ok' });
    });

    it('is not served without the /api/v1 prefix', async () => {
      await request(app.getHttpServer()).get('/health').expect(404);
      await request(app.getHttpServer()).get('/api/health').expect(404);
    });
  });

  describe('docs', () => {
    it('serves Swagger UI at /api/docs', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/docs')
        .expect(200);
      expect(res.headers['content-type']).toContain('text/html');
    });

    it('lists the health endpoint in the OpenAPI document', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/docs-json')
        .expect(200);
      expect(res.body.openapi).toMatch(/^3\./);
      expect(res.body.paths['/api/v1/health'].get).toBeDefined();
    });
  });

  describe('CORS', () => {
    it('grants access, with credentials, to the configured origin', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/health')
        .set('Origin', ALLOWED_ORIGIN)
        .expect(200);
      expect(res.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('does not grant access to an unconfigured origin', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/health')
        .set('Origin', 'https://evil.example')
        .expect(200);
      // Without Access-Control-Allow-Origin a browser refuses the response. (The
      // cors package still adds Allow-Credentials here, which grants nothing
      // on its own.)
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('answers a preflight only for the configured origin', async () => {
      const allowed = await request(app.getHttpServer())
        .options('/api/v1/health')
        .set('Origin', ALLOWED_ORIGIN)
        .set('Access-Control-Request-Method', 'GET');
      expect(allowed.headers['access-control-allow-origin']).toBe(
        ALLOWED_ORIGIN,
      );

      const denied = await request(app.getHttpServer())
        .options('/api/v1/health')
        .set('Origin', 'https://evil.example')
        .set('Access-Control-Request-Method', 'GET');
      expect(denied.headers['access-control-allow-origin']).toBeUndefined();
    });
  });
});
