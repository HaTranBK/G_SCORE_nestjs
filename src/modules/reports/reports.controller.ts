import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('score-distribution')
  async getScoreDistribution() {
    return this.reportsService.getScoreDistribution();
  }

  @Post('clear-cache')
  @HttpCode(HttpStatus.OK)
  async clearCache() {
    return this.reportsService.clearCache();
  }
}
