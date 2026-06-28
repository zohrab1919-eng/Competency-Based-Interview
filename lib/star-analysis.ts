import { StarCoverage, StarScore } from './types';

export function mergeStarCoverage(existing: StarCoverage, incoming: StarCoverage): StarCoverage {
  return {
    situation: Math.max(existing.situation, incoming.situation) as StarScore,
    task: Math.max(existing.task, incoming.task) as StarScore,
    action: Math.max(existing.action, incoming.action) as StarScore,
    result: Math.max(existing.result, incoming.result) as StarScore,
  };
}

export function starCoverageToScore(coverage: StarCoverage): number {
  const total = coverage.situation + coverage.task + coverage.action + coverage.result;
  return Math.round((total / 8) * 100);
}

export function overallStarScore(coverageByCompetency: Record<string, StarCoverage>): number {
  const entries = Object.values(coverageByCompetency);
  if (entries.length === 0) return 0;
  const scores = entries.map(starCoverageToScore);
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function emptyCoverage(): StarCoverage {
  return { situation: 0, task: 0, action: 0, result: 0 };
}
