'use client';

import React from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Hammer } from 'lucide-react';
import { TenantGuard } from '@/components/ui/TenantGuard';
import { useTenant } from '@/store/TenantContext';

const TENANT_ROUTES = ['planner', 'studio', 'media', 'history', 'approvals'];

export default function PlaceholderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { activeCreator } = useTenant();
  const resolvedParams = React.use(params);
  const title = resolvedParams.slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const content = (
    <div style={{ maxWidth: '600px', margin: '40px auto' }}>
      <EmptyState 
        icon={Hammer}
        title={`${title} - Under Construction`}
        description={
          activeCreator 
            ? `The ${title} feature for ${activeCreator.full_name} is currently being built. This section will be connected to the API in the next phase of development.`
            : `The ${title} feature is currently being built. This section will be connected to the API in the next phase of development.`
        }
      />
    </div>
  );

  if (TENANT_ROUTES.includes(resolvedParams.slug)) {
    return <TenantGuard title={`Select Creator to view ${title}`}>{content}</TenantGuard>;
  }

  return content;
}
