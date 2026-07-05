import React from 'react';
import styles from './StatusBadge.module.css';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
  const classes = [
    styles.badge,
    styles[`badge-${status}`],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {label}
    </span>
  );
}
