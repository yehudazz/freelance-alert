'use client';

import { useState, useEffect } from 'react';

interface TimeAgoProps {
  date: string | Date;
}

function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 30) {
    return 'just now';
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
  }

  const diffYears = Math.floor(diffMonths / 12);
  return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
}

export function TimeAgo({ date }: TimeAgoProps) {
  const [relativeTime, setRelativeTime] = useState<string>(() => getRelativeTime(date));

  useEffect(() => {
    setRelativeTime(getRelativeTime(date));

    const interval = setInterval(() => {
      setRelativeTime(getRelativeTime(date));
    }, 60_000);

    return () => clearInterval(interval);
  }, [date]);

  const isoString = typeof date === 'string' ? date : date.toISOString();

  return (
    <time dateTime={isoString} title={isoString}>
      {relativeTime}
    </time>
  );
}

export default TimeAgo;
