'use client';

import { StarCoverage, StarScore } from '@/lib/types';

interface Props {
  coverageByCompetency: Record<string, StarCoverage>;
}

function Cell({ score }: { score: StarScore }) {
  const styles: Record<StarScore, { bg: string; border: string }> = {
    0: { bg: '#F3F4F6', border: '#E2E4EF' },
    1: { bg: '#fff', border: '#1A7B8A' },
    2: { bg: '#1A7B8A', border: '#1A7B8A' },
  };
  return (
    <div
      className="w-6 h-6 rounded border-2"
      style={{ backgroundColor: styles[score].bg, borderColor: styles[score].border }}
      title={score === 0 ? 'Not elicited' : score === 1 ? 'Partial' : 'Fully established'}
    />
  );
}

export function StarTracker({ coverageByCompetency }: Props) {
  const entries = Object.entries(coverageByCompetency);

  if (entries.length === 0) {
    return (
      <div className="text-sm text-center py-4" style={{ color: '#5A5A7A' }}>
        No competencies explored yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="text-xs w-full">
        <thead>
          <tr>
            <th className="text-left pb-2 pr-4 font-medium" style={{ color: '#5A5A7A' }}>Competency</th>
            {(['S', 'T', 'A', 'R'] as const).map((l) => (
              <th key={l} className="pb-2 px-1 font-bold text-center" style={{ color: '#1A7B8A' }}>{l}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map(([competency, coverage]) => (
            <tr key={competency}>
              <td className="pr-4 py-1 text-xs font-medium whitespace-nowrap" style={{ color: '#1A1A2E' }}>{competency}</td>
              <td className="px-1 py-1"><Cell score={coverage.situation} /></td>
              <td className="px-1 py-1"><Cell score={coverage.task} /></td>
              <td className="px-1 py-1"><Cell score={coverage.action} /></td>
              <td className="px-1 py-1"><Cell score={coverage.result} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-4 mt-3 text-xs" style={{ color: '#5A5A7A' }}>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded border" style={{ backgroundColor: '#F3F4F6', borderColor: '#E2E4EF' }}></span>Not elicited</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded border-2" style={{ backgroundColor: '#fff', borderColor: '#1A7B8A' }}></span>Partial</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: '#1A7B8A' }}></span>Established</span>
      </div>
    </div>
  );
}
