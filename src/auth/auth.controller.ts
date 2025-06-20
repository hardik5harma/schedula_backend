import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: any) {
    // dto: { email, password, role, ...doctorFields | ...patientFields }
    return this.authService.signup(dto);
  }

  @Post('signin')
  signin(@Body() dto: { email: string; password: string }) {
    return this.authService.signin(dto);
  }

  @Post('signout')
  signout(@Body('doctorId') doctorId: number) {
    return this.authService.signout(doctorId);
  }

  @Post('refresh')
  refresh(@Body() dto: { doctorId: number; refreshToken: string }) {
    return this.authService.refresh(dto.doctorId, dto.refreshToken);
  }
} 