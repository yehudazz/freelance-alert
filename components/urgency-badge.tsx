import React from 'react';

type UrgencyLevel = 'low' | 'medium' | 'high';

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
}

function getUrgencyClasses(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'low':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'high':
      return 'bg-red-100 text-red-800 border-red-300';
  }
}

function getLabel(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'low':
      return 'Low';
    case 'medium':
      return 'Medium';
    case 'high':
      return 'High';
  }
}

export function UrgencyBadge({ urgency }: UrgencyBadgeProps) {
  const classes = getUrgencyClasses(urgency);
  const label = getLabel(urgency);

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${classes}`}
      aria-label={`Urgency: ${label}`}
    >
      {label}
    </span>
  );
}

export default UrgencyBadge;
