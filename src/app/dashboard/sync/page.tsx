'use client';

import React, { useState } from 'react';
import { useTenant } from '@/store/TenantContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/ToastProvider';
import { RefreshCw, AlertCircle } from 'lucide-react';
import styles from './page.module.css';
import { SyncJob } from '@/types';

export default function SyncCenterPage() {
  const { accounts, creators, addLog } = useTenant();
  const { success, error } = useToast();
  
  const [syncingAccounts, setSyncingAccounts] = useState<string[]>([]);
  const [jobs, setJobs] = useState<SyncJob[]>([
    {
      id: 'job_1',
      social_account_id: 'a1',
      platform: 'instagram',
      status: 'success',
      started_at: new Date(Date.now() - 3600000).toISOString(),
      completed_at: new Date(Date.now() - 3595000).toISOString(),
      records_fetched: 45
    }
  ]);

  const handleSync = (accountId: string, platform: string) => {
    setSyncingAccounts(prev => [...prev, accountId]);
    
    // Simulate API job
    setTimeout(() => {
      setSyncingAccounts(prev => prev.filter(id => id !== accountId));
      
      const isSuccess = Math.random() > 0.3; // 70% success rate for demo
      
      const newJob: SyncJob = {
        id: `job_${Date.now()}`,
        social_account_id: accountId,
        platform,
        status: isSuccess ? 'success' : 'failed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        records_fetched: isSuccess ? Math.floor(Math.random() * 100) : 0,
        error_message: isSuccess ? undefined : 'Rate limit exceeded or token invalid'
      };
      
      setJobs(prev => [newJob, ...prev]);
      addLog('Manual Sync', `${platform} account sync`, isSuccess ? 'Success' : 'Failed');
      
      if (isSuccess) {
        success(`Successfully synced data for ${platform}`);
      } else {
        error(`Failed to sync ${platform}. Check logs for details.`);
      }
    }, 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Data Sync Center</h1>
          <p className={styles.subtitle}>Manage background jobs and manual API synchronizations.</p>
        </div>
        <Button variant="primary">
          <RefreshCw size={16} /> Sync All Enabled
        </Button>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <Card padding="none">
            <div className={styles.cardHeader}>
              <h3>Connected Accounts</h3>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Creator</th>
                  <th>Account</th>
                  <th>Platform</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray">No accounts connected</td>
                  </tr>
                ) : (
                  accounts.map(acc => {
                    const creator = creators.find(c => c.id === acc.creator_id);
                    const isSyncing = syncingAccounts.includes(acc.id);
                    return (
                      <tr key={acc.id}>
                        <td><strong>{creator?.full_name}</strong></td>
                        <td>{acc.account_name}</td>
                        <td className="capitalize">{acc.platform}</td>
                        <td>
                          <StatusBadge 
                            status={acc.connection_status === 'connected' ? 'success' : 'error'} 
                            label={acc.connection_status} 
                          />
                        </td>
                        <td>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            disabled={isSyncing || acc.connection_status !== 'connected'}
                            onClick={() => handleSync(acc.id, acc.platform)}
                          >
                            <RefreshCw size={14} className={isSyncing ? styles.spin : ''} />
                            {isSyncing ? 'Syncing...' : 'Sync Now'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Card>
        </div>

        <div className={styles.sideCol}>
          <Card padding="none">
            <div className={styles.cardHeader}>
              <h3>Recent Jobs</h3>
            </div>
            <div className={styles.jobsList}>
              {jobs.map(job => (
                <div key={job.id} className={styles.jobItem}>
                  <div className={styles.jobHeader}>
                    <span className="capitalize font-medium">{job.platform} Sync</span>
                    <StatusBadge 
                      status={job.status === 'success' ? 'success' : 'error'} 
                      label={job.status} 
                    />
                  </div>
                  <div className={styles.jobDetails}>
                    <span>{new Date(job.started_at).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span>{job.records_fetched} records</span>
                  </div>
                  {job.error_message && (
                    <div className={styles.jobError}>
                      <AlertCircle size={14} />
                      {job.error_message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
