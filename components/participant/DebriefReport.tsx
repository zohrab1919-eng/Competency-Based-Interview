'use client';

import { DebriefReport as DebriefReportType } from '@/lib/types';
import { MessageSquare } from 'lucide-react';

interface Props {
  report: DebriefReportType;
  personaName: string;
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#E2E4EF' }}>
        <div className="h-2 rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: '#1A7B8A' }} />
      </div>
      <span className="text-sm font-semibold w-10 text-right" style={{ color: '#1A1A2E' }}>{score}%</span>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= rating ? '#C9973A' : '#E2E4EF', fontSize: 20 }}>★</span>
      ))}
    </div>
  );
}

const recommendationStyles = {
  hire: { bg: '#D1FAE5', text: '#065F46', label: 'Hire recommended' },
  kiv: { bg: '#FEF3C7', text: '#92400E', label: 'Keep In View (KIV)' },
  no_hire: { bg: '#FEE2E2', text: '#991B1B', label: 'No hire' },
  borderline: { bg: '#FEF3C7', text: '#92400E', label: 'Borderline' },
};

const accuracyStyles = {
  aligned: { bg: '#D1FAE5', text: '#065F46', label: 'Aligned' },
  over_rated: { bg: '#FEF3C7', text: '#92400E', label: 'Over-rated' },
  under_rated: { bg: '#EDE9FE', text: '#5B21B6', label: 'Under-rated' },
};

export function DebriefReport({ report, personaName }: Props) {
  const rec = recommendationStyles[report.aiHireRecommendation];
  const acc = accuracyStyles[report.hireDecisionAccuracy];

  return (
    <div className="space-y-5">
      {/* Overall rating */}
      <div className="rounded-xl border p-5" style={{ borderColor: '#E2E4EF', backgroundColor: '#fff' }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#5A5A7A' }}>Overall rating</div>
            <div className="text-5xl font-bold mb-1" style={{ color: '#1C2C6E' }}>{report.overallRating}</div>
            <StarRating rating={report.overallRating} />
            <p className="text-sm mt-2" style={{ color: '#5A5A7A' }}>{report.overallNarrativeLabel}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <span className="px-3 py-1.5 rounded-full text-sm font-semibold" style={{ backgroundColor: rec.bg, color: rec.text }}>
              {rec.label}
            </span>
            <div className="text-xs" style={{ color: '#5A5A7A' }}>AI hire recommendation</div>
          </div>
        </div>
      </div>

      {/* Four dimension cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* STAR Coverage */}
        <div className="rounded-xl border p-5" style={{ borderColor: '#E2E4EF', borderLeft: '4px solid #1A7B8A', backgroundColor: '#fff' }}>
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#1A7B8A' }}>S.T.A.R. Coverage</div>
          <div className="text-3xl font-bold mb-3" style={{ color: '#1A1A2E' }}>{report.starCoverageScore}%</div>
          <ScoreBar score={report.starCoverageScore} />
          {report.starElementBreakdown && (
            <div className="mt-4 space-y-2">
              <div className="text-xs font-medium mb-2" style={{ color: '#5A5A7A' }}>Breakdown by element</div>
              {(
                [
                  { key: 'situation', label: 'Situation' },
                  { key: 'task', label: 'Task' },
                  { key: 'action', label: 'Action' },
                  { key: 'result', label: 'Result' },
                ] as const
              ).map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-xs w-16 shrink-0 font-medium" style={{ color: '#5A5A7A' }}>{label}</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: '#E2E4EF' }}>
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${report.starElementBreakdown![key]}%`, backgroundColor: '#1A7B8A' }}
                    />
                  </div>
                  <span className="text-xs font-semibold w-8 text-right" style={{ color: '#1A1A2E' }}>{report.starElementBreakdown![key]}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversational Technique */}
        <div className="rounded-xl border p-5" style={{ borderColor: '#E2E4EF', borderLeft: '4px solid #1C2C6E', backgroundColor: '#fff' }}>
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#1C2C6E' }}>Conversational technique</div>
          <div className="text-3xl font-bold mb-3" style={{ color: '#1A1A2E' }}>{report.conversationalTechniqueScore}%</div>
          <ScoreBar score={report.conversationalTechniqueScore} />
        </div>

        {/* Hire Decision Review */}
        <div className="rounded-xl border p-5" style={{ borderColor: '#E2E4EF', borderLeft: '4px solid #6B3FA0', backgroundColor: '#fff' }}>
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#6B3FA0' }}>Hire decision review</div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: acc.bg, color: acc.text }}>{acc.label}</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#5A5A7A' }}>{report.aiHireRationale}</p>
        </div>

        {/* Candidate Experience */}
        <div className="rounded-xl border p-5" style={{ borderColor: '#E2E4EF', borderLeft: '4px solid #C9973A', backgroundColor: '#fff' }}>
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#C9973A' }}>Candidate experience</div>
          <div className="text-3xl font-bold mb-3" style={{ color: '#1A1A2E' }}>{report.candidateExperienceScore}%</div>
          <ScoreBar score={report.candidateExperienceScore} />
        </div>
      </div>

      {/* Candidate question log */}
      <div className="rounded-xl border p-5" style={{ borderColor: '#E2E4EF', backgroundColor: '#fff' }}>
        <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#C9973A' }}>Candidate question space</div>
        <p className="text-sm leading-relaxed" style={{ color: '#5A5A7A' }}>{report.candidateQuestionLog}</p>
        {report.missedOpportunityFlag && (
          <div className="mt-3 p-3 rounded-lg border-l-4 text-sm" style={{ borderColor: '#C9973A', backgroundColor: '#FFFBEB', color: '#92400E' }}>
            {report.missedOpportunityFlag}
          </div>
        )}
      </div>

      {/* Candidate satisfaction narrative */}
      {report.candidateSatisfactionNarrative && (
        <div className="rounded-xl border p-5" style={{ borderColor: '#E2E4EF', backgroundColor: '#fff' }}>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={16} style={{ color: '#5A5A7A' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#5A5A7A' }}>{personaName}&apos;s reflection</span>
          </div>
          <p className="text-sm leading-relaxed italic pl-4 border-l-2" style={{ color: '#5A5A7A', borderColor: '#E2E4EF' }}>
            &ldquo;{report.candidateSatisfactionNarrative}&rdquo;
          </p>
        </div>
      )}

      {/* Developmental observations */}
      <div className="rounded-xl border p-5" style={{ borderColor: '#E2E4EF', backgroundColor: '#fff' }}>
        <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#6B3FA0' }}>Your development insights</div>
        <div className="space-y-3">
          {report.developmentalObservations.map((obs, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg border-l-4" style={{ borderColor: '#6B3FA0', backgroundColor: '#F9F7FE' }}>
              <span className="text-sm font-bold shrink-0" style={{ color: '#6B3FA0' }}>{i + 1}</span>
              <p className="text-sm leading-relaxed" style={{ color: '#1A1A2E' }}>{obs}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
