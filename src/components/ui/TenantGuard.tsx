'use client';

import React, { ReactNode } from 'react';
import { useTenant } from '@/store/TenantContext';
import { EmptyState } from './EmptyState';
import { Users } from 'lucide-react';

export function TenantGuard({ children, title = 'Select a Creator' }: { children: ReactNode, title?: string }) {
  const { activeCreator } = useTenant();

  if (!activeCreator) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto' }}>
        <EmptyState
          icon={Users}
          title={title}
          description="You must select an active creator from the top menu to view the data for this page. Data on this platform is strictly isolated per creator."
        />
      </div>
    );
  }

  return <>{children}</>;
}
