'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadParticipantSession, loadFacilitatorConfig, saveParticipantSession, clearParticipantSession, saveFacilitatorConfig } from '@/lib/storage';
import { DebriefReport as DebriefReportType, JobDescription, CandidatePersona, ParticipantSession } from '@/lib/types';
import { DebriefReport } from '@/components/participant/DebriefReport';
import { Loader2, Printer, RefreshCw, UserCircle } from 'lucide-react';

export default function DebriefPage() {
  const router = useRouter();
  const [report, setReport] = useState<DebriefReportType | null>(null);
  const [session, setSession] = useState<ParticipantSession | null>(null);
  const [persona, setPersona] = useState<CandidatePersona | null>(null);
  const [jd, setJd] = useState<JobDescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const s = loadParticipantSession();
    if (!s) { router.push('/participant'); return; }

    const config = loadFacilitatorConfig();
    const foundJd = config.jds.find((j) => j.id === s.jdId);
    const foundPersona = config.personas.find((p) => p.id === s.personaId);

    if (!foundJd || !foundPersona) { router.push('/participant'); return; }

    setSession(s);
    setJd(foundJd);
    setPersona(foundPersona);

    // If debrief already generated, use it
    if (s.debrief) {
      setReport(s.debrief);
      setLoading(false);
      return;
    }

    // Generate debrief
    fetch('/api/debrief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session: s, jd: foundJd, persona: foundPersona }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        const updatedSession = { ...s, debrief: data as DebriefReportType };
        saveParticipantSession(updatedSession);
        // Update facilitator config
        const cfg = loadFacilitatorConfig();
        const idx = cfg.sessions.findIndex((x) => x.id === s.id);
        if (idx >= 0) cfg.sessions[idx] = updatedSession;
        saveFacilitatorConfig(cfg);
        setReport(data as DebriefReportType);
        setSession(updatedSession);
      })
      .catch((e) => {
        setError(e.message || 'Failed to generate debrief. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [router]);

  function tryAgain() {
    if (!session) return;
    const reset: ParticipantSession = {
      ...session,
      messages: [],
      starCoverageByCompetency: {},
      competenciesExplored: [],
      candidateQuestionsOffered: false,
      candidateQuestionsAsked: [],
      hireDecision: undefined,
      debrief: undefined,
      status: 'not_started',
      startedAt: new Date().toISOString(),
      completedAt: undefined,
    };
    saveParticipantSession(reset);
    const cfg = loadFacilitatorConfig();
    const idx = cfg.sessions.findIndex((x) => x.id === session.id);
    if (idx >= 0) cfg.sessions[idx] = reset;
    saveFacilitatorConfig(cfg);
    router.push('/participant/interview');
  }

  function tryNewPersona() {
    clearParticipantSession();
    router.push('/participant');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#F8F9FC' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: '#1A7B8A' }} />
        <p className="text-sm" style={{ color: '#5A5A7A' }}>Generating your debrief — this takes a moment…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-4" style={{ backgroundColor: '#F8F9FC' }}>
        <div className="max-w-sm w-full rounded-xl border p-5 bg-white text-center" style={{ borderColor: '#E2E4EF' }}>
          <p className="text-sm mb-4" style={{ color: '#991B1B' }}>{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: '#1C2C6E' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!report || !persona || !jd || !session) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FC' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl border p-5 mb-6" style={{ borderColor: '#E2E4EF' }}>
          <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#5A5A7A' }}>Interview debrief</div>
          <h1 className="text-xl font-semibold" style={{ color: '#1A1A2E' }}>{session.participantName}</h1>
          <div className="text-sm mt-0.5" style={{ color: '#5A5A7A' }}>
            {jd.title} · Interviewing {persona.name} · {new Date(report.generatedAt).toLocaleDateString()}
          </div>
        </div>

        <DebriefReport report={report} personaName={persona.name} />

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            onClick={tryAgain}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border"
            style={{ borderColor: '#1A7B8A', color: '#1A7B8A', backgroundColor: '#fff' }}
          >
            <RefreshCw size={16} /> Try again with same persona
          </button>
          <button
            onClick={tryNewPersona}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: '#F3F4F6', color: '#5A5A7A' }}
          >
            <UserCircle size={16} /> Try with new persona
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border"
            style={{ borderColor: '#E2E4EF', color: '#5A5A7A', backgroundColor: '#fff' }}
          >
            <Printer size={16} /> Print
          </button>
        </div>
      </div>
    </div>
  );
}
