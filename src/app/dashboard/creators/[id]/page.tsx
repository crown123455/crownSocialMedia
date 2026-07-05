'use client';

import React, { useState } from 'react';
import { useTenant } from '@/store/TenantContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ArrowLeft, MapPin, Phone, Mail, Camera as Instagram, MessageCircle as Facebook, PlaySquare as Youtube, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const TABS = ['Overview', 'Accounts', 'Media', 'Scheduled Posts', 'History', 'Analytics', 'Notes', 'Team Access'];

export default function CreatorDetailsPage({ params }: { params: { id: string } }) {
  const { creators, accounts } = useTenant();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');

  const creator = creators.find(c => c.id === params.id);
  const creatorAccounts = accounts.filter(a => a.creator_id === params.id);

  if (!creator) {
    return (
      <div className={styles.notFound}>
        <h2>Creator not found</h2>
        <Button onClick={() => router.push('/dashboard/creators')}>Back to Creators</Button>
      </div>
    );
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram size={20} />;
      case 'facebook': return <Facebook size={20} />;
      case 'youtube': return <Youtube size={20} />;
      case 'tiktok': return <Video size={20} />;
      default: return null;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Profile */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/dashboard/creators')}>
          <ArrowLeft size={20} /> Back
        </button>
        
        <Card padding="lg" className={styles.profileCard}>
          <div className={styles.profileMain}>
            <div className={styles.avatarWrap}>
              {creator.profile_photo ? (
                <img src={creator.profile_photo} alt={creator.display_name} className={styles.avatar} />
              ) : (
                <div className={styles.avatarFallback}>{creator.display_name.charAt(0)}</div>
              )}
            </div>
            <div className={styles.profileInfo}>
              <h1 className={styles.name}>{creator.full_name}</h1>
              <p className={styles.handle}>@{creator.display_name}</p>
              <div className={styles.badges}>
                <StatusBadge status={creator.contract_status === 'active' ? 'success' : 'warning'} label={creator.contract_status.toUpperCase()} />
                <StatusBadge status="neutral" label={creator.category} />
                <StatusBadge status="info" label={creator.content_package.replace('_', ' ').toUpperCase()} />
              </div>
            </div>
            <div className={styles.profileActions}>
              <Button variant="secondary">Edit Profile</Button>
              <Button variant="outline" className="text-error border-error">Archive</Button>
            </div>
          </div>
          
          <div className={styles.contactGrid}>
            <div className={styles.contactItem}><MapPin size={16} /> {creator.city}, {creator.country}</div>
            <div className={styles.contactItem}><Phone size={16} /> {creator.manager_name} ({creator.manager_phone})</div>
            <div className={styles.contactItem}><Mail size={16} /> {creator.manager_email}</div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map(tab => (
          <button 
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'Overview' && (
          <div className={styles.overviewGrid}>
            <Card className={styles.infoCard}>
              <h3>Contract Details</h3>
              <div className={styles.infoList}>
                <div className={styles.infoRow}>
                  <span>Target Content/Mo</span>
                  <strong>{creator.monthly_content_target} Posts</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Member Since</span>
                  <strong>{new Date(creator.created_at).toLocaleDateString()}</strong>
                </div>
              </div>
            </Card>
            
            <Card className={styles.infoCard}>
              <div className={styles.cardHeaderFlex}>
                <h3>Connected Accounts</h3>
                <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/accounts')}>Manage</Button>
              </div>
              {creatorAccounts.length === 0 ? (
                <p className="text-gray">No accounts connected yet.</p>
              ) : (
                <div className={styles.accountsList}>
                  {creatorAccounts.map(acc => (
                    <div key={acc.id} className={styles.accountItem}>
                      <div className={styles.accIcon}>{getPlatformIcon(acc.platform)}</div>
                      <div className={styles.accInfo}>
                        <strong>{acc.account_name}</strong>
                        <span>{acc.username_or_channel_name}</span>
                      </div>
                      <StatusBadge 
                        status={acc.connection_status === 'connected' ? 'success' : 'error'} 
                        label={acc.connection_status} 
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'Accounts' && (
          <Card padding="lg">
            <div className={styles.cardHeaderFlex}>
              <h2>Social Accounts</h2>
              <Button onClick={() => router.push('/dashboard/accounts')}>Link New Account</Button>
            </div>
            {/* Same list as overview but more detailed */}
          </Card>
        )}

        {/* Other tabs would be implemented similarly */}
        {['Media', 'Scheduled Posts', 'History', 'Analytics', 'Notes', 'Team Access'].includes(activeTab) && (
          <Card padding="lg" className={styles.placeholderTab}>
            <h3>{activeTab}</h3>
            <p className="text-gray">This section is isolated to {creator.full_name} and will be populated from Supabase in the next phase.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
