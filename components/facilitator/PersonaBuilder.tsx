'use client';

import { useState } from 'react';
import { CandidatePersona, MoodSetting, StarReadiness, CuriosityLevel, ResponseSensitivity, QuestionTopic, WorkEntry } from '@/lib/types';
import { generateId } from '@/lib/storage';
import { X, Plus, Upload, Loader2 } from 'lucide-react';

interface Props {
  initial?: CandidatePersona;
  onSave: (persona: CandidatePersona) => void;
  onCancel: () => void;
}

const MOOD_OPTIONS: { value: MoodSetting; label: string }[] = [
  { value: 'nervous', label: 'Nervous' },
  { value: 'confident', label: 'Confident' },
  { value: 'evasive', label: 'Evasive' },
  { value: 'over-talker', label: 'Over-talker' },
  { value: 'concise', label: 'Concise' },
  { value: 'analytical', label: 'Analytical' },
  { value: 'friendly', label: 'Friendly' },
];

const TOPIC_OPTIONS: { value: QuestionTopic; label: string }[] = [
  { value: 'role_scope', label: 'Role scope' },
  { value: 'team_culture', label: 'Team culture' },
  { value: 'career_path', label: 'Career path' },
  { value: 'learning_development', label: 'Learning & development' },
  { value: 'leadership_style', label: 'Leadership style' },
  { value: 'organisation_direction', label: 'Organisation direction' },
];

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('');
  function add() {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput('');
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((t) => (
          <span key={t} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#E8F4F6', color: '#1A7B8A' }}>
            {t}
            <button onClick={() => onChange(tags.filter((x) => x !== t))}><X size={12} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
          style={{ borderColor: '#E2E4EF' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
        />
        <button type="button" onClick={add} className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: '#E8F4F6', color: '#1A7B8A' }}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export function PersonaBuilder({ initial, onSave, onCancel }: Props) {
  const [tab, setTab] = useState<'upload' | 'build' | 'quick'>('build');
  const [name, setName] = useState(initial?.name || '');
  const [currentRole, setCurrentRole] = useState(initial?.currentRole || '');
  const [background, setBackground] = useState(initial?.background || '');
  const [workHistory, setWorkHistory] = useState<WorkEntry[]>(initial?.workHistory || []);
  const [skills, setSkills] = useState<string[]>(initial?.skills || []);
  const [traits, setTraits] = useState<string[]>(initial?.personalityTraits || []);
  const [mood, setMood] = useState<MoodSetting>(initial?.moodSetting || 'confident');
  const [starReadiness, setStarReadiness] = useState<StarReadiness>(initial?.starReadiness || 'average');
  const [curiosity, setCuriosity] = useState<CuriosityLevel>(initial?.curiosityLevel || 'medium');
  const [interests, setInterests] = useState<QuestionTopic[]>(initial?.priorityInterests || []);
  const [sensitivity, setSensitivity] = useState<ResponseSensitivity>(initial?.responseSensitivity || 'accepting');
  const [quickText, setQuickText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  function addWorkEntry() {
    setWorkHistory([...workHistory, { company: '', role: '', duration: '', highlights: [] }]);
  }

  function updateWorkEntry(i: number, field: keyof WorkEntry, value: string | string[]) {
    const updated = [...workHistory];
    (updated[i] as unknown as Record<string, unknown>)[field] = value;
    setWorkHistory(updated);
  }

  async function handleFileUpload(file: File) {
    setUploading(true);
    setUploadError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/parse-cv', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setName(data.name || '');
      setCurrentRole(data.currentRole || '');
      setBackground(data.background || '');
      setWorkHistory(data.workHistory || []);
      setSkills(data.skills || []);
      setTab('build');
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleQuickParse() {
    if (!quickText.trim()) return;
    setUploading(true);
    setUploadError('');
    try {
      const fd = new FormData();
      const blob = new Blob([quickText], { type: 'text/plain' });
      fd.append('file', blob, 'paste.txt');
      // Call AI directly via a quick inline parse
      const res = await fetch('/api/parse-cv', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setName(data.name || '');
      setCurrentRole(data.currentRole || '');
      setBackground(data.background || '');
      setWorkHistory(data.workHistory || []);
      setSkills(data.skills || []);
      setTab('build');
    } catch {
      // Fallback: just populate background with the text
      setBackground(quickText);
      setTab('build');
    } finally {
      setUploading(false);
    }
  }

  function toggleInterest(t: QuestionTopic) {
    setInterests((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  }

  function validate() {
    const e: string[] = [];
    if (!name.trim()) e.push('Name is required.');
    if (!currentRole.trim()) e.push('Current role is required.');
    if (!background.trim()) e.push('Background is required.');
    if (skills.length === 0) e.push('Add at least one skill.');
    return e;
  }

  function handleSave() {
    const e = validate();
    if (e.length > 0) { setErrors(e); setTab('build'); return; }
    onSave({
      id: initial?.id || generateId(),
      name,
      currentRole,
      background,
      workHistory,
      skills,
      personalityTraits: traits,
      moodSetting: mood,
      starReadiness,
      curiosityLevel: curiosity,
      priorityInterests: interests,
      responseSensitivity: sensitivity,
      createdAt: initial?.createdAt || new Date().toISOString(),
      isDefault: false,
    });
  }

  const tabClass = (t: string) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${tab === t ? 'border-[#1C2C6E] text-[#1C2C6E]' : 'border-transparent text-[#5A5A7A] hover:text-[#1A1A2E]'}`;

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: '#E2E4EF' }}>
        <button className={tabClass('upload')} onClick={() => setTab('upload')}>Upload CV</button>
        <button className={tabClass('build')} onClick={() => setTab('build')}>Build profile</button>
        <button className={tabClass('quick')} onClick={() => setTab('quick')}>Quick entry</button>
      </div>

      {/* Upload CV */}
      {tab === 'upload' && (
        <div>
          <label
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors hover:bg-gray-50"
            style={{ borderColor: '#E2E4EF' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
          >
            <input
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2" style={{ color: '#5A5A7A' }}>
                <Loader2 size={24} className="animate-spin" />
                <span className="text-sm">Parsing CV...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2" style={{ color: '#5A5A7A' }}>
                <Upload size={24} />
                <span className="text-sm">Drop a PDF or DOCX here, or click to browse</span>
              </div>
            )}
          </label>
          {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
        </div>
      )}

      {/* Quick Entry */}
      {tab === 'quick' && (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: '#5A5A7A' }}>Paste any information about the candidate — CV text, notes, a summary. We&apos;ll extract what we can.</p>
          <textarea
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
            style={{ borderColor: '#E2E4EF' }}
            rows={8}
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            placeholder="Paste candidate information here..."
          />
          <button
            onClick={handleQuickParse}
            disabled={!quickText.trim() || uploading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#1A7B8A' }}
          >
            {uploading && <Loader2 size={16} className="animate-spin" />}
            Parse and fill profile
          </button>
        </div>
      )}

      {/* Build Profile */}
      {tab === 'build' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: '#E2E4EF' }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Candidate name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Current role</label>
              <input className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: '#E2E4EF' }} value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} placeholder="e.g. Operations Manager" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Background summary</label>
            <textarea className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none" style={{ borderColor: '#E2E4EF' }} rows={3} value={background} onChange={(e) => setBackground(e.target.value)} placeholder="Brief professional background..." />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Work history</label>
              <button onClick={addWorkEntry} className="text-xs flex items-center gap-1 px-2 py-1 rounded" style={{ color: '#1A7B8A', backgroundColor: '#E8F4F6' }}>
                <Plus size={12} /> Add entry
              </button>
            </div>
            {workHistory.map((entry, i) => (
              <div key={i} className="border rounded-lg p-3 mb-2 space-y-2" style={{ borderColor: '#E2E4EF' }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input className="px-2 py-1.5 rounded border text-sm" style={{ borderColor: '#E2E4EF' }} placeholder="Company" value={entry.company} onChange={(e) => updateWorkEntry(i, 'company', e.target.value)} />
                  <input className="px-2 py-1.5 rounded border text-sm" style={{ borderColor: '#E2E4EF' }} placeholder="Role" value={entry.role} onChange={(e) => updateWorkEntry(i, 'role', e.target.value)} />
                  <input className="px-2 py-1.5 rounded border text-sm" style={{ borderColor: '#E2E4EF' }} placeholder="Duration" value={entry.duration} onChange={(e) => updateWorkEntry(i, 'duration', e.target.value)} />
                </div>
                <textarea className="w-full px-2 py-1.5 rounded border text-sm resize-none" style={{ borderColor: '#E2E4EF' }} rows={2} placeholder="Highlights (one per line)" value={entry.highlights.join('\n')} onChange={(e) => updateWorkEntry(i, 'highlights', e.target.value.split('\n').filter(Boolean))} />
                <button onClick={() => setWorkHistory(workHistory.filter((_, j) => j !== i))} className="text-xs" style={{ color: '#dc2626' }}>Remove</button>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Skills</label>
            <TagInput tags={skills} onChange={setSkills} placeholder="Add skill and press Enter" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Personality traits</label>
            <TagInput tags={traits} onChange={setTraits} placeholder="Add trait and press Enter" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mood setting</label>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
                  style={mood === m.value ? { backgroundColor: '#1C2C6E', color: '#fff', borderColor: '#1C2C6E' } : { backgroundColor: '#fff', color: '#5A5A7A', borderColor: '#E2E4EF' }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">STAR readiness</label>
            <div className="flex gap-3">
              {(['weak', 'average', 'strong'] as StarReadiness[]).map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="star" value={r} checked={starReadiness === r} onChange={() => setStarReadiness(r)} className="accent-[#1C2C6E]" />
                  <span className="text-sm capitalize">{r}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Question settings — always visible */}
      {tab !== 'upload' && (
        <div className="border-t pt-4 space-y-4" style={{ borderColor: '#E2E4EF' }}>
          <h3 className="text-sm font-semibold" style={{ color: '#1A1A2E' }}>Candidate question settings</h3>

          <div>
            <label className="block text-sm font-medium mb-2">Curiosity level</label>
            <div className="flex gap-6">
              {([
                { value: 'low', desc: 'One polite question if invited' },
                { value: 'medium', desc: 'Two targeted questions' },
                { value: 'high', desc: 'Up to three questions, actively curious' },
              ] as { value: CuriosityLevel; desc: string }[]).map((opt) => (
                <label key={opt.value} className="flex flex-col gap-0.5 cursor-pointer">
                  <div className="flex items-center gap-1.5">
                    <input type="radio" name="curiosity" value={opt.value} checked={curiosity === opt.value} onChange={() => setCuriosity(opt.value)} className="accent-[#1A7B8A]" />
                    <span className="text-sm font-medium capitalize">{opt.value}</span>
                  </div>
                  <span className="text-xs pl-5" style={{ color: '#5A5A7A' }}>{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority interests</label>
            <div className="flex flex-wrap gap-2">
              {TOPIC_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => toggleInterest(t.value)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                  style={interests.includes(t.value) ? { backgroundColor: '#1A7B8A', color: '#fff', borderColor: '#1A7B8A' } : { backgroundColor: '#fff', color: '#5A5A7A', borderColor: '#E2E4EF' }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Response sensitivity</label>
            <div className="flex gap-6">
              {([
                { value: 'accepting', desc: 'Accepts answers and moves on' },
                { value: 'probing', desc: 'Asks a follow-up if answer is vague' },
                { value: 'sceptical', desc: 'Gently challenges unconvincing answers' },
              ] as { value: ResponseSensitivity; desc: string }[]).map((opt) => (
                <label key={opt.value} className="flex flex-col gap-0.5 cursor-pointer">
                  <div className="flex items-center gap-1.5">
                    <input type="radio" name="sensitivity" value={opt.value} checked={sensitivity === opt.value} onChange={() => setSensitivity(opt.value)} className="accent-[#6B3FA0]" />
                    <span className="text-sm font-medium capitalize">{opt.value}</span>
                  </div>
                  <span className="text-xs pl-5" style={{ color: '#5A5A7A' }}>{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-lg p-3 text-sm" style={{ backgroundColor: '#FEF2F2', color: '#991B1B' }}>
          {errors.map((e, i) => <p key={i}>{e}</p>)}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: '#1C2C6E' }}>
          Save persona
        </button>
        <button onClick={onCancel} className="px-4 py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: '#E2E4EF', color: '#5A5A7A' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
