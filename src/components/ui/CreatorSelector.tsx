'use client';

import React from 'react';
import { useTenant } from '@/store/TenantContext';
import styles from './CreatorSelector.module.css';

export function CreatorSelector() {
  const { creators, activeCreatorId, setActiveCreatorId } = useTenant();

  return (
    <div className={styles.container}>
      <select 
        className={styles.select}
        value={activeCreatorId || ''}
        onChange={(e) => setActiveCreatorId(e.target.value)}
      >
        <option value="" disabled>Select a Creator...</option>
        {creators.map((c) => (
          <option key={c.id} value={c.id}>
            {c.display_name} ({c.category})
          </option>
        ))}
      </select>
    </div>
  );
}
