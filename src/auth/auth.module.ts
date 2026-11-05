import { Module } from '@nestjs/common';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { AppConfigService } from '../config/app-config.service.js';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.jwtAccessSecret,
        signOptions: {
          algorithm: 'HS256',
          expiresIn: config.jwtAccessTtl as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  // Export what `AuthGuard` needs so any module can use `@Auth()` by importing AuthModule.
  exports: [AuthGuard, JwtModule, UsersModule],
})
export class AuthModule {}
