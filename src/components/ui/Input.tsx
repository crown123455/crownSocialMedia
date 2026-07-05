import React, { InputHTMLAttributes, useId } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export function Input({ 
  label, 
  error, 
  fullWidth = false,
  className = '',
  id,
  ...props 
}: InputProps) {
  const generatedId = useId();
  const inputId = id || `input-${generatedId}`;
  const containerClasses = [
    styles.container,
    fullWidth ? styles.fullWidth : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
      <input 
        id={inputId}
        className={`${styles.input} ${error ? styles.hasError : ''}`} 
        {...props} 
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}
