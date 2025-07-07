import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../entities/user.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    private jwtService: JwtService,
  ) {}

  async signup(dto: any) {
    // dto: { email, password, role, ...doctorFields | ...patientFields }
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');
    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: dto.email,
      password: hash,
      role: dto.role,
    });
    const savedUser = await this.userRepository.save(user);
    if (dto.role === UserRole.DOCTOR) {
      const doctor = this.doctorRepository.create({
        ...dto,
        email: dto.email,
        user: savedUser,
        password: undefined,
        role: undefined,
      });
      await this.doctorRepository.save(doctor);
    } else if (dto.role === UserRole.PATIENT) {
      const patient = this.patientRepository.create({
        ...dto,
        user: savedUser,
        email: undefined,
        password: undefined,
        role: undefined,
      });
      const savedPatient = await this.patientRepository.save(patient);
      console.log('Created patient:', savedPatient);
    }
    return { message: 'Signup successful' };
  }

  async signin(dto: { email: string; password: string }) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.provider !== 'local') {
      throw new UnauthorizedException('Account is registered via Google. Please login with Google.');
    }
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const tokens = await this.getTokens(user.id, user.email, user.role);
    return { ...tokens, role: user.role };
  }

  async signout(userId: number) {
    await this.userRepository.update(userId, { hashed_refresh_token: undefined });
    return { message: 'Signout successful' };
  }

  async refresh(userId: number, refreshToken: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.hashed_refresh_token) throw new UnauthorizedException('Access Denied');
    const valid = await bcrypt.compare(refreshToken, user.hashed_refresh_token);
    if (!valid) throw new UnauthorizedException('Access Denied');
    const tokens = await this.getTokens(user.id, user.email, user.role);
    user.hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 10);
    await this.userRepository.save(user);
    return tokens;
  }

  async getTokens(userId: number, email: string, role: UserRole) {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1h' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
      ),
    ]);
    return { access_token, refresh_token };
  }

  async validateGoogleUser(email: string, name: string, role: string) {
    let user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      if (user.provider !== 'google') {
        throw new UnauthorizedException('Account is registered via email/password. Please login with email/password.');
      }
      return user;
    }
    // Create new user
    user = this.userRepository.create({
      email,
      name,
      provider: 'google',
      password: undefined,
      role: role as UserRole,
    });
    return this.userRepository.save(user);
  }
} 