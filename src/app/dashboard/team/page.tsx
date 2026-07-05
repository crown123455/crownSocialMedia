'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ShieldAlert, Plus, Users2 } from 'lucide-react';
import styles from './page.module.css';

const MOCK_TEAM = [
  { id: '1', name: 'Admin User', email: 'admin@gmail.com', role: 'Owner' },
  { id: '2', name: 'Sarah Manager', email: 'sarah@crown.com', role: 'Admin' },
  { id: '3', name: 'Ali Editor', email: 'ali@crown.com', role: 'Editor' },
];

const ROLES = [
  { value: 'Owner', label: 'Owner (All access)' },
  { value: 'Admin', label: 'Admin (Manage accounts, publish, analytics)' },
  { value: 'Editor', label: 'Editor (Upload media, draft posts)' },
  { value: 'Publisher', label: 'Publisher (Schedule & Publish only)' },
  { value: 'Analyst', label: 'Analyst (View analytics only)' },
  { value: 'Client Viewer', label: 'Client Viewer (View & approve content)' },
];

export default function TeamPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Team Access & Roles</h1>
          <p className={styles.subtitle}>Manage who has access to Crown and their permissions.</p>
        </div>
        <Button variant="primary">
          <Plus size={16} /> Invite Member
        </Button>
      </div>

      <Card className={styles.warningCard} padding="lg">
        <ShieldAlert className="text-gold" size={24} />
        <div>
          <h3>Role-Based Access Control (RBAC)</h3>
          <p className="text-gray">Currently showing UI configurations. In Prompt 5, these roles will be strictly enforced using Supabase Row Level Security (RLS) policies to ensure data integrity.</p>
        </div>
      </Card>

      <Card padding="none">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TEAM.map(member => (
                <tr key={member.id}>
                  <td>
                    <div className={styles.userInfo}>
                      <div className={styles.avatar}>{member.name.charAt(0)}</div>
                      <strong>{member.name}</strong>
                    </div>
                  </td>
                  <td><span className="text-gray">{member.email}</span></td>
                  <td>
                    <Select 
                      options={ROLES} 
                      value={member.role} 
                      onChange={() => {}} 
                      disabled={member.role === 'Owner'}
                      className={styles.roleSelect}
                    />
                  </td>
                  <td><StatusBadge status="success" label="Active" /></td>
                  <td>
                    <Button variant="ghost" size="sm" className="text-error" disabled={member.role === 'Owner'}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
