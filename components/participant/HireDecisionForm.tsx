'use client';

import { useState } from 'react';
import { HireDecision } from '@/lib/types';
import { Star } from 'lucide-react';

interface Props {
  onSubmit: (decision: HireDecision) => void;
  onCancel: () => void;
}

export function HireDecisionForm({ onSubmit, onCancel }: Props) {
  const [decision, setDecision] = useState<'hire' | 'kiv' | 'no_hire' | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [rationale, setRationale] = useState('');
  const [error, setError] = useState('');

  function handleSubmit() {
    if (!decision) { setError('Please select a hire decision.'); return; }
    if (rating === 0) { setError('Please provide a rating.'); return; }
    if (!rationale.trim()) { setError('Please briefly explain your decision.'); return; }
    onSubmit({ decision, rating: rating as HireDecision['rating'], rationale });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-lg font-semibold mb-1" style={{ color: '#1A1A2E' }}>End of interview — your assessment</h2>
        <p className="text-sm mb-5" style={{ color: '#5A5A7A' }}>Before viewing your debrief, record your impression of this candidate.</p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A2E' }}>Hire decision</label>
            <div className="flex gap-2">
              {(['hire', 'kiv', 'no_hire'] as const).map((d) => {
                const labels = { hire: 'Hire', kiv: 'KIV', no_hire: 'No hire' };
                const activeStyle = {
                  hire: { backgroundColor: '#D1FAE5', color: '#065F46', borderColor: '#059669' },
                  kiv: { backgroundColor: '#FEF3C7', color: '#92400E', borderColor: '#D97706' },
                  no_hire: { backgroundColor: '#FEE2E2', color: '#991B1B', borderColor: '#dc2626' },
                };
                return (
                  <button
                    key={d}
                    onClick={() => setDecision(d)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-colors"
                    style={decision === d ? activeStyle[d] : { backgroundColor: '#fff', color: '#5A5A7A', borderColor: '#E2E4EF' }}
                  >
                    {labels[d]}
                  </button>
                );
              })}
            </div>
            {decision === 'kiv' && (
              <p className="text-xs mt-1" style={{ color: '#92400E' }}>Keep In View — potential hire, pending further consideration or another interview.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A2E' }}>Overall candidate rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className="p-1 transition-transform hover:scale-110"
                  style={{ color: n <= rating ? '#C9973A' : '#E2E4EF' }}
                >
                  <Star size={28} fill={n <= rating ? '#C9973A' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A2E' }}>Rationale</label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
              style={{ borderColor: '#E2E4EF' }}
              rows={3}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Briefly explain why you made this decision..."
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: '#1C2C6E' }}>
              View debrief
            </button>
            <button onClick={onCancel} className="px-4 py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: '#E2E4EF', color: '#5A5A7A' }}>
              Continue interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
