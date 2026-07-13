import { Injectable, Logger } from '@nestjs/common';
import { ReportsRepository } from './reports.repository';
import { RedisService } from '../redis/redis.service';
import { CACHE_KEYS } from '../../common/constants/cache-keys';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly reportsRepository: ReportsRepository,
    private readonly redisService: RedisService,
  ) {}

  async getScoreDistribution() {
    // 1. Try to fetch from Redis cache
    try {
      const cachedData = await this.redisService.get(
        CACHE_KEYS.SCORE_DISTRIBUTION,
      );
      if (cachedData) {
        this.logger.log('Serving score distribution from cache');
        return JSON.parse(cachedData);
      }
    } catch (error) {
      this.logger.error('Redis error occurred while getting cache', error);
    }

    // 2. Fetch from Database
    this.logger.log('Cache miss or offline. Querying database...');
    const rawStats = await this.reportsRepository.getScoreDistributionRaw();
    if (!rawStats) {
      return { totalCandidates: 0, subjects: [] };
    }

    // 3. Format result
    const subjectsConfig = [
      { code: 'toan', name: 'Toán' },
      { code: 'ngu_van', name: 'Ngữ văn' },
      { code: 'ngoai_ngu', name: 'Ngoại ngữ' },
      { code: 'vat_li', name: 'Vật lí' },
      { code: 'hoa_hoc', name: 'Hóa học' },
      { code: 'sinh_hoc', name: 'Sinh học' },
      { code: 'lich_su', name: 'Lịch sử' },
      { code: 'dia_li', name: 'Địa lí' },
      { code: 'gdcd', name: 'GDCD' },
    ];

    const totalCandidates = rawStats.total_candidates || 0;

    const subjects = subjectsConfig.map((sub) => {
      const code = sub.code;
      const name = sub.name;
      const total = rawStats[`${code}_total`] || 0;
      // Round average to 2 decimal places
      const average = Math.round((rawStats[`${code}_avg`] || 0) * 100) / 100;
      const max = rawStats[`${code}_max`] || 0;

      return {
        subjectCode: code,
        subjectName: name,
        total,
        average,
        max,
        levels: {
          level1: rawStats[`${code}_level1`] || 0,
          level2: rawStats[`${code}_level2`] || 0,
          level3: rawStats[`${code}_level3`] || 0,
          level4: rawStats[`${code}_level4`] || 0,
        },
      };
    });

    const formattedResult = {
      totalCandidates,
      subjects,
    };

    // 4. Store in Redis cache (24 hours = 86400 seconds)
    try {
      await this.redisService.set(
        CACHE_KEYS.SCORE_DISTRIBUTION,
        JSON.stringify(formattedResult),
        86400,
      );
      this.logger.log('Successfully cached score distribution in Redis');
    } catch (error) {
      this.logger.error('Redis error occurred while setting cache', error);
    }

    return formattedResult;
  }

  async clearCache() {
    this.logger.log('Clearing score distribution cache');
    try {
      await this.redisService.del(CACHE_KEYS.SCORE_DISTRIBUTION);
      this.logger.log('Cache cleared successfully');
      return { message: 'Cache cleared successfully' };
    } catch (error) {
      this.logger.error('Failed to clear cache in Redis', error);
      throw error;
    }
  }
}
