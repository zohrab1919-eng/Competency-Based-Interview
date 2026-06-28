import { ParticipantSession } from './types';

// In-memory store — persists for the lifetime of the server process.
// Suitable for single-session workshops. Resets on redeploy.
declare global {
  // eslint-disable-next-line no-var
  var __cbiSessionStore: Map<string, ParticipantSession> | undefined;
}

const store: Map<string, ParticipantSession> =
  global.__cbiSessionStore ?? new Map();
global.__cbiSessionStore = store;

export function getAllSessions(): ParticipantSession[] {
  return Array.from(store.values()).sort(
    (a, b) => new Date(a.startedAt || 0).getTime() - new Date(b.startedAt || 0).getTime()
  );
}

export function getSession(id: string): ParticipantSession | undefined {
  return store.get(id);
}

export function upsertSession(session: ParticipantSession): void {
  store.set(session.id, session);
}

export function deleteSession(id: string): void {
  store.delete(id);
}

export function clearAllSessions(): void {
  store.clear();
}
