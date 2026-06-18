import React from 'react';

interface LeadScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

function getBackgroundColor(score: number): string {
  if (score >= 1 && score <= 4) return 'bg-red-500';
  if (score >= 5 && score <= 7) return 'bg-yellow-500';
  if (score >= 8 && score <= 10) return 'bg-green-500';
  return 'bg-gray-500';
}

function getSizeClasses(size: 'sm' | 'md' | 'lg'): string {
  switch (size) {
    case 'sm':
      return 'text-xs px-1.5 py-0.5 min-w-[1.25rem]';
    case 'lg':
      return 'text-base px-3 py-1.5 min-w-[2rem]';
    case 'md':
    default:
      return 'text-sm px-2 py-1 min-w-[1.5rem]';
  }
}

export function LeadScoreBadge({ score, size = 'md' }: LeadScoreBadgeProps) {
  const bgColor = getBackgroundColor(score);
  const sizeClasses = getSizeClasses(size);

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white ${bgColor} ${sizeClasses}`}
      aria-label={`Lead score: ${score}`}
    >
      {score}
    </span>
  );
}

export default LeadScoreBadge;
