'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  loadParticipantSession,
  saveParticipantSession,
  loadFacilitatorConfig,
  saveFacilitatorConfig,
} from '@/lib/storage';
import {
  ParticipantSession,
  ChatMessage,
  JobDescription,
  CandidatePersona,
  StarCoverage,
} from '@/lib/types';
import { mergeStarCoverage, emptyCoverage } from '@/lib/star-analysis';
import { HireDecisionForm } from '@/components/participant/HireDecisionForm';
import { StarTracker } from '@/components/participant/StarTracker';
import { Send, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

export default function InterviewPage() {
  const router = useRouter();
  const [session, setSession] = useState<ParticipantSession | null>(null);
  const [jd, setJd] = useState<JobDescription | null>(null);
  const [persona, setPersona] = useState<CandidatePersona | null>(null);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [showHireForm, setShowHireForm] = useState(false);
  const [showEndWarning, setShowEndWarning] = useState(false);
  const [aiError, setAiError] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const s = loadParticipantSession();
    if (!s) { router.push('/participant'); return; }
    const config = loadFacilitatorConfig();
    const foundJd = config.jds.find((j) => j.id === s.jdId);
    const foundPersona = config.personas.find((p) => p.id === s.personaId);
    if (!foundJd || !foundPersona) { router.push('/participant'); return; }
    setSession({ ...s, status: 'in_progress' });
    setJd(foundJd);
    setPersona(foundPersona);
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages, streamingContent]);

  const persistSession = useCallback((updated: ParticipantSession) => {
    saveParticipantSession(updated);
    const config = loadFacilitatorConfig();
    const idx = config.sessions.findIndex((s) => s.id === updated.id);
    if (idx >= 0) config.sessions[idx] = updated;
    else config.sessions.push(updated);
    saveFacilitatorConfig(config);
  }, []);

  async function sendMessage() {
    if (!input.trim() || !session || !jd || !persona || streaming) return;
    setAiError('');

    const msgId = Math.random().toString(36).slice(2);
    const managerMsg: ChatMessage = {
      id: msgId,
      role: 'manager',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedSession: ParticipantSession = {
      ...session,
      messages: [...session.messages, managerMsg],
    };
    setSession(updatedSession);
    setInput('');
    setStreaming(true);
    setStreamingContent('');

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: updatedSession,
          jd,
          persona,
          newManagerMessage: managerMsg.content,
        }),
      });

      if (!res.ok) throw new Error('API error');
      if (!res.body) throw new Error('No body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let candidateText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        candidateText += chunk;
        setStreamingContent(candidateText);
      }

      const candidateMsg: ChatMessage = {
        id: Math.random().toString(36).slice(2),
        role: 'candidate',
        content: candidateText,
        timestamp: new Date().toISOString(),
      };

      const withCandidate: ParticipantSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, candidateMsg],
      };

      setStreamingContent('');
      setSession(withCandidate);
      persistSession(withCandidate);

      // Background STAR analysis and question detection
      analyseInBackground(withCandidate, managerMsg.content, candidateText, jd, persona);

    } catch {
      setAiError('Something went wrong generating a response. Please try again.');
      setStreaming(false);
      setStreamingContent('');
    } finally {
      setStreaming(false);
    }
  }

  async function analyseInBackground(
    s: ParticipantSession,
    managerQ: string,
    candidateR: string,
    currentJd: JobDescription,
    currentPersona: CandidatePersona
  ) {
    try {
      // STAR analysis for each leadership behaviour
      const competency = currentJd.leadershipBehaviours[s.competenciesExplored.length % currentJd.leadershipBehaviours.length];

      const [starRes, questionRes] = await Promise.all([
        fetch('/api/analyse-star', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ managerQuestion: managerQ, candidateResponse: candidateR, competency }),
        }).then((r) => r.json()).catch(() => emptyCoverage()),
        fetch('/api/detect-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ managerMessage: managerQ }),
        }).then((r) => r.json()).catch(() => ({ isInvitation: false })),
      ]);

      const newCoverage: StarCoverage = starRes as StarCoverage;
      const existing = s.starCoverageByCompetency[competency] || emptyCoverage();
      const merged = mergeStarCoverage(existing, newCoverage);

      const explored = s.competenciesExplored.includes(competency)
        ? s.competenciesExplored
        : [...s.competenciesExplored, competency];

      const updatedWithStar: ParticipantSession = {
        ...s,
        starCoverageByCompetency: { ...s.starCoverageByCompetency, [competency]: merged },
        competenciesExplored: explored,
        candidateQuestionsOffered: s.candidateQuestionsOffered || questionRes.isInvitation,
      };

      setSession(updatedWithStar);
      persistSession(updatedWithStar);
    } catch {
      // Silent fail for background analysis
    }
  }

  function handleEndInterview() {
    if (!session) return;
    if (session.competenciesExplored.length < 3) {
      setShowEndWarning(true);
    } else {
      setShowHireForm(true);
    }
  }

  function handleHireDecision(decision: import('@/lib/types').HireDecision) {
    if (!session) return;
    const completed: ParticipantSession = {
      ...session,
      status: 'completed',
      hireDecision: decision,
      completedAt: new Date().toISOString(),
    };
    setSession(completed);
    persistSession(completed);
    router.push('/participant/debrief');
  }

  if (!session || !jd || !persona) return null;

  const behaviours = jd.leadershipBehaviours;

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#F8F9FC' }}>
      {/* Top bar */}
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3" style={{ borderColor: '#E2E4EF' }}>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate" style={{ color: '#1A1A2E' }}>{jd.title}</div>
          <div className="text-xs truncate" style={{ color: '#5A5A7A' }}>Interviewing: {persona.name}</div>
        </div>

        {/* Competency pills */}
        <div className="hidden sm:flex gap-1.5 flex-wrap">
          {behaviours.map((b) => {
            const explored = session.competenciesExplored.includes(b);
            return (
              <span
                key={b}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={explored ? { backgroundColor: '#1A7B8A', color: '#fff' } : { backgroundColor: '#F3F4F6', color: '#5A5A7A' }}
                title={b}
              >
                {b.split(' ')[0]}
              </span>
            );
          })}
        </div>

        <button
          onClick={() => setShowTracker(!showTracker)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ backgroundColor: '#E8F4F6', color: '#1A7B8A' }}
        >
          STAR {showTracker ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        <button
          onClick={handleEndInterview}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
          style={{ backgroundColor: '#1C2C6E' }}
        >
          End interview
        </button>
      </header>

      {/* STAR tracker panel */}
      {showTracker && (
        <div className="bg-white border-b px-4 py-3" style={{ borderColor: '#E2E4EF' }}>
          <StarTracker coverageByCompetency={session.starCoverageByCompetency} />
        </div>
      )}

      {/* Chat */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4" role="log" aria-live="polite">
        {session.messages.length === 0 && (
          <div className="max-w-lg mx-auto">
            <div className="rounded-xl border p-5 text-center" style={{ borderColor: '#E2E4EF', backgroundColor: '#fff' }}>
              <div className="text-sm font-semibold mb-1" style={{ color: '#1A1A2E' }}>Ready to begin</div>
              <p className="text-sm" style={{ color: '#5A5A7A' }}>
                Start by introducing yourself, explaining the role, and setting the context for the interview. When ready, type your opening statement below.
              </p>
            </div>
          </div>
        )}

        {session.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'manager' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] sm:max-w-[65%]`}>
              {msg.isCandidateQuestion && (
                <div className="text-xs mb-1 pl-2" style={{ color: '#C9973A' }}>Their question</div>
              )}
              <div
                className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={msg.role === 'manager'
                  ? { backgroundColor: '#1C2C6E', color: '#fff', borderRadius: '18px 18px 4px 18px' }
                  : msg.isCandidateQuestion
                    ? { backgroundColor: '#fff', color: '#1A1A2E', border: '1px solid #E2E4EF', borderLeft: '3px solid #C9973A', borderRadius: '18px 18px 18px 4px' }
                    : { backgroundColor: '#fff', color: '#1A1A2E', border: '1px solid #E2E4EF', borderRadius: '18px 18px 18px 4px' }
                }
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming response */}
        {streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[80%] sm:max-w-[65%] px-4 py-3 rounded-2xl text-sm leading-relaxed" style={{ backgroundColor: '#fff', color: '#1A1A2E', border: '1px solid #E2E4EF', borderRadius: '18px 18px 18px 4px' }}>
              {streamingContent}
              <span className="inline-block w-1.5 h-4 ml-0.5 animate-pulse" style={{ backgroundColor: '#1A7B8A' }} />
            </div>
          </div>
        )}

        {aiError && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: '#FEF2F2', color: '#991B1B' }}>
              <AlertTriangle size={14} />
              {aiError}
              <button onClick={() => setAiError('')} className="ml-2 underline text-xs">Dismiss</button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <div className="bg-white border-t px-4 py-3" style={{ borderColor: '#E2E4EF' }}>
        <div className="max-w-2xl mx-auto flex gap-3 items-end">
          <textarea
            ref={inputRef}
            className="flex-1 px-3 py-2.5 rounded-xl border text-sm outline-none resize-none"
            style={{ borderColor: '#E2E4EF', minHeight: '44px', maxHeight: '120px' }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your question or statement…"
            rows={1}
            disabled={streaming}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || streaming}
            className="p-2.5 rounded-xl text-white disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: '#1C2C6E' }}
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-center text-xs mt-1" style={{ color: '#5A5A7A' }}>Press Enter to send · Shift+Enter for new line</p>
      </div>

      {/* End interview warning */}
      {showEndWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} style={{ color: '#C9973A' }} />
              <span className="font-semibold" style={{ color: '#1A1A2E' }}>Ending early</span>
            </div>
            <p className="text-sm mb-5" style={{ color: '#5A5A7A' }}>
              You've covered {session.competenciesExplored.length} of the recommended 3 competency areas. Ending now will affect your debrief scores.
            </p>
            <div className="flex gap-3">
              <button onClick={() => { setShowEndWarning(false); setShowHireForm(true); }} className="flex-1 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: '#E2E4EF', color: '#5A5A7A' }}>
                End anyway
              </button>
              <button onClick={() => setShowEndWarning(false)} className="flex-1 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: '#1C2C6E' }}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {showHireForm && (
        <HireDecisionForm
          onSubmit={handleHireDecision}
          onCancel={() => setShowHireForm(false)}
        />
      )}
    </div>
  );
}
