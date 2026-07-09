'use client';

import React, { useState } from 'react';
import { useTenant } from '@/store/TenantContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';
import { CalendarClock, Bell, CheckCircle2, AlertCircle, Clock, Sparkles, UserCheck, Video, History, Share2 } from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 'Sun', label: 'الأحد' },
  { id: 'Mon', label: 'الإثنين' },
  { id: 'Tue', label: 'الثلاثاء' },
  { id: 'Wed', label: 'الأربعاء' },
  { id: 'Thu', label: 'الخميس' },
  { id: 'Fri', label: 'الجمعة' },
  { id: 'Sat', label: 'السبت' },
];

export default function AdvancedSettingsPage() {
  const { creators, creatorSchedules, updateCreatorSchedule, posts, postTargets, accounts } = useTenant();
  const { success } = useToast();

  const [localConfigs, setLocalConfigs] = useState<Record<string, { days: string[], time: string, enabled: boolean, notifyHoursBefore: number }>>(
    () => {
      const initial: Record<string, { days: string[], time: string, enabled: boolean, notifyHoursBefore: number }> = {};
      creators.forEach(c => {
        initial[c.id] = creatorSchedules[c.id] || {
          days: ['Sun', 'Tue', 'Thu'],
          time: '18:00',
          enabled: true,
          notifyHoursBefore: 3
        };
      });
      return initial;
    }
  );

  const handleToggleDay = (creatorId: string, dayId: string) => {
    const current = localConfigs[creatorId] || { days: ['Sun', 'Tue', 'Thu'], time: '18:00', enabled: true, notifyHoursBefore: 3 };
    const newDays = current.days.includes(dayId)
      ? current.days.filter(d => d !== dayId)
      : [...current.days, dayId];
    setLocalConfigs({ ...localConfigs, [creatorId]: { ...current, days: newDays } });
  };

  const handleTimeChange = (creatorId: string, time: string) => {
    const current = localConfigs[creatorId] || { days: ['Sun', 'Tue', 'Thu'], time: '18:00', enabled: true, notifyHoursBefore: 3 };
    setLocalConfigs({ ...localConfigs, [creatorId]: { ...current, time } });
  };

  const handleNotifyHoursChange = (creatorId: string, notifyHoursBefore: number) => {
    const current = localConfigs[creatorId] || { days: ['Sun', 'Tue', 'Thu'], time: '18:00', enabled: true, notifyHoursBefore: 3 };
    setLocalConfigs({ ...localConfigs, [creatorId]: { ...current, notifyHoursBefore } });
  };

  const handleToggleEnabled = (creatorId: string) => {
    const current = localConfigs[creatorId] || { days: ['Sun', 'Tue', 'Thu'], time: '18:00', enabled: true, notifyHoursBefore: 3 };
    setLocalConfigs({ ...localConfigs, [creatorId]: { ...current, enabled: !current.enabled } });
  };

  const handleSave = (creatorId: string) => {
    const config = localConfigs[creatorId];
    if (config) {
      updateCreatorSchedule(creatorId, config);
      success('تم حفظ إعدادات مواعيد النشر والتنبيه الذكي بنجاح!');
    }
  };

  const handleSaveAll = () => {
    creators.forEach(c => {
      if (localConfigs[c.id]) {
        updateCreatorSchedule(c.id, localConfigs[c.id]);
      }
    });
    success('تم حفظ جميع الإعدادات المتقدمة لكافة صناع المحتوى بنجاح!');
  };

  const handleResetCloudDB = async () => {
    if (!window.confirm('هل أنت متأكد من رغبتك في إعادة تهيئة وفرمتة قاعدة البيانات السحابية والمحلية للبدء من جديد؟')) return;
    try {
      await fetch('/api/db/reset', { method: 'POST' });
      localStorage.clear();
      success('تمت فرمتة وإعادة تهيئة قاعدة البيانات بنجاح! سيتم إعادة تحميل الصفحة...');
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleForceSync = async () => {
    try {
      await fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creators, accounts, posts, postTargets, creatorSchedules })
      });
      success('تمت مزامنة كافة البيانات والحفظ السحابي بنجاح!');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: '32px', background: '#f8fafc', minHeight: 'calc(100vh - 80px)', direction: 'rtl', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ background: '#ffffff', padding: '28px 32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarClock size={28} className="text-blue-600" />
            <span>الإعدادات المتقدمة ومواعيد النشر الذكية (Advanced Scheduling)</span>
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>
            قم بضبط جدول النشر المعتاد وتوقيت التنبيهات الاستباقية (قبل 3 أو 5 ساعات) ليظهر لك إشعار ذكي في أعلى لوحة التحكم فور اقتراب الموعد.
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={handleSaveAll} style={{ background: '#2563eb', color: '#fff', borderRadius: '14px', padding: '12px 28px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}>
          <Sparkles size={18} /> حفظ جميع الإعدادات
        </Button>
      </div>

      {/* Cloud Database Control Card */}
      <div style={{ background: '#ffffff', padding: '24px 32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>☁️ إدارة التخزين السحابي وقاعدة البيانات</span>
          </h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            يمكنك حفظ ومزامنة كافة البيانات الحالية فوراً في السحابة، أو إعادة تهيئة (فرمتة) قاعدة البيانات للبدء من جديد.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline" size="md" onClick={handleForceSync} style={{ borderRadius: '12px', fontWeight: 'bold', border: '1px solid #3b82f6', color: '#2563eb' }}>
            ⚡ مزامنة وحفظ فوري
          </Button>
          <Button variant="outline" size="md" onClick={handleResetCloudDB} style={{ borderRadius: '12px', fontWeight: 'bold', border: '1px solid #ef4444', color: '#dc2626' }}>
            🗑️ فرمتة وإعادة تهيئة قاعدة البيانات
          </Button>
        </div>
      </div>

      {/* Creators List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
        {creators.map(creator => {
          const config = localConfigs[creator.id] || { days: ['Sun', 'Tue', 'Thu'], time: '18:00', enabled: true, notifyHoursBefore: 3 };
          
          return (
            <Card key={creator.id} padding="lg" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>
                    {creator.profile_photo ? (
                      <img src={creator.profile_photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '14px', objectFit: 'cover' }} />
                    ) : (
                      creator.display_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>{creator.full_name}</h3>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>@{creator.display_name} • {creator.category}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleEnabled(creator.id)}
                    style={{
                      background: config.enabled ? '#dcfce7' : '#f1f5f9',
                      color: config.enabled ? '#166534' : '#64748b',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {config.enabled ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{config.enabled ? 'مفعّل للتنبيهات' : 'متوقف'}</span>
                  </button>
                </div>
              </div>

              {/* Day Selector */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '10px' }}>
                  📅 أيام النشر المجدولة أسبوعياً:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {DAYS_OF_WEEK.map(day => {
                    const isSelected = config.days.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleToggleDay(creator.id, day.id)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: isSelected ? '#eff6ff' : '#f8fafc',
                          color: isSelected ? '#1d4ed8' : '#64748b',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {day.label} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time and Notification Hours Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'flex', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '6px', alignItems: 'center', gap: '4px' }}>
                    <Clock size={15} className="text-blue-600" /> ساعة النشر المستهدفة:
                  </label>
                  <input
                    type="time"
                    value={config.time}
                    onChange={(e) => handleTimeChange(creator.id, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontWeight: 'bold',
                      fontSize: '15px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '6px', alignItems: 'center', gap: '4px' }}>
                    <Bell size={15} className="text-amber-500" /> التنبيه الذكي قبل الموعد بـ:
                  </label>
                  <select
                    value={config.notifyHoursBefore}
                    onChange={(e) => handleNotifyHoursChange(creator.id, Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value={1}>قبل 1 ساعة من النشر</option>
                    <option value={3}>قبل 3 ساعات من النشر</option>
                    <option value={5}>قبل 5 ساعات من النشر</option>
                    <option value={12}>قبل 12 ساعة (نصف يوم)</option>
                    <option value={24}>قبل 24 ساعة (يوم كامل)</option>
                  </select>
                </div>
              </div>

              {/* Published Summary & Schedule Skip Warning Box */}
              {(() => {
                const creatorPosts = posts.filter(p => p.creator_id === creator.id);
                const todayDayId = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
                const isTodayScheduled = config.days.includes(todayDayId);
                const hasPublishedToday = creatorPosts.some(p => {
                  const pDate = new Date(p.created_at);
                  const now = new Date();
                  return pDate.getDate() === now.getDate() && pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
                });

                return (
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontWeight: 'bold', color: '#1e3a8a', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Video size={16} /> إجمالي الفيديوهات المنشورة: {creatorPosts.length} فيديو
                      </span>
                      {isTodayScheduled && !hasPublishedToday ? (
                        <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                          ⚠️ ملاحظة: لم تقم بنشر فيديو لهذا الشخص في يوم النشر المجدول اليوم (${DAYS_OF_WEEK.find(d => d.id === todayDayId)?.label})! (تم عمل Skip)
                        </span>
                      ) : (
                        <span style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                          ✅ تم الالتزام بجدول النشر المجدول لهذا الأسبوع
                        </span>
                      )}
                    </div>

                    {/* Detailed History List */}
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>
                        📋 سجل النشر المفصّل (التاريخ والساعة والمنصات):
                      </span>
                      {creatorPosts.length === 0 ? (
                        <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>لا توجد منشورات سابقة لهذا الشخص حتى الآن.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                          {creatorPosts.map(p => {
                            const pDate = new Date(p.created_at);
                            const dateStr = pDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
                            let hours = pDate.getHours();
                            const period = hours >= 12 ? 'مساءً' : 'صباحاً';
                            if (hours > 12) hours -= 12;
                            if (hours === 0) hours = 12;
                            const hourStr = `الساعة ${hours}:00 ${period}`;
                            
                            // Target accounts for this post
                            const pTargets = postTargets.filter(t => t.post_id === p.id);
                            const platformsSet = new Set(pTargets.map(t => t.platform));
                            const platformsList = Array.from(platformsSet).map(pl => {
                              if (pl === 'youtube') return 'YouTube';
                              if (pl === 'tiktok') return 'TikTok';
                              if (pl === 'instagram') return 'Instagram';
                              if (pl === 'facebook') return 'Facebook';
                              return pl;
                            });

                            return (
                              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12.5px' }}>
                                <div>
                                  <strong style={{ color: '#0f172a', display: 'block' }}>{p.global_caption || 'بدون عنوان'}</strong>
                                  <span style={{ color: '#64748b', fontSize: '11.5px' }}>
                                    📅 {dateStr} • ⏰ {hourStr}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {platformsList.length > 0 ? platformsList.map(pl => (
                                    <span key={pl} style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                                      {pl}
                                    </span>
                                  )) : (
                                    <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                                      YouTube و Instagram
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Action bar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" size="sm" onClick={() => handleSave(creator.id)}>
                  حفظ إعدادات {creator.full_name}
                </Button>
              </div>
            </Card>
          );
        })}

        {creators.length === 0 && (
          <div style={{ gridColumn: '1 / -1', background: '#ffffff', padding: '60px', borderRadius: '24px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
            <UserCheck size={48} className="text-slate-400 mx-auto mb-4" />
            <h3 style={{ fontSize: '20px', color: '#0f172a', fontWeight: 'bold' }}>لا يوجد صناع محتوى في القائمة</h3>
            <p style={{ color: '#64748b' }}>قم بإضافة صانع محتوى من لوحة التحكم للبدء في ضبط إعدادات ومواعيد النشر الذكية.</p>
          </div>
        )}
      </div>
    </div>
  );
}
