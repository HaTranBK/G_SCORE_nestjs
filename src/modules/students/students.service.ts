import { Injectable, NotFoundException } from '@nestjs/common';
import { StudentScore } from '@prisma/client';
import { StudentsRepository } from './students.repository';
import { RedisService } from '../redis/redis.service';
import { CACHE_KEYS } from '../../common/constants/cache-keys';

@Injectable()
export class StudentsService {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly redisService: RedisService,
  ) {}

  async findOne(sbd: string) {
    const cacheKey = CACHE_KEYS.STUDENT_SCORE(sbd);

    // 1. Try to get cached student score from Redis
    try {
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData) as StudentScore;
      }
    } catch (err) {
      console.error('Failed to fetch from redis cache:', err);
    }

    // 2. Fetch from database using Repository
    const student = await this.studentsRepository.findOne(sbd);

    if (!student) {
      throw new NotFoundException(`Candidate with SBD ${sbd} not found`);
    }

    // 3. Cache the score in Redis with a TTL of 1 hour (3600 seconds)
    try {
      await this.redisService.set(cacheKey, JSON.stringify(student), 3600);
    } catch (err) {
      console.error('Failed to save to redis cache:', err);
    }

    return student;
  }
}
