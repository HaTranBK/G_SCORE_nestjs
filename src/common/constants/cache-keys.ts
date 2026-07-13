export const CACHE_KEYS = {
  SCORE_DISTRIBUTION: 'reports:score-distribution',

  STUDENT_SCORE: (sbd: string) => `student:score:${sbd}`,

  TOP_STUDENTS: (group: string, limit: number) =>
    `dashboard:top-students:${group}:${limit}`,
};
