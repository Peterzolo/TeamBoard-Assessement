import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRole } from '../src/modules/users/entities/user.entity';

describe('Users Filtering (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get auth token (you'll need to adjust this based on your auth setup)
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com', // Adjust with a valid admin user
        password: 'password123', // Adjust with valid password
      });

    if (loginResponse.body.access_token) {
      authToken = loginResponse.body.access_token;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users', () => {
    it('should return all users with default pagination', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'message',
            'Users retrieved successfully',
          );
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter users by role (Admin)', () => {
      return request(app.getHttpServer())
        .get('/users?role=Admin')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          if (res.body.data.length > 0) {
            res.body.data.forEach((user: any) => {
              expect(user.role).toBe('Admin');
            });
          }
        });
    });

    it('should filter users by role (Super-admin)', () => {
      return request(app.getHttpServer())
        .get('/users?role=Super-admin')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          if (res.body.data.length > 0) {
            res.body.data.forEach((user: any) => {
              expect(user.role).toBe('Super-admin');
            });
          }
        });
    });

    it('should filter users by email verification status (verified)', () => {
      return request(app.getHttpServer())
        .get('/users?isEmailVerified=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          if (res.body.data.length > 0) {
            res.body.data.forEach((user: any) => {
              expect(user.isEmailVerified).toBe(true);
            });
          }
        });
    });

    it('should filter users by email verification status (unverified)', () => {
      return request(app.getHttpServer())
        .get('/users?isEmailVerified=false')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          if (res.body.data.length > 0) {
            res.body.data.forEach((user: any) => {
              expect(user.isEmailVerified).toBe(false);
            });
          }
        });
    });

    it('should search users by email', () => {
      return request(app.getHttpServer())
        .get('/users?search=admin')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          if (res.body.data.length > 0) {
            res.body.data.forEach((user: any) => {
              const searchTerm = 'admin';
              const matches =
                user.email.toLowerCase().includes(searchTerm) ||
                (user.firstName &&
                  user.firstName.toLowerCase().includes(searchTerm)) ||
                (user.lastName &&
                  user.lastName.toLowerCase().includes(searchTerm)) ||
                (user.phoneNumber && user.phoneNumber.includes(searchTerm));
              expect(matches).toBe(true);
            });
          }
        });
    });

    it('should filter users by specific email', () => {
      return request(app.getHttpServer())
        .get('/users?email=admin')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          if (res.body.data.length > 0) {
            res.body.data.forEach((user: any) => {
              expect(user.email.toLowerCase()).toContain('admin');
            });
          }
        });
    });

    it('should filter users by first name', () => {
      return request(app.getHttpServer())
        .get('/users?firstName=John')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          if (res.body.data.length > 0) {
            res.body.data.forEach((user: any) => {
              expect(user.firstName.toLowerCase()).toContain('john');
            });
          }
        });
    });

    it('should filter users by last name', () => {
      return request(app.getHttpServer())
        .get('/users?lastName=Doe')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          if (res.body.data.length > 0) {
            res.body.data.forEach((user: any) => {
              expect(user.lastName.toLowerCase()).toContain('doe');
            });
          }
        });
    });

    it('should handle pagination correctly', () => {
      return request(app.getHttpServer())
        .get('/users?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.pagination.page).toBe(1);
          expect(res.body.pagination.totalPages).toBeGreaterThan(0);
          expect(res.body.data.length).toBeLessThanOrEqual(5);
        });
    });

    it('should handle sorting correctly', () => {
      return request(app.getHttpServer())
        .get('/users?sortBy=firstName&sortOrder=asc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          if (res.body.data.length > 1) {
            const firstNames = res.body.data
              .filter((user: any) => user.firstName)
              .map((user: any) => user.firstName.toLowerCase());
            const sortedFirstNames = [...firstNames].sort();
            expect(firstNames).toEqual(sortedFirstNames);
          }
        });
    });

    it('should combine multiple filters', () => {
      return request(app.getHttpServer())
        .get('/users?role=Admin&isEmailVerified=true&page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          if (res.body.data.length > 0) {
            res.body.data.forEach((user: any) => {
              expect(user.role).toBe('Admin');
              expect(user.isEmailVerified).toBe(true);
            });
          }
        });
    });

    it('should handle invalid role gracefully', () => {
      return request(app.getHttpServer())
        .get('/users?role=InvalidRole')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400); // Should return validation error
    });

    it('should handle invalid boolean value gracefully', () => {
      return request(app.getHttpServer())
        .get('/users?isEmailVerified=invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400); // Should return validation error
    });
  });
});
