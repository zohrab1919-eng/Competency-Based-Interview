'use client';

import { FacilitatorConfig, ParticipantSession } from './types';
import { defaultJDs, defaultPersonas } from './defaults';

const FACILITATOR_CONFIG_KEY = 'cbi_facilitator_config';
const PARTICIPANT_SESSION_KEY = 'cbi_participant_session';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function getDefaultConfig(): FacilitatorConfig {
  return {
    pin: process.env.NEXT_PUBLIC_FACILITATOR_PIN || '1234',
    sessionCode: generateSessionCode(),
    activeJdId: defaultJDs[0].id,
    activePersonaId: defaultPersonas[0].id,
    assignedPersonas: {},
    jds: defaultJDs,
    personas: defaultPersonas,
    sessions: [],
  };
}

export function loadFacilitatorConfig(): FacilitatorConfig {
  if (typeof window === 'undefined') return getDefaultConfig();
  try {
    const raw = localStorage.getItem(FACILITATOR_CONFIG_KEY);
    if (!raw) return getDefaultConfig();
    const parsed = JSON.parse(raw) as FacilitatorConfig;
    // Merge in defaults if missing
    if (!parsed.jds || parsed.jds.length === 0) parsed.jds = defaultJDs;
    if (!parsed.personas || parsed.personas.length === 0) parsed.personas = defaultPersonas;
    return parsed;
  } catch {
    return getDefaultConfig();
  }
}

export function saveFacilitatorConfig(config: FacilitatorConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FACILITATOR_CONFIG_KEY, JSON.stringify(config));
}

export function loadParticipantSession(): ParticipantSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PARTICIPANT_SESSION_KEY);
    return raw ? (JSON.parse(raw) as ParticipantSession) : null;
  } catch {
    return null;
  }
}

export function saveParticipantSession(session: ParticipantSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PARTICIPANT_SESSION_KEY, JSON.stringify(session));
}

export function clearParticipantSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PARTICIPANT_SESSION_KEY);
}
