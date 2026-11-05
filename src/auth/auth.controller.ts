import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service.js';
import { Auth, CurrentUser } from './auth.decorators.js';
import { AuthService } from './auth.service.js';
import type { AuthUser } from './auth.types.js';
import { CurrentUserResponse, LoginDto, LoginResponse } from './login.dto.js';
import { RegisterDto, RegisterResponse } from './register.dto.js';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly users: UsersService,
    private readonly auth: AuthService,
  ) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Register a user',
    description:
      'Email and password. The response contains only the id and email, never the password or its hash.',
  })
  @ApiCreatedResponse({ type: RegisterResponse })
  @ApiBadRequestResponse({
    description: 'Invalid email, weak password or unknown fields.',
  })
  @ApiConflictResponse({
    description: 'Registration could not be completed (generic on purpose).',
  })
  async register(@Body() dto: RegisterDto): Promise<RegisterResponse> {
    const user = await this.users.register(dto.email, dto.password);
    return { id: user.id, email: user.email };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Log in',
    description:
      'Returns a short-lived access token. A wrong password and an unknown email give the same response.',
  })
  @ApiOkResponse({ type: LoginResponse })
  @ApiBadRequestResponse({ description: 'Malformed request body.' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password.' })
  login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.auth.login(dto.email, dto.password);
  }

  @Get('me')
  @Auth()
  @ApiOperation({ summary: 'The current user' })
  @ApiOkResponse({ type: CurrentUserResponse })
  me(@CurrentUser() user: AuthUser): CurrentUserResponse {
    return user;
  }
}
