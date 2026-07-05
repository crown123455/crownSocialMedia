import React, { HTMLAttributes } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export function Card({ 
  children, 
  padding = 'md', 
  interactive = false,
  className = '',
  ...props 
}: CardProps) {
  const classes = [
    styles.card,
    styles[`p-${padding}`],
    interactive ? styles.interactive : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
