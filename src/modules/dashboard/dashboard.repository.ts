import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface TopStudentRaw {
  sbd: string;
  toan: number | null;
  vat_li: number | null;
  hoa_hoc: number | null;
  tong_khoi_a: number;
}

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getTopStudentsKhoiA(limit: number): Promise<TopStudentRaw[]> {
    const sql = `
      SELECT
        sbd,
        toan,
        vat_li,
        hoa_hoc,
        (COALESCE(toan, 0) + COALESCE(vat_li, 0) + COALESCE(hoa_hoc, 0)) AS tong_khoi_a
      FROM "student_scores"
      WHERE toan IS NOT NULL
        AND vat_li IS NOT NULL
        AND hoa_hoc IS NOT NULL
      ORDER BY (toan + vat_li + hoa_hoc) DESC, toan DESC
      LIMIT ${limit};
    `;

    return this.prisma.$queryRawUnsafe<TopStudentRaw[]>(sql);
  }
}
