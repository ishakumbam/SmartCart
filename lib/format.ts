export function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function milesFromKm(km: number | undefined): string {
  if (km == null || Number.isNaN(km)) return '—';
  return `${(km * 0.621371).toFixed(1)} mi`;
}

export function expiresSoon(iso: string, withinHours = 48): boolean {
  const t = new Date(iso).getTime();
  return t - Date.now() < withinHours * 60 * 60 * 1000;
}

/** Short relative label for notification timestamps */
export function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
