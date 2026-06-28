'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Briefcase, Users, Settings, Copy, Check, Plus,
  Edit2, Trash2, Star, RefreshCw, Download
} from 'lucide-react';
import { loadFacilitatorConfig, saveFacilitatorConfig, generateSessionCode } from '@/lib/storage';
import { FacilitatorConfig, JobDescription, CandidatePersona, ParticipantSession } from '@/lib/types';
import { JDBuilder } from '@/components/facilitator/JDBuilder';
import { PersonaBuilder } from '@/components/facilitator/PersonaBuilder';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DebriefReport } from '@/components/participant/DebriefReport';

type Panel = 'overview' | 'jds' | 'personas' | 'settings';

export default function DashboardPage() {
  const router = useRouter();
  const [config, setConfig] = useState<FacilitatorConfig | null>(null);
  const [panel, setPanel] = useState<Panel>('overview');
  const [editingJD, setEditingJD] = useState<JobDescription | null | 'new'>(null);
  const [editingPersona, setEditingPersona] = useState<CandidatePersona | null | 'new'>(null);
  const [copied, setCopied] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [viewingDebrief, setViewingDebrief] = useState<ParticipantSession | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('cbi_facilitator_auth');
    if (auth !== 'true') { router.push('/facilitator'); return; }
    setConfig(loadFacilitatorConfig());
  }, [router]);

  function save(updated: FacilitatorConfig) {
    saveFacilitatorConfig(updated);
    setConfig({ ...updated });
  }

  function copyCode() {
    if (!config) return;
    navigator.clipboard.writeText(config.sessionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function resetCode() {
    if (!config) return;
    save({ ...config, sessionCode: generateSessionCode() });
  }

  function saveJD(jd: JobDescription) {
    if (!config) return;
    const existing = config.jds.findIndex((j) => j.id === jd.id);
    const jds = existing >= 0 ? config.jds.map((j) => (j.id === jd.id ? jd : j)) : [...config.jds, jd];
    save({ ...config, jds });
    setEditingJD(null);
  }

  function deleteJD(id: string) {
    if (!config) return;
    save({ ...config, jds: config.jds.filter((j) => j.id !== id) });
  }

  function setActiveJD(id: string) {
    if (!config) return;
    save({ ...config, activeJdId: id });
  }

  function savePersona(p: CandidatePersona) {
    if (!config) return;
    const existing = config.personas.findIndex((x) => x.id === p.id);
    const personas = existing >= 0 ? config.personas.map((x) => (x.id === p.id ? p : x)) : [...config.personas, p];
    save({ ...config, personas });
    setEditingPersona(null);
  }

  function deletePersona(id: string) {
    if (!config) return;
    save({ ...config, personas: config.personas.filter((p) => p.id !== id) });
  }

  function setActivePersona(id: string) {
    if (!config) return;
    save({ ...config, activePersonaId: id });
  }

  function changePin() {
    if (!config || newPin.length < 4) return;
    save({ ...config, pin: newPin });
    setNewPin('');
    setPinSuccess('PIN updated.');
    setTimeout(() => setPinSuccess(''), 3000);
  }

  function exportData() {
    if (!config) return;
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cbi-session-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  function resetSession(sessionId: string) {
    if (!config) return;
    const sessions = config.sessions.map((s) =>
      s.id === sessionId
        ? { ...s, messages: [], starCoverageByCompetency: {}, competenciesExplored: [], candidateQuestionsOffered: false, candidateQuestionsAsked: [], hireDecision: undefined, debrief: undefined, status: 'not_started' as const, startedAt: undefined, completedAt: undefined }
        : s
    );
    save({ ...config, sessions });
  }

  if (!config) return null;

  const completedSessions = config.sessions.filter((s) => s.status === 'completed');
  const avgStar = completedSessions.length ? Math.round(completedSessions.reduce((acc, s) => acc + (s.debrief?.starCoverageScore || 0), 0) / completedSessions.length) : null;
  const avgConv = completedSessions.length ? Math.round(completedSessions.reduce((acc, s) => acc + (s.debrief?.conversationalTechniqueScore || 0), 0) / completedSessions.length) : null;
  const avgCx = completedSessions.length ? Math.round(completedSessions.reduce((acc, s) => acc + (s.debrief?.candidateExperienceScore || 0), 0) / completedSessions.length) : null;
  const questionSpaceCount = completedSessions.filter((s) => s.candidateQuestionsOffered).length;

  const navItems: { id: Panel; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Session overview', icon: <LayoutDashboard size={18} /> },
    { id: 'jds', label: 'Job descriptions', icon: <Briefcase size={18} /> },
    { id: 'personas', label: 'Candidate personas', icon: <Users size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F8F9FC' }}>
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r bg-white hidden md:flex flex-col" style={{ borderColor: '#E2E4EF' }}>
        <div className="px-4 py-5 border-b" style={{ borderColor: '#E2E4EF' }}>
          <div className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#5A5A7A' }}>Facilitator</div>
          <div className="font-semibold" style={{ color: '#1A1A2E' }}>CBI Practice App</div>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setPanel(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left"
              style={panel === item.id ? { backgroundColor: '#E8EBF7', color: '#1C2C6E' } : { color: '#5A5A7A' }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t" style={{ borderColor: '#E2E4EF' }}>
          <button onClick={() => { sessionStorage.removeItem('cbi_facilitator_auth'); router.push('/'); }} className="text-xs w-full text-left" style={{ color: '#5A5A7A' }}>
            Exit facilitator mode
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white border-t flex" style={{ borderColor: '#E2E4EF' }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setPanel(item.id)}
            className="flex-1 flex flex-col items-center py-2 text-xs gap-0.5"
            style={panel === item.id ? { color: '#1C2C6E' } : { color: '#5A5A7A' }}
          >
            {item.icon}
            <span className="text-[10px]">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Main */}
      <main className="flex-1 px-4 py-6 pb-24 md:pb-6 max-w-5xl mx-auto w-full">

        {/* Session Overview */}
        {panel === 'overview' && (
          <div>
            <h1 className="text-xl font-semibold mb-6" style={{ color: '#1A1A2E' }}>Session overview</h1>

            {/* Session code */}
            <div className="bg-white rounded-xl border p-5 mb-6" style={{ borderColor: '#E2E4EF' }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#5A5A7A' }}>Active session code — share this with participants</div>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold tracking-widest" style={{ color: '#1C2C6E' }}>{config.sessionCode}</span>
                <button onClick={copyCode} className="p-2 rounded-lg transition-colors" style={{ backgroundColor: '#E8EBF7', color: '#1C2C6E' }}>
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
                <button onClick={resetCode} className="p-2 rounded-lg" style={{ backgroundColor: '#F3F4F6', color: '#5A5A7A' }} title="Generate new code">
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            {/* Question space stat */}
            {completedSessions.length > 0 && (
              <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: '#FEF3C7', borderLeft: '4px solid #C9973A' }}>
                <div className="text-sm font-semibold" style={{ color: '#92400E' }}>
                  Candidate question space: {questionSpaceCount} of {completedSessions.length} participants ({Math.round(questionSpaceCount / completedSessions.length * 100)}%) created space for candidate questions
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#92400E' }}>This is typically the most surprising result — use it to anchor group debrief.</div>
              </div>
            )}

            {/* Aggregate scores */}
            {completedSessions.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Avg STAR coverage', value: avgStar },
                  { label: 'Avg conversational technique', value: avgConv },
                  { label: 'Avg candidate experience', value: avgCx },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-xl border p-4 text-center" style={{ borderColor: '#E2E4EF' }}>
                    <div className="text-2xl font-bold" style={{ color: '#1C2C6E' }}>{stat.value ?? '—'}{stat.value !== null && '%'}</div>
                    <div className="text-xs mt-1" style={{ color: '#5A5A7A' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Sessions table */}
            <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2E4EF' }}>
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#E2E4EF' }}>
                <span className="text-sm font-semibold" style={{ color: '#1A1A2E' }}>Participants ({config.sessions.length})</span>
              </div>
              {config.sessions.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm" style={{ color: '#5A5A7A' }}>
                  No participants have joined yet. Share the session code above.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left" style={{ backgroundColor: '#F8F9FC', color: '#5A5A7A' }}>
                        <th className="px-4 py-2.5 font-medium">Name</th>
                        <th className="px-4 py-2.5 font-medium">Persona</th>
                        <th className="px-4 py-2.5 font-medium">Status</th>
                        <th className="px-4 py-2.5 font-medium">STAR</th>
                        <th className="px-4 py-2.5 font-medium">CX score</th>
                        <th className="px-4 py-2.5 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {config.sessions.map((s) => {
                        const persona = config.personas.find((p) => p.id === s.personaId);
                        return (
                          <tr key={s.id} className="border-t" style={{ borderColor: '#E2E4EF' }}>
                            <td className="px-4 py-3 font-medium" style={{ color: '#1A1A2E' }}>{s.participantName}</td>
                            <td className="px-4 py-3" style={{ color: '#5A5A7A' }}>{persona?.name || '—'}</td>
                            <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                            <td className="px-4 py-3">{s.debrief ? `${s.debrief.starCoverageScore}%` : '—'}</td>
                            <td className="px-4 py-3">{s.debrief ? `${s.debrief.candidateExperienceScore}%` : '—'}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                {s.debrief && (
                                  <button onClick={() => setViewingDebrief(s)} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#EEEAF7', color: '#6B3FA0' }}>View debrief</button>
                                )}
                                <button onClick={() => resetSession(s.id)} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#F3F4F6', color: '#5A5A7A' }}>Reset</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* JD Panel */}
        {panel === 'jds' && !editingJD && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold" style={{ color: '#1A1A2E' }}>Job descriptions</h1>
              <button onClick={() => setEditingJD('new')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: '#1C2C6E' }}>
                <Plus size={16} /> New JD
              </button>
            </div>
            <div className="space-y-3">
              {config.jds.map((jd) => (
                <div key={jd.id} className="bg-white rounded-xl border p-4" style={{ borderColor: '#E2E4EF', borderLeft: config.activeJdId === jd.id ? '4px solid #1C2C6E' : undefined }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold" style={{ color: '#1A1A2E' }}>{jd.title}</div>
                      <div className="text-xs mt-1" style={{ color: '#5A5A7A' }}>{jd.mustHaveSkills.length} skills · {jd.leadershipBehaviours.length} behaviours</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {jd.leadershipBehaviours.map((b) => (
                          <span key={b} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E8EBF7', color: '#1C2C6E' }}>{b}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {config.activeJdId !== jd.id && (
                        <button onClick={() => setActiveJD(jd.id)} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#E8EBF7', color: '#1C2C6E' }}>Set active</button>
                      )}
                      <button onClick={() => setEditingJD(jd)} className="p-1.5 rounded" style={{ color: '#5A5A7A' }}><Edit2 size={15} /></button>
                      {!jd.isDefault && (
                        <button onClick={() => deleteJD(jd.id)} className="p-1.5 rounded" style={{ color: '#dc2626' }}><Trash2 size={15} /></button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {panel === 'jds' && editingJD && (
          <div>
            <h1 className="text-xl font-semibold mb-6" style={{ color: '#1A1A2E' }}>{editingJD === 'new' ? 'New job description' : 'Edit job description'}</h1>
            <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E2E4EF' }}>
              <JDBuilder
                initial={editingJD === 'new' ? undefined : editingJD}
                onSave={saveJD}
                onCancel={() => setEditingJD(null)}
              />
            </div>
          </div>
        )}

        {/* Personas Panel */}
        {panel === 'personas' && !editingPersona && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold" style={{ color: '#1A1A2E' }}>Candidate personas</h1>
              <button onClick={() => setEditingPersona('new')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: '#1C2C6E' }}>
                <Plus size={16} /> New persona
              </button>
            </div>
            <div className="space-y-3">
              {config.personas.map((p) => (
                <div key={p.id} className="bg-white rounded-xl border p-4" style={{ borderColor: '#E2E4EF', borderLeft: config.activePersonaId === p.id ? '4px solid #1A7B8A' : undefined }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold" style={{ color: '#1A1A2E' }}>{p.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#5A5A7A' }}>{p.currentRole}</div>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>{p.moodSetting}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#E8F4F6', color: '#1A7B8A' }}>STAR: {p.starReadiness}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#F3F4F6', color: '#5A5A7A' }}>Curiosity: {p.curiosityLevel}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {config.activePersonaId !== p.id && (
                        <button onClick={() => setActivePersona(p.id)} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#E8F4F6', color: '#1A7B8A' }}>Set active</button>
                      )}
                      <button onClick={() => setEditingPersona(p)} className="p-1.5 rounded" style={{ color: '#5A5A7A' }}><Edit2 size={15} /></button>
                      {!p.isDefault && (
                        <button onClick={() => deletePersona(p.id)} className="p-1.5 rounded" style={{ color: '#dc2626' }}><Trash2 size={15} /></button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {panel === 'personas' && editingPersona && (
          <div>
            <h1 className="text-xl font-semibold mb-6" style={{ color: '#1A1A2E' }}>{editingPersona === 'new' ? 'New persona' : 'Edit persona'}</h1>
            <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E2E4EF' }}>
              <PersonaBuilder
                initial={editingPersona === 'new' ? undefined : editingPersona}
                onSave={savePersona}
                onCancel={() => setEditingPersona(null)}
              />
            </div>
          </div>
        )}

        {/* Settings */}
        {panel === 'settings' && (
          <div>
            <h1 className="text-xl font-semibold mb-6" style={{ color: '#1A1A2E' }}>Settings</h1>
            <div className="space-y-4">
              <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#E2E4EF' }}>
                <h2 className="font-semibold mb-3" style={{ color: '#1A1A2E' }}>Change facilitator PIN</h2>
                <div className="flex gap-3">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={8}
                    className="w-40 px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: '#E2E4EF' }}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="New PIN"
                  />
                  <button onClick={changePin} disabled={newPin.length < 4} className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40" style={{ backgroundColor: '#1C2C6E' }}>
                    Update PIN
                  </button>
                </div>
                {pinSuccess && <p className="text-sm mt-2 text-green-600">{pinSuccess}</p>}
              </div>

              <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#E2E4EF' }}>
                <h2 className="font-semibold mb-1" style={{ color: '#1A1A2E' }}>Session code</h2>
                <p className="text-sm mb-3" style={{ color: '#5A5A7A' }}>Generate a new 4-character session code. The old code will stop working immediately.</p>
                <button onClick={resetCode} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: '#E2E4EF', color: '#1A1A2E' }}>
                  <RefreshCw size={15} /> Reset session code
                </button>
              </div>

              <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#E2E4EF' }}>
                <h2 className="font-semibold mb-1" style={{ color: '#1A1A2E' }}>Export data</h2>
                <p className="text-sm mb-3" style={{ color: '#5A5A7A' }}>Download all session data, JDs, and persona configurations as a JSON file.</p>
                <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: '#E2E4EF', color: '#1A1A2E' }}>
                  <Download size={15} /> Export JSON
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Debrief modal */}
      {viewingDebrief && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-xl max-w-3xl w-full mx-4 my-8 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#E2E4EF' }}>
              <div>
                <div className="font-semibold" style={{ color: '#1A1A2E' }}>{viewingDebrief.participantName}</div>
                <div className="text-xs" style={{ color: '#5A5A7A' }}>Debrief report</div>
              </div>
              <button onClick={() => setViewingDebrief(null)} className="p-1.5 rounded" style={{ color: '#5A5A7A' }}>✕</button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {viewingDebrief.debrief && <DebriefReport report={viewingDebrief.debrief} personaName={config.personas.find((p) => p.id === viewingDebrief.personaId)?.name || ''} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
