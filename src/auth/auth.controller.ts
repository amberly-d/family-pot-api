import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service.js';
import { RegisterDto, RegisterResponse } from './register.dto.js';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly users: UsersService) {}

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
}
