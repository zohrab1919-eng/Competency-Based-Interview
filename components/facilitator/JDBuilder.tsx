'use client';

import { useState } from 'react';
import { JobDescription } from '@/lib/types';
import { generateId } from '@/lib/storage';
import { X, Plus } from 'lucide-react';

interface Props {
  initial?: JobDescription;
  onSave: (jd: JobDescription) => void;
  onCancel: () => void;
}

function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
}) {
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
          <span
            key={t}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: '#E8EBF7', color: '#1C2C6E' }}
          >
            {t}
            <button onClick={() => onChange(tags.filter((x) => x !== t))}>
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2"
          style={{ borderColor: '#E2E4EF' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#E8EBF7', color: '#1C2C6E' }}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export function JDBuilder({ initial, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title || '');
  const [roleOverview, setRoleOverview] = useState(initial?.roleOverview || '');
  const [keyExpectations, setKeyExpectations] = useState(initial?.keyExpectations || '');
  const [skills, setSkills] = useState<string[]>(initial?.mustHaveSkills || []);
  const [behaviours, setBehaviours] = useState<string[]>(initial?.leadershipBehaviours || []);
  const [errors, setErrors] = useState<string[]>([]);

  function validate() {
    const e: string[] = [];
    if (!title.trim()) e.push('Role title is required.');
    if (!roleOverview.trim()) e.push('Role overview is required.');
    if (!keyExpectations.trim()) e.push('Key expectations are required.');
    if (skills.length < 3) e.push('Add at least 3 must-have skills.');
    if (behaviours.length < 3) e.push('Add at least 3 leadership behaviours.');
    return e;
  }

  function handleSave() {
    const e = validate();
    if (e.length > 0) { setErrors(e); return; }
    onSave({
      id: initial?.id || generateId(),
      title,
      roleOverview,
      keyExpectations,
      mustHaveSkills: skills,
      leadershipBehaviours: behaviours,
      createdAt: initial?.createdAt || new Date().toISOString(),
      isDefault: false,
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A2E' }}>Role title</label>
        <input
          className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2"
          style={{ borderColor: '#E2E4EF' }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Senior Operations Manager"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A2E' }}>Role overview</label>
        <textarea
          className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 resize-none"
          style={{ borderColor: '#E2E4EF' }}
          rows={4}
          value={roleOverview}
          onChange={(e) => setRoleOverview(e.target.value)}
          placeholder="Describe the scope, team size, and context of the role..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A2E' }}>Key expectations</label>
        <textarea
          className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 resize-none"
          style={{ borderColor: '#E2E4EF' }}
          rows={3}
          value={keyExpectations}
          onChange={(e) => setKeyExpectations(e.target.value)}
          placeholder="What does success look like in Year 1?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A2E' }}>Must-have skills <span className="text-xs font-normal" style={{ color: '#5A5A7A' }}>(min 3)</span></label>
        <TagInput tags={skills} onChange={setSkills} placeholder="Add a skill and press Enter" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A2E' }}>Leadership behaviours <span className="text-xs font-normal" style={{ color: '#5A5A7A' }}>(min 3)</span></label>
        <TagInput tags={behaviours} onChange={setBehaviours} placeholder="Add a behaviour and press Enter" />
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg p-3 text-sm" style={{ backgroundColor: '#FEF2F2', color: '#991B1B' }}>
          {errors.map((e, i) => <p key={i}>{e}</p>)}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: '#1C2C6E' }}
        >
          Save job description
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 rounded-lg text-sm font-medium border"
          style={{ borderColor: '#E2E4EF', color: '#5A5A7A' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
