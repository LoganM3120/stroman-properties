'use client';

import { useEffect, useState } from 'react';

interface CountdownProps {
  target: string | null;
  timezone?: string;
}

function formatDuration(ms: number): string {
  if (ms <= 0) {
    return 'Expired';
  }
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours || days) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(' ');
}

export default function Countdown({ target, timezone }: CountdownProps) {
  const [remaining, setRemaining] = useState<string>(() => {
    if (!target) return '—';
    const targetDate = new Date(target);
    if (Number.isNaN(targetDate.getTime())) {
      return '—';
    }
    const diff = targetDate.getTime() - Date.now();
    return formatDuration(diff);
  });

  useEffect(() => {
    if (!target) {
      setRemaining('—');
      return;
    }
    const targetDate = new Date(target);
    if (Number.isNaN(targetDate.getTime())) {
      setRemaining('—');
      return;
    }
    const update = () => {
      const diff = targetDate.getTime() - Date.now();
      setRemaining(formatDuration(diff));
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  return <span className="countdown" data-timezone={timezone}>{remaining}</span>;
}
