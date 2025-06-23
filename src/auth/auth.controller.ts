import { Body, Controller, Post, Req, UseGuards, Get, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req, @Query('role') role: string) {
    // Passport will handle redirect
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const user = req.user;
    const tokens = await this.authService.getTokens(user.id, user.email, user.role);
    return res.json({ ...tokens, role: user.role });
  }
} 