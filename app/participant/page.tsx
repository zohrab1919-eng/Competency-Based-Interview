'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadFacilitatorConfig, saveFacilitatorConfig, saveParticipantSession, generateId } from '@/lib/storage';
import { ParticipantSession } from '@/lib/types';
import { UserCircle } from 'lucide-react';

export default function ParticipantJoinPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (code.trim().length !== 4) { setError('Session code must be 4 characters.'); return; }

    setLoading(true);
    const config = loadFacilitatorConfig();

    if (code.toUpperCase() !== config.sessionCode.toUpperCase()) {
      setError("That session code doesn't match an active session. Check with your facilitator.");
      setLoading(false);
      return;
    }

    // Determine persona
    const personaId = config.assignedPersonas[name.trim()] || config.activePersonaId;

    const session: ParticipantSession = {
      id: generateId(),
      participantName: name.trim(),
      sessionCode: code.toUpperCase(),
      jdId: config.activeJdId,
      personaId,
      status: 'not_started',
      messages: [],
      starCoverageByCompetency: {},
      competenciesExplored: [],
      candidateQuestionsOffered: false,
      candidateQuestionsAsked: [],
      startedAt: new Date().toISOString(),
    };

    saveParticipantSession(session);

    // Register in facilitator config
    const existing = config.sessions.findIndex(
      (s) => s.participantName === name.trim() && s.sessionCode === code.toUpperCase()
    );
    if (existing < 0) {
      config.sessions.push(session);
    }
    saveFacilitatorConfig(config);

    router.push('/participant/interview');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#F8F9FC' }}>
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E8F4F6', color: '#1A7B8A' }}>
            <UserCircle size={30} />
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: '#1A1A2E' }}>Join session</h1>
          <p className="text-sm mt-1" style={{ color: '#5A5A7A' }}>Enter your details to begin your practice interview</p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: '#E2E4EF' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A2E' }}>Your name</label>
              <input
                type="text"
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
                style={{ borderColor: '#E2E4EF' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A2E' }}>Session code</label>
              <input
                type="text"
                maxLength={4}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 uppercase tracking-widest text-center text-xl font-bold"
                style={{ borderColor: '#E2E4EF', color: '#1C2C6E' }}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XXXX"
              />
              <p className="text-xs mt-1" style={{ color: '#5A5A7A' }}>Get the session code from your facilitator</p>
            </div>

            {error && (
              <div className="rounded-lg p-3 text-sm" style={{ backgroundColor: '#FEF2F2', color: '#991B1B' }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: '#1A7B8A' }}
            >
              {loading ? 'Joining...' : 'Start interview'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
