import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../config/app-config.service.js';
import { PasswordService } from '../users/password.service.js';
import { UsersService } from '../users/users.service.js';
import type { AccessTokenPayload } from './auth.types.js';
import { durationToSeconds } from './duration.js';

export const INVALID_CREDENTIALS = 'Invalid email or password.';

@Injectable()
export class AuthService implements OnModuleInit {
  /** A real hash of a throwaway value, verified against when the email is unknown. */
  private dummyHash!: string;

  constructor(
    private readonly users: UsersService,
    private readonly passwords: PasswordService,
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.dummyHash = await this.passwords.hash(`dummy-${Math.random()}`);
  }

  /**
   * Verifies the credentials and returns a signed access token.
   *
   * A wrong password and an unknown email give the identical response, and both
   * run one argon2 verification, so neither the body nor the response time
   * reveals whether the email is registered.
   */
  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    const valid = await this.passwords.verify(
      user?.passwordHash ?? this.dummyHash,
      password,
    );
    if (!user || !valid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    const payload: AccessTokenPayload = { sub: user.id };
    return {
      accessToken: await this.jwt.signAsync(payload),
      tokenType: 'Bearer' as const,
      expiresIn: durationToSeconds(this.config.jwtAccessTtl),
    };
  }
}
