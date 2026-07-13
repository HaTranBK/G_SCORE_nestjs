import { Injectable, Logger } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';
import { RedisService } from '../redis/redis.service';
import { CACHE_KEYS } from '../../common/constants/cache-keys';

export interface TopStudentDto {
  rank: number;
  sbd: string;
  toan: number;
  vatLi: number;
  hoaHoc: number;
  tongKhoiA: number;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly redisService: RedisService,
  ) {}

  async getTopStudentsKhoiA(limit = 10): Promise<TopStudentDto[]> {
    const cacheKey = CACHE_KEYS.TOP_STUDENTS('A', limit);

    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.logger.log('Serving top students from cache');
        return JSON.parse(cached) as TopStudentDto[];
      }
    } catch (error) {
      this.logger.error('Redis error while getting top students cache', error);
    }

    this.logger.log('Cache miss. Querying database for top students...');
    const rows = await this.dashboardRepository.getTopStudentsKhoiA(limit);

    const result: TopStudentDto[] = rows.map((row, index) => ({
      rank: index + 1,
      sbd: row.sbd,
      toan: Number(row.toan),
      vatLi: Number(row.vat_li),
      hoaHoc: Number(row.hoa_hoc),
      tongKhoiA: Number(row.tong_khoi_a),
    }));

    try {
      // Cache trong 6 giờ (21600 giây)
      await this.redisService.set(cacheKey, JSON.stringify(result), 21600);
      this.logger.log('Cached top students in Redis (6h TTL)');
    } catch (error) {
      this.logger.error('Redis error while caching top students', error);
    }

    return result;
  }
}
