import React, { SelectHTMLAttributes, useId } from 'react';
import styles from './Input.module.css'; // Reusing input styles for consistency

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  options: { label: string; value: string }[];
}

export function Select({ 
  label, 
  error, 
  fullWidth = false,
  className = '',
  id,
  options,
  ...props 
}: SelectProps) {
  const generatedId = useId();
  const selectId = id || `select-${generatedId}`;
  const containerClasses = [
    styles.container,
    fullWidth ? styles.fullWidth : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && <label htmlFor={selectId} className={styles.label}>{label}</label>}
      <select 
        id={selectId}
        className={`${styles.input} ${error ? styles.hasError : ''}`} 
        {...props}
      >
        <option value="" disabled>Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}
