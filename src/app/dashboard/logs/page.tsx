'use client';

import React from 'react';
import { useTenant } from '@/store/TenantContext';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Activity } from 'lucide-react';
import styles from './page.module.css';
import { EmptyState } from '@/components/ui/EmptyState';

export default function SystemLogsPage() {
  const { logs } = useTenant();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>System Audit Logs</h1>
          <p className={styles.subtitle}>Track all activities and changes across the platform.</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <EmptyState 
          icon={Activity}
          title="No activity yet"
          description="System logs will appear here when users perform actions like linking accounts or modifying creators."
        />
      ) : (
        <Card padding="none">
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td className="text-gray">{new Date(log.timestamp).toLocaleString()}</td>
                    <td><strong>{log.user_name}</strong></td>
                    <td>{log.action}</td>
                    <td className="text-gray">{log.resource}</td>
                    <td>
                      <StatusBadge 
                        status={log.status === 'Success' ? 'success' : 'error'} 
                        label={log.status} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
