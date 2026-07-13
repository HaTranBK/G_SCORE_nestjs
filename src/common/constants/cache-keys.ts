export const CACHE_KEYS = {
  SCORE_DISTRIBUTION: 'reports:score-distribution',

  STUDENT_SCORE: (sbd: string) => `student:score:${sbd}`,
};
