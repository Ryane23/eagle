import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { FirebaseService } from '../../config/firebase';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserCollection } from '../users/entities/user.entity';
import { AuthTokenCollection } from './entities/auth-token.entity';
import { HospitalsService } from '../hospitals/hospitals.service';

type FirestoreDoc<T extends object> = {
  id: string;
  data: () => T;
};

type FirestoreQuerySnapshot<T extends object> = {
  empty: boolean;
  docs: Array<FirestoreDoc<T>>;
};

function makeSnapshot<T extends object>(
  docs: Array<FirestoreDoc<T>>,
): FirestoreQuerySnapshot<T> {
  return { empty: docs.length === 0, docs };
}

describe('AuthService.login', () => {
  let authService: AuthService;

  const jwtService = {
    sign: jest.fn(),
  } as unknown as JwtService;

  const configService = {
    get: jest.fn(),
  } as unknown as ConfigService;

  const firebaseService = {
    collection: jest.fn(),
    getAuth: jest.fn(),
  } as unknown as FirebaseService;

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: FirebaseService, useValue: firebaseService },
        {
          provide: HospitalsService,
          useValue: { validateUserAssignment: jest.fn() },
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  it('throws UnauthorizedException when user is not found', async () => {
    (firebaseService.collection as jest.Mock).mockImplementation(
      (name: string) => {
        if (name !== UserCollection) throw new Error('Unexpected collection');
        return {
          where: () => ({
            limit: () => ({
              get: async () => makeSnapshot([]),
            }),
          }),
        };
      },
    );

    await expect(
      authService.login({
        email: 'missing@eagles.com',
        password: 'Password@123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws UnauthorizedException when user is inactive', async () => {
    const hashedPassword = await bcrypt.hash('Doctor@123', 10);

    (firebaseService.collection as jest.Mock).mockImplementation(
      (name: string) => {
        if (name !== UserCollection) throw new Error('Unexpected collection');
        return {
          where: () => ({
            limit: () => ({
              get: async () =>
                makeSnapshot([
                  {
                    id: 'user1',
                    data: () =>
                      ({
                        email: 'doctor.nana@eagles.com',
                        password: hashedPassword,
                        isActive: false,
                        role: 'doctor',
                        name: 'Dr. Nana',
                      }) as any,
                  },
                ]),
            }),
          }),
        };
      },
    );

    await expect(
      authService.login({
        email: 'doctor.nana@eagles.com',
        password: 'Doctor@123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws UnauthorizedException when password is invalid', async () => {
    const hashedPassword = await bcrypt.hash('Doctor@123', 10);

    (firebaseService.collection as jest.Mock).mockImplementation(
      (name: string) => {
        if (name !== UserCollection) throw new Error('Unexpected collection');
        return {
          where: () => ({
            limit: () => ({
              get: async () =>
                makeSnapshot([
                  {
                    id: 'user1',
                    data: () =>
                      ({
                        email: 'doctor.nana@eagles.com',
                        password: hashedPassword,
                        isActive: true,
                        role: 'doctor',
                        name: 'Dr. Nana',
                      }) as any,
                  },
                ]),
            }),
          }),
        };
      },
    );

    await expect(
      authService.login({
        email: 'doctor.nana@eagles.com',
        password: 'Wrong@123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns tokens + user (without password) when credentials are valid', async () => {
    const hashedPassword = await bcrypt.hash('Doctor@123', 10);

    (jwtService.sign as jest.Mock)
      .mockReturnValueOnce('access.token')
      .mockReturnValueOnce('refresh.token');

    (configService.get as jest.Mock).mockReturnValue(undefined);

    (firebaseService.collection as jest.Mock).mockImplementation(
      (name: string) => {
        if (name === UserCollection) {
          return {
            where: () => ({
              limit: () => ({
                get: async () =>
                  makeSnapshot([
                    {
                      id: 'user1',
                      data: () =>
                        ({
                          email: 'doctor.nana@eagles.com',
                          password: hashedPassword,
                          isActive: true,
                          role: 'doctor',
                          name: 'Dr. Nana',
                        }) as any,
                    },
                  ]),
              }),
            }),
          };
        }

        if (name === AuthTokenCollection) {
          return {
            doc: () => ({
              id: 'token1',
              set: async () => undefined,
            }),
          };
        }

        throw new Error(`Unexpected collection: ${name}`);
      },
    );

    const result = await authService.login({
      email: 'doctor.nana@eagles.com',
      password: 'Doctor@123',
    });

    expect(result).toEqual(
      expect.objectContaining({
        accessToken: 'access.token',
        refreshToken: 'refresh.token',
        expiresIn: 3600,
        user: expect.objectContaining({
          id: 'user1',
          email: 'doctor.nana@eagles.com',
          role: 'doctor',
          name: 'Dr. Nana',
          isActive: true,
        }),
      }),
    );

    expect((result.user as any).password).toBeUndefined();
  });
});
