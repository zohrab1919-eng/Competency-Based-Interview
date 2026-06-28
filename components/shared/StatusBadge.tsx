import { SessionStatus } from '@/lib/types';

const statusConfig: Record<SessionStatus, { label: string; bg: string; text: string }> = {
  not_started: { label: 'Not started', bg: '#F3F4F6', text: '#6B7280' },
  in_progress: { label: 'In progress', bg: '#FEF3C7', text: '#92400E' },
  completed: { label: 'Completed', bg: '#D1FAE5', text: '#065F46' },
};

export function StatusBadge({ status }: { status: SessionStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
}
