import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(sbd: string) {
    return this.prisma.studentScore.findUnique({
      where: { sbd },
    });
  }
}
