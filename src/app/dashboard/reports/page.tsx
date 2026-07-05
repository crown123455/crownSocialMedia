'use client';

import React, { useState } from 'react';
import { useTenant } from '@/store/TenantContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Download, FileText, AlertCircle } from 'lucide-react';
import styles from './page.module.css';

export default function ReportBuilderPage() {
  const { creators } = useTenant();
  const [selectedCreatorId, setSelectedCreatorId] = useState('');
  const [platform, setPlatform] = useState('all');
  const [dateRange, setDateRange] = useState('last_30');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Report Builder</h1>
          <p className={styles.subtitle}>Generate custom PDF analytics reports for clients.</p>
        </div>
        <div className={styles.actions} title="PDF generation will be enabled in Phase 6">
          <Button variant="primary" disabled>
            <Download size={16} /> Export PDF
          </Button>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Configuration Panel */}
        <div className={styles.configPanel}>
          <Card padding="lg" className={styles.card}>
            <h3 className={styles.sectionTitle}>Report Settings</h3>
            <div className={styles.formGroup}>
              <Select 
                label="Target Creator"
                value={selectedCreatorId}
                onChange={(e) => setSelectedCreatorId(e.target.value)}
                options={creators.map(c => ({ label: c.full_name, value: c.id }))}
              />
              <Select 
                label="Platform Focus"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                options={[
                  { label: 'All Platforms (Aggregated)', value: 'all' },
                  { label: 'Instagram Only', value: 'instagram' },
                  { label: 'YouTube Only', value: 'youtube' },
                  { label: 'TikTok Only', value: 'tiktok' },
                ]}
              />
              <Select 
                label="Date Range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                options={[
                  { label: 'Last 7 Days', value: 'last_7' },
                  { label: 'Last 30 Days', value: 'last_30' },
                  { label: 'This Month', value: 'this_month' },
                  { label: 'Custom Range', value: 'custom' },
                ]}
              />
            </div>

            <div className={styles.metricsSelect}>
              <h4 className={styles.subTitle}>Include Metrics</h4>
              <label className={styles.checkbox}>
                <input type="checkbox" defaultChecked /> Follower Growth
              </label>
              <label className={styles.checkbox}>
                <input type="checkbox" defaultChecked /> Reach & Impressions
              </label>
              <label className={styles.checkbox}>
                <input type="checkbox" defaultChecked /> Engagement Rate
              </label>
              <label className={styles.checkbox}>
                <input type="checkbox" defaultChecked /> Top Performing Posts
              </label>
            </div>
            
            <Button className="w-full mt-4">Generate Preview</Button>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className={styles.previewPanel}>
          <Card padding="none" className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <FileText size={20} className="text-gray" />
              <span>Report Preview</span>
            </div>
            <div className={styles.previewContent}>
              {!selectedCreatorId ? (
                <div className={styles.emptyPreview}>
                  <AlertCircle size={32} className="text-gray-medium mb-2" />
                  <p>Select a creator to generate a preview.</p>
                </div>
              ) : (
                <div className={styles.mockReport}>
                  <div className={styles.mockHeader}>
                    <h2>Monthly Performance Report</h2>
                    <p>{creators.find(c => c.id === selectedCreatorId)?.full_name}</p>
                  </div>
                  <div className={styles.mockBody}>
                    <div className={styles.skeletonLine}></div>
                    <div className={styles.skeletonLine}></div>
                    <div className={styles.skeletonBlock}></div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
