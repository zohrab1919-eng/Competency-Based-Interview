'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveParticipantSession, generateId, loadFacilitatorConfig, saveFacilitatorConfig } from '@/lib/storage';
import { ParticipantSession } from '@/lib/types';
import { defaultJDs, defaultPersonas } from '@/lib/defaults';
import { UserCircle } from 'lucide-react';

export default function ParticipantJoinPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || loading) return;
    setLoading(true);

    // Load facilitator config if available (facilitator's browser), otherwise use defaults
    let config;
    try {
      config = loadFacilitatorConfig();
    } catch {
      config = null;
    }

    const activeJdId = config?.activeJdId || defaultJDs[0].id;
    const activePersonaId = config?.assignedPersonas?.[name.trim()] || config?.activePersonaId || defaultPersonas[0].id;

    const session: ParticipantSession = {
      id: generateId(),
      participantName: name.trim(),
      sessionCode: 'OPEN',
      jdId: activeJdId,
      personaId: activePersonaId,
      status: 'not_started',
      messages: [],
      starCoverageByCompetency: {},
      competenciesExplored: [],
      candidateQuestionsOffered: false,
      candidateQuestionsAsked: [],
      startedAt: new Date().toISOString(),
    };

    saveParticipantSession(session);

    // Register on server so facilitator dashboard can see this participant
    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });
    } catch {
      // Non-fatal — interview still works
    }

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
          <p className="text-sm mt-1" style={{ color: '#5A5A7A' }}>Enter your name to begin your practice interview</p>
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

            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="w-full py-3 rounded-lg font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: '#1A7B8A' }}
            >
              {loading ? 'Starting...' : 'Start interview'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: '#5A5A7A' }}>
          Go to <span className="font-medium">competency-based-interview-production.up.railway.app</span>
        </p>
      </div>
    </div>
  );
}
