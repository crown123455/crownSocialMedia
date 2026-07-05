'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { useTenant } from '@/store/TenantContext';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Share2, 
  Calendar, 
  CheckSquare, 
  AlertCircle, 
  TrendingUp,
  Video,
  Activity,
  Plus,
  History,
  Filter
} from 'lucide-react';
import styles from './page.module.css';

export default function DashboardOverview() {
  const { activeCreator, creators, accounts, posts, logs } = useTenant();
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState<'month' | 'last_month' | 'year' | 'all'>('month');

  const activeCreatorsCount = creators.filter(c => c.contract_status === 'active').length || creators.length;
  
  // Filter by activeCreator if selected, else show all
  const targetAccounts = activeCreator ? accounts.filter(a => a.creator_id === activeCreator.id) : accounts;
  const targetPosts = activeCreator ? posts.filter(p => p.creator_id === activeCreator.id) : posts;

  const connectedAccountsCount = targetAccounts.filter(a => a.connection_status === 'connected').length || targetAccounts.length;
  const scheduledPostsCount = targetPosts.filter(p => p.status === 'scheduled').length;
  
  // Real exact Published this month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const publishedThisMonth = targetPosts.filter(p => {
    if (p.status !== 'published') return false;
    const pDate = new Date(p.created_at || Date.now());
    return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
  }).length;

  const failedPostsCount = targetPosts.filter(p => p.status === 'failed').length;
  const latestPost = targetPosts[0];

  // Time filtered posts for single-line display
  const filteredPosts = targetPosts.filter(p => {
    const pDate = new Date(p.created_at || Date.now());
    if (timeFilter === 'month') {
      return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
    } else if (timeFilter === 'last_month') {
      const lastM = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastY = currentMonth === 0 ? currentYear - 1 : currentYear;
      return pDate.getMonth() === lastM && pDate.getFullYear() === lastY;
    } else if (timeFilter === 'year') {
      return pDate.getFullYear() === currentYear;
    }
    return true;
  });

  const stats = [
    { label: 'صناع المحتوى النشطين (Active Creators)', value: activeCreatorsCount.toString(), icon: Users, status: activeCreatorsCount > 0 ? 'Live Data' : 'Empty' },
    { label: 'الحسابات المربوطة (Linked Accounts)', value: connectedAccountsCount.toString(), icon: Share2, status: connectedAccountsCount > 0 ? 'Connected' : 'No Account' },
    { label: 'فيديوهات الشهر الحالي (Monthly Published)', value: publishedThisMonth.toString(), icon: Video, status: publishedThisMonth > 0 ? 'Active Month' : 'Ready' },
    { label: 'المنشورات المجدولة (Scheduled Posts)', value: scheduledPostsCount.toString(), icon: Calendar, status: scheduledPostsCount > 0 ? 'Active' : 'Zero' },
    { label: 'فشل في النشر (Failed Posts)', value: failedPostsCount.toString(), icon: AlertCircle, status: failedPostsCount > 0 ? 'Warning' : 'All Good' },
    { label: 'آخر فيديو تمت إضافته (Latest Video)', value: latestPost ? (latestPost.global_caption.substring(0, 15) + '...') : 'لا يوجد', icon: Video, status: latestPost ? 'Ready' : 'None' },
  ];

  const formatTime12H = (dateStr?: string) => {
    if (!dateStr) return '5:00 مساءً';
    try {
      const d = new Date(dateStr);
      let h = d.getHours();
      const m = d.getMinutes().toString().padStart(2, '0');
      const period = h >= 12 ? 'مساءً' : 'صباحاً';
      if (h > 12) h -= 12;
      if (h === 0) h = 12;
      return `${h}:${m} ${period}`;
    } catch {
      return '5:00 مساءً';
    }
  };

  let publishedCounter = 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {activeCreator ? `نظرة عامة على: ${activeCreator.full_name}` : 'مرحباً بك مجدداً، الإدارة العامة'}
          </h1>
          <p className={styles.subtitle}>
            {activeCreator ? `نظرة عامة حقيقية ومتابعة دقيقة للمنشورات والحسابات المربوطة لصانع المحتوى (${activeCreator.full_name}).` : 'إليك ملخص وإحصائيات نظام Crown الحية والواقعية لهذا اليوم.'}
          </p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className={styles.statCard}>
              <div className={styles.statHeader}>
                <div className={styles.iconWrapper}>
                  <Icon size={20} />
                </div>
                <StatusBadge status={stat.status === 'All Good' || stat.status === 'Live Data' || stat.status === 'Connected' || stat.status === 'Active Month' || stat.status === 'Ready' ? 'success' : 'warning'} label={stat.status} />
              </div>
              <div className={styles.statBody}>
                <p className={styles.statLabel}>{stat.label}</p>
                <h3 className={styles.statValue}>{stat.value}</h3>
              </div>
            </Card>
          );
        })}
      </div>

      <div className={styles.bottomGrid} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginTop: '24px' }}>
        <Card className={styles.chartCard} padding="lg">
          <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={20} className="text-blue-600" />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>
                سجل المنشورات وحالة النشر (Single-Line Status Log)
              </h3>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setTimeFilter('month')} 
                style={{ padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #cbd5e1', background: timeFilter === 'month' ? '#2563eb' : '#fff', color: timeFilter === 'month' ? '#fff' : '#475569', transition: 'all 0.2s' }}
              >
                هذا الشهر
              </button>
              <button 
                onClick={() => setTimeFilter('last_month')} 
                style={{ padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #cbd5e1', background: timeFilter === 'last_month' ? '#2563eb' : '#fff', color: timeFilter === 'last_month' ? '#fff' : '#475569', transition: 'all 0.2s' }}
              >
                الشهر الماضي
              </button>
              <button 
                onClick={() => setTimeFilter('year')} 
                style={{ padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #cbd5e1', background: timeFilter === 'year' ? '#2563eb' : '#fff', color: timeFilter === 'year' ? '#fff' : '#475569', transition: 'all 0.2s' }}
              >
                السنة كاملة
              </button>
              <button 
                onClick={() => setTimeFilter('all')} 
                style={{ padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #cbd5e1', background: timeFilter === 'all' ? '#2563eb' : '#fff', color: timeFilter === 'all' ? '#fff' : '#475569', transition: 'all 0.2s' }}
              >
                الكل
              </button>
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <p style={{ fontSize: '15px', fontWeight: '600' }}>لا توجد منشورات في هذه الفترة الزمنية المحددة.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredPosts.map((post, index) => {
                const isPublished = post.status === 'published';
                const isFailed = post.status === 'failed';
                const isScheduled = post.status === 'scheduled';
                if (isPublished) publishedCounter++;
                const creatorName = creators.find(c => c.id === post.creator_id)?.full_name || 'صانع محتوى';
                
                return (
                  <div key={post.id || index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: isFailed ? '#fef2f2' : isPublished ? '#f0fdf4' : '#f8fafc', borderRadius: '12px', border: `1px solid ${isFailed ? '#fecaca' : isPublished ? '#bbf7d0' : '#e2e8f0'}`, fontSize: '14px', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '200px' }}>
                      {isPublished && (
                        <span style={{ background: '#166534', color: '#fff', padding: '2px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                          #{publishedCounter}
                        </span>
                      )}
                      {isScheduled && (
                        <span style={{ background: '#1d4ed8', color: '#fff', padding: '2px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                          مجدول
                        </span>
                      )}
                      {isFailed && (
                        <span style={{ background: '#b91c1c', color: '#fff', padding: '2px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                          فشل
                        </span>
                      )}
                      <span style={{ fontWeight: 'bold', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '350px' }}>
                        {post.global_caption || 'منشور فيديو كراون'}
                      </span>
                      <span style={{ color: '#64748b', fontSize: '12px' }}>
                        ({creatorName})
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px' }}>
                      {isFailed && (
                        <span style={{ color: '#b91c1c', fontWeight: 'bold', fontSize: '12px', background: '#fee2e2', padding: '2px 8px', borderRadius: '6px' }}>
                          تعذر الاتصال بالمنصة أو انتهاء التوكن
                        </span>
                      )}
                      <span style={{ color: '#475569', fontWeight: '600' }}>
                        الوقت: {formatTime12H((post as any).scheduled_at || post.publish_at || post.created_at)}
                      </span>
                      <span style={{ color: '#64748b', fontSize: '12px' }}>
                        {new Date(post.created_at || Date.now()).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
        
        <Card className={styles.activityCard}>
          <div className={styles.cardHeader}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} className="text-blue-600" />
              سجل النشاطات الحديثة (Recent Activity)
            </h3>
            <StatusBadge status="info" label={`${logs.length} أحداث`} />
          </div>
          {logs.length === 0 ? (
            <div className={styles.emptyList}>
              <p className="text-gray">لا توجد نشاطات مسجلة حتى الآن.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
              {logs.slice(0, 5).map(log => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block' }}>{log.action}</strong>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>{log.resource}</span>
                  </div>
                  <StatusBadge status={log.status === 'Success' ? 'success' : 'error'} label={log.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
