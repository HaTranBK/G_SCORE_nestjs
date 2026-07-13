import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getScoreDistributionRaw() {
    const sql = `
      SELECT
        -- Overall Total
        CAST(COUNT(sbd) AS INTEGER) AS total_candidates,

        -- Toán
        CAST(COUNT(toan) AS INTEGER) AS toan_total,
        CAST(COUNT(CASE WHEN toan >= 8 THEN 1 END) AS INTEGER) AS toan_level1,
        CAST(COUNT(CASE WHEN toan >= 6.5 AND toan < 8 THEN 1 END) AS INTEGER) AS toan_level2,
        CAST(COUNT(CASE WHEN toan >= 5 AND toan < 6.5 THEN 1 END) AS INTEGER) AS toan_level3,
        CAST(COUNT(CASE WHEN toan < 5 THEN 1 END) AS INTEGER) AS toan_level4,
        COALESCE(AVG(toan), 0)::float AS toan_avg,
        COALESCE(MAX(toan), 0)::float AS toan_max,

        -- Ngữ văn
        CAST(COUNT(ngu_van) AS INTEGER) AS ngu_van_total,
        CAST(COUNT(CASE WHEN ngu_van >= 8 THEN 1 END) AS INTEGER) AS ngu_van_level1,
        CAST(COUNT(CASE WHEN ngu_van >= 6.5 AND ngu_van < 8 THEN 1 END) AS INTEGER) AS ngu_van_level2,
        CAST(COUNT(CASE WHEN ngu_van >= 5 AND ngu_van < 6.5 THEN 1 END) AS INTEGER) AS ngu_van_level3,
        CAST(COUNT(CASE WHEN ngu_van < 5 THEN 1 END) AS INTEGER) AS ngu_van_level4,
        COALESCE(AVG(ngu_van), 0)::float AS ngu_van_avg,
        COALESCE(MAX(ngu_van), 0)::float AS ngu_van_max,

        -- Ngoại ngữ
        CAST(COUNT(ngoai_ngu) AS INTEGER) AS ngoai_ngu_total,
        CAST(COUNT(CASE WHEN ngoai_ngu >= 8 THEN 1 END) AS INTEGER) AS ngoai_ngu_level1,
        CAST(COUNT(CASE WHEN ngoai_ngu >= 6.5 AND ngoai_ngu < 8 THEN 1 END) AS INTEGER) AS ngoai_ngu_level2,
        CAST(COUNT(CASE WHEN ngoai_ngu >= 5 AND ngoai_ngu < 6.5 THEN 1 END) AS INTEGER) AS ngoai_ngu_level3,
        CAST(COUNT(CASE WHEN ngoai_ngu < 5 THEN 1 END) AS INTEGER) AS ngoai_ngu_level4,
        COALESCE(AVG(ngoai_ngu), 0)::float AS ngoai_ngu_avg,
        COALESCE(MAX(ngoai_ngu), 0)::float AS ngoai_ngu_max,

        -- Vật lí
        CAST(COUNT(vat_li) AS INTEGER) AS vat_li_total,
        CAST(COUNT(CASE WHEN vat_li >= 8 THEN 1 END) AS INTEGER) AS vat_li_level1,
        CAST(COUNT(CASE WHEN vat_li >= 6.5 AND vat_li < 8 THEN 1 END) AS INTEGER) AS vat_li_level2,
        CAST(COUNT(CASE WHEN vat_li >= 5 AND vat_li < 6.5 THEN 1 END) AS INTEGER) AS vat_li_level3,
        CAST(COUNT(CASE WHEN vat_li < 5 THEN 1 END) AS INTEGER) AS vat_li_level4,
        COALESCE(AVG(vat_li), 0)::float AS vat_li_avg,
        COALESCE(MAX(vat_li), 0)::float AS vat_li_max,

        -- Hóa học
        CAST(COUNT(hoa_hoc) AS INTEGER) AS hoa_hoc_total,
        CAST(COUNT(CASE WHEN hoa_hoc >= 8 THEN 1 END) AS INTEGER) AS hoa_hoc_level1,
        CAST(COUNT(CASE WHEN hoa_hoc >= 6.5 AND hoa_hoc < 8 THEN 1 END) AS INTEGER) AS hoa_hoc_level2,
        CAST(COUNT(CASE WHEN hoa_hoc >= 5 AND hoa_hoc < 6.5 THEN 1 END) AS INTEGER) AS hoa_hoc_level3,
        CAST(COUNT(CASE WHEN hoa_hoc < 5 THEN 1 END) AS INTEGER) AS hoa_hoc_level4,
        COALESCE(AVG(hoa_hoc), 0)::float AS hoa_hoc_avg,
        COALESCE(MAX(hoa_hoc), 0)::float AS hoa_hoc_max,

        -- Sinh học
        CAST(COUNT(sinh_hoc) AS INTEGER) AS sinh_hoc_total,
        CAST(COUNT(CASE WHEN sinh_hoc >= 8 THEN 1 END) AS INTEGER) AS sinh_hoc_level1,
        CAST(COUNT(CASE WHEN sinh_hoc >= 6.5 AND sinh_hoc < 8 THEN 1 END) AS INTEGER) AS sinh_hoc_level2,
        CAST(COUNT(CASE WHEN sinh_hoc >= 5 AND sinh_hoc < 6.5 THEN 1 END) AS INTEGER) AS sinh_hoc_level3,
        CAST(COUNT(CASE WHEN sinh_hoc < 5 THEN 1 END) AS INTEGER) AS sinh_hoc_level4,
        COALESCE(AVG(sinh_hoc), 0)::float AS sinh_hoc_avg,
        COALESCE(MAX(sinh_hoc), 0)::float AS sinh_hoc_max,

        -- Lịch sử
        CAST(COUNT(lich_su) AS INTEGER) AS lich_su_total,
        CAST(COUNT(CASE WHEN lich_su >= 8 THEN 1 END) AS INTEGER) AS lich_su_level1,
        CAST(COUNT(CASE WHEN lich_su >= 6.5 AND lich_su < 8 THEN 1 END) AS INTEGER) AS lich_su_level2,
        CAST(COUNT(CASE WHEN lich_su >= 5 AND lich_su < 6.5 THEN 1 END) AS INTEGER) AS lich_su_level3,
        CAST(COUNT(CASE WHEN lich_su < 5 THEN 1 END) AS INTEGER) AS lich_su_level4,
        COALESCE(AVG(lich_su), 0)::float AS lich_su_avg,
        COALESCE(MAX(lich_su), 0)::float AS lich_su_max,

        -- Địa lí
        CAST(COUNT(dia_li) AS INTEGER) AS dia_li_total,
        CAST(COUNT(CASE WHEN dia_li >= 8 THEN 1 END) AS INTEGER) AS dia_li_level1,
        CAST(COUNT(CASE WHEN dia_li >= 6.5 AND dia_li < 8 THEN 1 END) AS INTEGER) AS dia_li_level2,
        CAST(COUNT(CASE WHEN dia_li >= 5 AND dia_li < 6.5 THEN 1 END) AS INTEGER) AS dia_li_level3,
        CAST(COUNT(CASE WHEN dia_li < 5 THEN 1 END) AS INTEGER) AS dia_li_level4,
        COALESCE(AVG(dia_li), 0)::float AS dia_li_avg,
        COALESCE(MAX(dia_li), 0)::float AS dia_li_max,

        -- GDCD
        CAST(COUNT(gdcd) AS INTEGER) AS gdcd_total,
        CAST(COUNT(CASE WHEN gdcd >= 8 THEN 1 END) AS INTEGER) AS gdcd_level1,
        CAST(COUNT(CASE WHEN gdcd >= 6.5 AND gdcd < 8 THEN 1 END) AS INTEGER) AS gdcd_level2,
        CAST(COUNT(CASE WHEN gdcd >= 5 AND gdcd < 6.5 THEN 1 END) AS INTEGER) AS gdcd_level3,
        CAST(COUNT(CASE WHEN gdcd < 5 THEN 1 END) AS INTEGER) AS gdcd_level4,
        COALESCE(AVG(gdcd), 0)::float AS gdcd_avg,
        COALESCE(MAX(gdcd), 0)::float AS gdcd_max
      FROM student_scores;
    `;
    const results = await this.prisma.$queryRawUnsafe<any[]>(sql);
    return results[0] || null;
  }
}
