import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async findAll(name?: string, specialization?: string): Promise<Doctor[]> {
    const where: FindOptionsWhere<Doctor> = {};

    if (specialization) {
      where.specialization = ILike(`%${specialization}%`);
    }

    if (name) {
      const nameQuery = [
        { ...where, first_name: ILike(`%${name}%`) },
        { ...where, last_name: ILike(`%${name}%`) },
      ];
      return this.doctorRepository.find({ where: nameQuery });
    }

    return this.doctorRepository.find({ where });
  }

  async findOne(id: number): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({ where: { doctor_id: id } });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return doctor;
  }

  async findByUserId(userId: number): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({ where: { user: { id: userId } }, relations: ['user'] });
    if (!doctor) {
      throw new NotFoundException(`Doctor for user ID ${userId} not found`);
    }
    return doctor;
  }
} 