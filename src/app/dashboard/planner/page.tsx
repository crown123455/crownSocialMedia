'use client';

import React, { useState } from 'react';
import { useTenant } from '@/store/TenantContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, History } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function PlannerPage() {
  const { activeCreator, setActiveCreatorId, creators, posts, postTargets } = useTenant();
  const router = useRouter();
  
  // Basic calendar state and view mode
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [brandSearch, setBrandSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<'month' | 'last_month' | 'year' | 'all'>('month');

  const filteredCreators = creators.filter(c => c.full_name.toLowerCase().includes(brandSearch.toLowerCase()));
  const creatorPosts = activeCreator ? posts.filter(p => p.creator_id === activeCreator.id) : [];

  // Generate days for the current view
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const allDays = getDaysInMonth(currentDate);
  const days = viewMode === 'week' ? allDays.slice(0, 7) : allDays;
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const handleDuplicatePost = (post: any) => {
    const pTargets = postTargets.filter(t => t.post_id === post.id);
    const targetAccountIds = pTargets.map(t => t.social_account_id);
    const dupData = {
      creator_id: post.creator_id,
      caption: post.global_caption || '',
      media_url: post.media_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80',
      media_type: post.media_type || 'video',
      target_account_ids: targetAccountIds
    };
    localStorage.setItem('duplicate_post', JSON.stringify(dupData));
    router.push('/dashboard/studio');
  };

  // Time filtered posts for single-line display
  const now = new Date();
  const currentM = now.getMonth();
  const currentY = now.getFullYear();

  const filteredPosts = creatorPosts.filter(p => {
    const pDate = new Date(p.created_at || Date.now());
    if (timeFilter === 'month') {
      return pDate.getMonth() === currentM && pDate.getFullYear() === currentY;
    } else if (timeFilter === 'last_month') {
      const lastM = currentM === 0 ? 11 : currentM - 1;
      const lastY = currentM === 0 ? currentY - 1 : currentY;
      return pDate.getMonth() === lastM && pDate.getFullYear() === lastY;
    } else if (timeFilter === 'year') {
      return pDate.getFullYear() === currentY;
    }
    return true;
  });

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
    <div className={styles.container} dir="rtl">
      {/* Clean Light Brand Selector Top Bar */}
      <div style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', overflow: 'hidden', border: activeCreator?.profile_photo ? '2px solid #3b82f6' : 'none' }}>
            {activeCreator?.profile_photo ? (
              <img src={activeCreator.profile_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : 'C'}
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>جدول المحتوى الذكي (Content Planner)</span>
              {activeCreator && <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>{activeCreator.full_name}</span>}
            </h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>اختر الصانع لعرض الفيديوهات المنشورة، انقر مرتين (Double Click) على أي فيديو لتكراره ونشره مرة أخرى</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <select
            value={activeCreator?.id || ''}
            onChange={(e) => {
              setActiveCreatorId(e.target.value || null);
            }}
            style={{ background: '#f8fafc', color: '#1e293b', padding: '12px 20px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: 'bold', minWidth: '240px', outline: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
          >
            <option value="">-- اختر الصانع / العلامة التجارية --</option>
            {creators.map(c => (
              <option key={c.id} value={c.id}>{c.full_name} ({c.category})</option>
            ))}
          </select>

          <Button variant="primary" onClick={() => router.push('/dashboard/studio')} style={{ background: '#2563eb', color: '#fff', fontWeight: 'bold', padding: '12px 22px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> إنشاء منشور جديد
          </Button>
        </div>
      </div>

      {!activeCreator ? (
        <div style={{ background: '#ffffff', padding: '60px 20px', borderRadius: '20px', textAlign: 'center', border: '1px dashed #cbd5e1', color: '#64748b', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '20px', color: '#2563eb', marginBottom: '10px', fontWeight: 'bold' }}>يرجى اختيار صانع المحتوى أولاً</h3>
          <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '450px', margin: '0 auto' }}>اختر أحد الصناع من القائمة المنسدلة في الشريط العلوي لعرض الجدول الزمني والفيديوهات المنشورة</p>
        </div>
      ) : (
      <div>
        <div className={styles.header} style={{ marginBottom: '16px' }}>
          <div>
            <h2 className={styles.title} style={{ fontSize: '20px', color: '#0f172a', fontWeight: 'bold' }}>جدول منشورات: <span style={{ color: '#2563eb' }}>{activeCreator.full_name}</span></h2>
          </div>
        </div>

        <Card padding="none" className={styles.calendarCard} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div className={styles.calendarHeader}>
            <div className={styles.monthNav}>
              <button className={styles.iconBtn} onClick={prevMonth}><ChevronLeft size={20} /></button>
              <h2 className={styles.monthName}>{monthName}</h2>
              <button className={styles.iconBtn} onClick={nextMonth}><ChevronRight size={20} /></button>
            </div>
            <div className={styles.viewToggles}>
              <button 
                className={viewMode === 'month' ? styles.toggleActive : styles.toggle}
                onClick={() => setViewMode('month')}
              >
                Month (شهر)
              </button>
              <button 
                className={viewMode === 'week' ? styles.toggleActive : styles.toggle}
                onClick={() => setViewMode('week')}
              >
                Week (أسبوع)
              </button>
            </div>
          </div>

          <div className={styles.calendarGrid}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className={styles.weekdayHeader}>{day}</div>
            ))}
            
            {/* Mock offset for first day */}
            {viewMode === 'month' && (
              <>
                <div className={styles.dayCell}></div>
                <div className={styles.dayCell}></div>
              </>
            )}
            
            {days.map(day => {
              // Exact posts matching year, month, day without fake fallbacks
              const exactPosts = creatorPosts.filter(p => {
                const pDate = new Date((p as any).scheduled_time || (p as any).scheduled_at || p.created_at || Date.now());
                return pDate.getFullYear() === currentDate.getFullYear() && pDate.getMonth() === currentDate.getMonth() && pDate.getDate() === day;
              });

              return (
                <div key={day} className={styles.dayCell}>
                  <span className={styles.dayNumber}>{day}</span>
                  <div className={styles.dayContent}>
                    {exactPosts.map(p => {
                      const pDate = new Date((p as any).scheduled_time || (p as any).scheduled_at || p.created_at || Date.now());
                      const dayNameAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][pDate.getDay()];
                      let hours = pDate.getHours();
                      const period = hours >= 12 ? 'مساءً' : 'صباحاً';
                      if (hours > 12) hours -= 12;
                      if (hours === 0) hours = 12;
                      const timeStr = `${hours}:00 ${period}`;

                      return (
                        <div
                          key={p.id}
                          onDoubleClick={() => handleDuplicatePost(p)}
                          onClick={() => {
                            if (window.confirm(`هل تريد تكرار (Duplicate) هذا الفيديو ونشره مرة أخرى في الاستوديو؟\n\nالعنوان: ${p.global_caption || 'فيديو بدون عنوان'}\nوقت النشر: ${dayNameAr} ${timeStr}`)) {
                              handleDuplicatePost(p);
                            }
                          }}
                          style={{
                            background: p.status === 'published' ? '#f0fdf4' : p.status === 'failed' ? '#fef2f2' : '#eff6ff',
                            color: p.status === 'published' ? '#166534' : p.status === 'failed' ? '#b91c1c' : '#1d4ed8',
                            border: `1px solid ${p.status === 'published' ? '#bbf7d0' : p.status === 'failed' ? '#fecaca' : '#bfdbfe'}`,
                            padding: '6px 8px',
                            borderRadius: '8px',
                            marginBottom: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                          }}
                          title="انقر مرتين (Double Click) أو انقر مرة واحدة لتكرار هذا الفيديو ونشره مرة أخرى"
                        >
                          <div style={{ fontWeight: 'bold', fontSize: '11.5px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.global_caption ? p.global_caption : 'فيديو منشور'}
                          </div>
                          <div style={{ fontSize: '10.5px', opacity: 0.8, display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                            <span>{dayNameAr}</span>
                            <span>{timeStr}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Single-Line Posts Log with Time Filters */}
        <Card padding="lg" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
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
                      <span style={{ fontWeight: 'bold', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>
                        {post.global_caption || 'منشور فيديو كراون'}
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
      </div>
      )}
    </div>
  );
}
