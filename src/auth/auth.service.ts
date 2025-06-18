import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Doctor } from '../entities/doctor.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    private jwtService: JwtService,
  ) {}

  async signup(dto: { first_name: string; last_name: string; email: string; password: string; specialization: string; phone_number: string; experience_years?: number; education?: string; clinic_name?: string; available_days?: string[]; available_time_slots?: string[] }) {
    const existing = await this.doctorRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');
    const hash = await bcrypt.hash(dto.password, 10);
    const doctor = this.doctorRepository.create({
      ...dto,
      password: hash,
    });
    await this.doctorRepository.save(doctor);
    return { message: 'Signup successful' };
  }

  async signin(dto: { email: string; password: string }) {
    const doctor = await this.doctorRepository.findOne({ where: { email: dto.email } });
    if (!doctor) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(dto.password, doctor.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const tokens = await this.getTokens(doctor.doctor_id, doctor.email);
    const hashedRefresh = await bcrypt.hash(tokens.refresh_token, 10);
    doctor.hashed_refresh_token = hashedRefresh;
    await this.doctorRepository.save(doctor);
    return tokens;
  }

  async signout(doctorId: number) {
    await this.doctorRepository.update(doctorId, { hashed_refresh_token: undefined });
    return { message: 'Signout successful' };
  }

  async refresh(doctorId: number, refreshToken: string) {
    const doctor = await this.doctorRepository.findOne({ where: { doctor_id: doctorId } });
    if (!doctor || !doctor.hashed_refresh_token) throw new UnauthorizedException('Access Denied');
    const valid = await bcrypt.compare(refreshToken, doctor.hashed_refresh_token);
    if (!valid) throw new UnauthorizedException('Access Denied');
    const tokens = await this.getTokens(doctor.doctor_id, doctor.email);
    doctor.hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 10);
    await this.doctorRepository.save(doctor);
    return tokens;
  }

  async getTokens(doctorId: number, email: string) {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        { sub: doctorId, email },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1h' },
      ),
      this.jwtService.signAsync(
        { sub: doctorId, email },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
      ),
    ]);
    return { access_token, refresh_token };
  }
} 