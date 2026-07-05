'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/store/TenantContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/ToastProvider';
import { HelpCircle, Share2, Camera as Instagram, MessageCircle as Facebook, PlaySquare as Youtube, Video, Link as LinkIcon, MoreVertical, Zap } from 'lucide-react';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';

export default function SocialAccountsPage() {
  const { creators, accounts, setAccounts, addLog } = useTenant();
  const { success, error } = useToast();
  
  const [showLinkModal, setShowLinkModal] = useState(true);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [autoConnectCreatorId, setAutoConnectCreatorId] = useState('');

  const [showKeysConfig, setShowKeysConfig] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    META_CLIENT_ID: '',
    META_CLIENT_SECRET: '',
    TIKTOK_CLIENT_KEY: '',
    TIKTOK_CLIENT_SECRET: '',
  });
  const [savingKeys, setSavingKeys] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const succ = params.get('success');
      const err = params.get('error');
      const count = params.get('count');

      if (succ === 'meta_connected') {
        success(`تم ربط حسابات انستقرام / فيسبوك تلقائياً بنجاح! (${count || 1} حساب)`);
        window.history.replaceState({}, '', '/dashboard/accounts');
      } else if (succ === 'google_connected') {
        success(`تم ربط قناة يوتيوب تلقائياً بنجاح! (${count || 1} قناة)`);
        window.history.replaceState({}, '', '/dashboard/accounts');
      } else if (succ === 'oauth_local_fallback') {
        const platformParam = params.get('platform') || 'youtube';
        const creatorIdParam = params.get('creator_id') || '';
        const accountNameParam = params.get('account_name') || 'YouTube Channel';
        const usernameParam = params.get('username') || '';
        const accountIdParam = params.get('account_id') || '';
        const accessTokenParam = params.get('access_token') || '';
        const followersCountParam = parseInt(params.get('followers_count') || '0', 10);

        const newFallbackAccount: any = {
          id: crypto.randomUUID(),
          creator_id: creatorIdParam,
          platform: platformParam as any,
          account_name: accountNameParam,
          username_or_channel_name: usernameParam,
          account_id: accountIdParam,
          platform_account_id: accountIdParam,
          access_token: accessTokenParam,
          access_token_status: 'valid',
          permissions: ['read', 'publish', 'upload', 'offline'],
          followers_count: followersCountParam,
          connection_status: 'connected',
          last_sync_at: new Date().toISOString()
        };

        setAccounts(prev => {
          const next = [...prev.filter(a => !(a.creator_id === creatorIdParam && ((a as any).platform_account_id === accountIdParam || (a as any).account_id === accountIdParam))), newFallbackAccount];
          localStorage.setItem('crown_accounts', JSON.stringify(next));
          return next;
        });

        success(`تم ربط وتفعيل حساب ${platformParam === 'youtube' ? 'يوتيوب' : platformParam} تلقائياً وبنجاح!`);
        window.history.replaceState({}, '', '/dashboard/accounts');
      } else if (err) {
        error(`خطأ أثناء الربط التلقائي: ${err}`);
        window.history.replaceState({}, '', '/dashboard/accounts');
      }
    }

    // Load API Keys
    fetch('/api/settings').then(r => r.json()).then(data => {
      if (data.success && data.settings) {
        setApiKeys(prev => ({
          ...prev,
          ...data.settings,
          TIKTOK_CLIENT_KEY: data.settings.TIKTOK_CLIENT_KEY || data.settings.TIKTOK_CLIENT_ID || ''
        }));
      }
    }).catch(() => {});
  }, [success, error]);

  const [selectedCreatorId, setSelectedCreatorId] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [accountName, setAccountName] = useState('');
  const [username, setUsername] = useState('');
  const [platformId, setPlatformId] = useState('');
  const [accessToken, setAccessToken] = useState(''); 

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingKeys(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...apiKeys,
          TIKTOK_CLIENT_ID: apiKeys.TIKTOK_CLIENT_KEY
        })
      });
      const data = await res.json();
      if (data.success) {
        success('✨ تم حفظ مفاتيح الربط التلقائي (Meta / TikTok / YouTube) بنجاح!');
        setShowKeysConfig(false);
      } else {
        error(data.error || 'فشل الحفظ');
      }
    } catch (err: any) {
      error(`خطأ: ${err.message}`);
    } finally {
      setSavingKeys(false);
    }
  };

  const handleOpenNew = () => {
    setEditingAccountId(null);
    setSelectedCreatorId('');
    setPlatform('instagram');
    setAccountName('');
    setUsername('');
    setPlatformId('');
    setAccessToken('');
    setShowLinkModal(true);
    setTimeout(() => {
      const el = document.getElementById('manual-connect-card');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleEditClick = (acc: any) => {
    setEditingAccountId(acc.id);
    setSelectedCreatorId(acc.creator_id);
    setPlatform(acc.platform);
    setAccountName(acc.account_name);
    setUsername(acc.username_or_channel_name);
    setPlatformId(acc.account_id || acc.platform_account_id || '');
    setAccessToken(acc.access_token || '');
    setShowLinkModal(true);
    setOpenMenuId(null);
    setTimeout(() => {
      const el = document.getElementById('manual-connect-card');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    try {
      const { error: err } = await supabase.from('social_accounts').delete().eq('id', id);
      if (err) throw err;
      
      setAccounts(prev => prev.filter(a => a.id !== id));
      success('Account deleted successfully');
    } catch (e: any) {
      console.error(e);
      error('Failed to delete account');
    }
  };

  const handleDisconnectAccount = async (acc: any) => {
    if (!confirm(`هل أنت متأكد من إلغاء ربط حساب ${acc.account_name} (${acc.platform})؟`)) return;
    try {
      const { error: err } = await supabase.from('social_accounts').update({
        connection_status: 'revoked',
        access_token_status: 'expired',
        access_token: null,
      }).eq('id', acc.id);
      if (err) throw err;
      
      setAccounts(prev => prev.map(a => a.id === acc.id ? { 
        ...a, 
        connection_status: 'revoked' as any, 
        access_token_status: 'expired' as any,
        access_token: undefined 
      } : a));
      addLog('Disconnect Social Account', `${acc.platform} account ${acc.account_name} revoked`, 'Success');
      success('تم إلغاء ربط الحساب بنجاح (Disconnected successfully)');
      setOpenMenuId(null);
    } catch (e: any) {
      console.error(e);
      error('فشل في إلغاء ربط الحساب');
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreatorId || !platform || !accountName || !username || !platformId || !accessToken) {
      error('Please fill in all required fields');
      return;
    }

    try {
      if (editingAccountId) {
        const { error: sbError } = await supabase.from('social_accounts').update({
          creator_id: selectedCreatorId,
          platform: platform as any,
          account_name: accountName,
          username_or_channel_name: username,
          account_id: platformId,
          access_token: accessToken,
        }).eq('id', editingAccountId);
        
        if (sbError) throw sbError;
        
        setAccounts(prev => prev.map(a => a.id === editingAccountId ? { 
          ...a, 
          creator_id: selectedCreatorId, 
          platform: platform as any, 
          account_name: accountName, 
          username_or_channel_name: username, 
          account_id: platformId, 
          platform_account_id: platformId,
          access_token: accessToken 
        } : a));
        addLog('Update Social Account', `${platform} for creator ${selectedCreatorId}`, 'Success');
        success('Account updated successfully!');
      } else {
        const newAccount = {
          id: crypto.randomUUID(),
          creator_id: selectedCreatorId,
          platform: platform as any,
          account_name: accountName,
          username_or_channel_name: username,
          account_id: platformId,
          platform_account_id: platformId,
          access_token: accessToken,
          access_token_status: 'valid' as any,
          permissions: ['read', 'publish'],
          followers_count: 0,
          connection_status: 'connected' as any,
          last_sync_at: new Date().toISOString()
        };

        try {
          const { data, error: sbError } = await supabase.from('social_accounts').insert([newAccount]).select();
          if (sbError) {
            console.warn('Supabase insert failed, falling back to local:', sbError);
            setAccounts(prev => [...prev, newAccount as any]);
          } else {
            setAccounts(prev => [...prev, (data && data[0]) ? data[0] as any : newAccount as any]);
          }
        } catch (sbErr: any) {
          console.warn('Supabase insert exception, saving locally:', sbErr);
          setAccounts(prev => [...prev, newAccount as any]);
        }
        addLog('Connect Social Account', `${platform} for creator ${selectedCreatorId}`, 'Success');
        success(`Successfully connected ${platform} account!`);
      }
      
      setShowLinkModal(false);
    } catch (err: any) {
      console.error(err);
      error(`Failed to save: ${err.message}`);
    }
  };

  const getPlatformIcon = (plat: string) => {
    switch (plat) {
      case 'instagram': return <Instagram size={24} />;
      case 'facebook': return <Facebook size={24} />;
      case 'youtube': return <Youtube size={24} />;
      case 'tiktok': return <Video size={24} />;
      default: return <Share2 size={24} />;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Social Accounts</h1>
          <p className={styles.subtitle}>Manage connected social media accounts across all creators.</p>
        </div>
        <button 
          onClick={handleOpenNew}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)', transition: 'all 0.2s', fontSize: '15px' }}
        >
          <LinkIcon size={18} /> <span>+ ربط حساب جديد (Link Account)</span>
        </button>
      </div>

      {/* Clean & Classy 1-Click OAuth Connect Card */}
      <div className={styles.oauthContainer} id="oauth-section" dir="rtl" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '28px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', color: '#1e293b', margin: '24px 0' }}>
        <div className={styles.oauthHeader} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div className={styles.oauthTitleWrap}>
            <div className={styles.oauthTitleIcon} style={{ background: '#eff6ff', color: '#2563eb', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={24} />
            </div>
            <div>
              <h2 className={styles.oauthTitle} style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>الربط التلقائي الفوري المباشر (Meta Facebook, Instagram, YouTube & TikTok)</h2>
              <p className={styles.oauthSubtitle} style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
                اختر الصانع واضغط على أيقونة المنصة لربط الحساب أو الصفحة تلقائياً بضغطة زر واحدة في ثوانٍ.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowKeysConfig(!showKeysConfig)}
            style={{ background: '#f8fafc', color: '#2563eb', border: '1px solid #bfdbfe', padding: '10px 18px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
          >
            <span>🔑</span>
            <span>{showKeysConfig ? 'إخفاء إعدادات مفاتيح الربط' : 'إدخال / تعديل مفاتيح الربط (API Keys)'}</span>
          </button>
        </div>

        {/* Inline API Keys Accordion Panel */}
        {showKeysConfig && (
          <form onSubmit={handleSaveKeys} style={{ background: '#f1f5f9', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '16px', fontWeight: 'bold' }}>⚙️ إعداد مفاتيح ميتا (Meta App ID & Secret) وتيك توك لتفعيل الربط التلقائي:</h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>أدخل مفاتيح التطبيق هنا حتى تتمكن من المصادقة التلقائية عند النشر. يمكنك أيضاً إدارة كافة المفاتيح من صفحة الإعدادات المتقدمة.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Meta App ID (معرف تطبيق فيسبوك / إنستقرام)</label>
                <input
                  type="text"
                  placeholder="مثال: 1234567890"
                  value={apiKeys.META_CLIENT_ID}
                  onChange={e => setApiKeys({ ...apiKeys, META_CLIENT_ID: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '14px', direction: 'ltr', textAlign: 'left' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Meta App Secret (سر تطبيق ميتا)</label>
                <input
                  type="password"
                  placeholder="ألصق الـ Secret هنا..."
                  value={apiKeys.META_CLIENT_SECRET}
                  onChange={e => setApiKeys({ ...apiKeys, META_CLIENT_SECRET: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '14px', direction: 'ltr', textAlign: 'left' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>TikTok Client Key (مفتاح تطبيق تيك توك)</label>
                <input
                  type="text"
                  placeholder="مثال: aw12345..."
                  value={apiKeys.TIKTOK_CLIENT_KEY}
                  onChange={e => setApiKeys({ ...apiKeys, TIKTOK_CLIENT_KEY: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '14px', direction: 'ltr', textAlign: 'left' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>TikTok Client Secret (سر تيك توك)</label>
                <input
                  type="password"
                  placeholder="ألصق الـ Secret هنا..."
                  value={apiKeys.TIKTOK_CLIENT_SECRET}
                  onChange={e => setApiKeys({ ...apiKeys, TIKTOK_CLIENT_SECRET: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '14px', direction: 'ltr', textAlign: 'left' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowKeysConfig(false)}
                style={{ background: '#e2e8f0', color: '#475569', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                إغلاق
              </button>
              <button
                type="submit"
                disabled={savingKeys}
                style={{ background: '#2563eb', color: '#fff', padding: '8px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 6px rgba(37,99,235,0.3)' }}
              >
                {savingKeys ? 'جاري الحفظ...' : '💾 حفظ المفاتيح الآن'}
              </button>
            </div>
          </form>
        )}

        <div className={styles.creatorSelectSection} style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <label className={styles.stepLabel} style={{ color: '#334155', fontWeight: 'bold', fontSize: '15px', marginBottom: '8px', display: 'block' }}>1. حدد الصانع المسؤول عن الحساب (Creator):</label>
          <select
            className={styles.creatorSelect}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#1e293b', fontSize: '15px', fontWeight: '500' }}
            value={autoConnectCreatorId || selectedCreatorId}
            onChange={e => {
              setAutoConnectCreatorId(e.target.value);
              setSelectedCreatorId(e.target.value);
            }}
          >
            <option value="">-- اضغط هنا لاختيار الصانع أولاً --</option>
            {creators.map(c => (
              <option key={c.id} value={c.id}>{c.full_name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <label className={styles.stepLabel} style={{ margin: 0, fontSize: '15px', color: '#334155', fontWeight: 'bold' }}>2. اضغط على المنصة للربط التلقائي الفوري:</label>
          <span style={{ fontSize: '13px', color: '#1e40af', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '6px 14px', borderRadius: '20px', fontWeight: '600' }}>✨ الربط التلقائي متاح الآن لجميع المنصات (Facebook, Instagram, YouTube, TikTok)</span>
        </div>
        
        <div className={styles.platformGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {/* Instagram Business */}
          <button
            type="button"
            onClick={() => {
              const targetId = autoConnectCreatorId || selectedCreatorId;
              if (!targetId) return error('يرجى اختيار الصانع أولاً من القائمة');
              window.location.href = `/api/auth/meta/login?creator_id=${targetId}&filter=instagram`;
            }}
            className={styles.platformBtn}
            style={{ background: '#ffffff', border: '1px solid #fbcfe8', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Instagram size={32} />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>Instagram Business</span>
            <span style={{ fontSize: '13px', color: '#db2777', marginTop: '4px', fontWeight: '600' }}>ربط إنستقرام التلقائي 📸</span>
          </button>

          {/* Facebook Page */}
          <button
            type="button"
            onClick={() => {
              const targetId = autoConnectCreatorId || selectedCreatorId;
              if (!targetId) return error('يرجى اختيار الصانع أولاً من القائمة');
              window.location.href = `/api/auth/meta/login?creator_id=${targetId}&filter=facebook`;
            }}
            className={styles.platformBtn}
            style={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Facebook size={32} />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>Facebook Page</span>
            <span style={{ fontSize: '13px', color: '#2563eb', marginTop: '4px', fontWeight: '600' }}>ربط صفحات فيسبوك 🔵</span>
          </button>

          {/* YouTube Channel */}
          <button
            type="button"
            onClick={() => {
              const targetId = autoConnectCreatorId || selectedCreatorId;
              if (!targetId) return error('يرجى اختيار الصانع أولاً من القائمة');
              window.location.href = `/api/auth/google/login?creator_id=${targetId}`;
            }}
            className={styles.platformBtn}
            style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Youtube size={32} />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>YouTube Channel</span>
            <span style={{ fontSize: '13px', color: '#ef4444', marginTop: '4px', fontWeight: '600' }}>يوتيوب وشورتس تلقائياً</span>
          </button>

          {/* TikTok Creator */}
          <button
            type="button"
            onClick={() => {
              const targetId = autoConnectCreatorId || selectedCreatorId;
              if (!targetId) return error('يرجى اختيار الصانع أولاً من القائمة');
              window.location.href = `/api/auth/tiktok/login?creator_id=${targetId}`;
            }}
            className={styles.platformBtn}
            style={{ background: '#ffffff', border: '1px solid #fecdd3', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fff1f2', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Video size={32} />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>TikTok Auto Connect</span>
            <span style={{ fontSize: '13px', color: '#f43f5e', marginTop: '4px', fontWeight: '600' }}>ربط تيك توك التلقائي 🎵</span>
          </button>
        </div>

        <div className={styles.settingsBanner} style={{ marginTop: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div className={styles.settingsText} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '14px' }}>
            <span style={{ fontSize: '18px' }}>💡</span>
            <span>نصيحة: يمكنك الربط اليدوي المباشر بدون موافقة المطورين من النموذج الدائم بالأسفل!</span>
          </div>
          <a href="#manual-connect-card" style={{ color: '#2563eb', fontWeight: '600', fontSize: '14px', textDecoration: 'none', background: '#eff6ff', padding: '6px 14px', borderRadius: '8px' }}>
            النزول للربط اليدوي &darr;
          </a>
        </div>
      </div>

      {/* Clean Manual Connection Card (Always Visible!) */}
      {showLinkModal && (
        <Card id="manual-connect-card" padding="lg" className={styles.formCard} dir="rtl" style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', color: '#1e293b', marginBottom: '40px' }}>
          <div className={styles.formHeader} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                <span>✍️</span>
                <span>{editingAccountId ? 'تعديل بيانات الحساب المربوط' : 'بوابة الربط اليدوي المباشر (Facebook, Instagram, TikTok, YouTube)'}</span>
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>
                قم باختيار المنصة (مثل فيسبوك أو إنستقرام)، ألصق رمز الوصول (Access Token) ومعرف الصفحة أو الحساب، واضغط حفظ ليعمل فوراً في النشر!
              </p>
            </div>
            {editingAccountId && (
              <button type="button" onClick={() => { setEditingAccountId(null); setPlatform('instagram'); setAccountName(''); setUsername(''); setPlatformId(''); setAccessToken(''); }} style={{ background: '#f1f5f9', color: '#475569', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                إلغاء التعديل
              </button>
            )}
          </div>
          
          <form onSubmit={handleConnect} className={styles.form}>
            <div className={styles.formGrid}>
              <Select 
                label="المنصة (Platform)" 
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                options={[
                  { label: '-- اختر المنصة --', value: '' },
                  { label: '🔴 انستقرام (Instagram Business Account)', value: 'instagram' },
                  { label: '🔵 فيسبوك (Facebook Page / Profile)', value: 'facebook' },
                  { label: '🎵 تيك توك (TikTok Account)', value: 'tiktok' },
                  { label: '🔴 يوتيوب (YouTube Channel)', value: 'youtube' }
                ]}
                required
              />
              <Select 
                label="المسؤول عن الحساب (Creator)" 
                value={selectedCreatorId}
                onChange={e => setSelectedCreatorId(e.target.value)}
                options={[
                  { label: '-- اختر الصانع --', value: '' },
                  ...creators.map(c => ({ label: c.full_name, value: c.id }))
                ]}
                required
              />
              <Input 
                label="اسم العرض للحساب (Account Display Name)" 
                placeholder="مثال: Crown Official IG أو اسم الصفحة"
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                required
              />
              <Input 
                label="اسم المستخدم / القناة (Username)" 
                placeholder="مثال: @username أو رابط القناة"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
              <Input 
                label="معرف الحساب / الصفحة (Account ID / Page ID)" 
                placeholder="مثال: 17841400000000000"
                value={platformId}
                onChange={e => setPlatformId(e.target.value)}
                required
              />
              <Input 
                label="رمز الوصول (Access Token)" 
                placeholder="ألصق الـ Access Token أو الـ Secret هنا..."
                value={accessToken}
                onChange={e => setAccessToken(e.target.value)}
                required
              />
            </div>
            
            <div className={styles.formActions} dir="ltr" style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="submit" style={{ background: 'linear-gradient(to right, #2563eb, #1d4ed8)', color: '#fff', padding: '12px 28px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{editingAccountId ? '💾 حفظ التعديلات' : '⚡ ربط وحفظ الحساب يدويّاً الآن'}</span>
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className={styles.accountsGrid}>
        {accounts.map(acc => {
          const creator = creators.find(c => c.id === acc.creator_id);
          return (
            <Card key={acc.id} className={styles.accountCard}>
              <div className={styles.cardHeader}>
                <div className="flex items-center gap-3">
                  <div className={`${styles.platformIcon} ${styles[acc.platform]}`}>
                    {getPlatformIcon(acc.platform)}
                  </div>
                  <span className="font-semibold text-gray-700 capitalize">
                    {acc.platform}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <StatusBadge 
                    status={
                      acc.connection_status === 'connected' ? 'success' :
                      acc.connection_status === 'expired' ? 'warning' :
                      acc.connection_status === 'revoked' ? 'error' : 'error'
                    } 
                    label={acc.connection_status.toUpperCase()} 
                  />
                  
                  <button 
                    className={styles.iconBtn}
                    onClick={() => setOpenMenuId(openMenuId === acc.id ? null : acc.id)}
                  >
                    <MoreVertical size={20} />
                  </button>
                  
                  {openMenuId === acc.id && (
                    <div className={styles.dropdownMenu}>
                      <button className={styles.dropdownItem} onClick={() => handleEditClick(acc)}>
                        ✏️ تعديل (Edit)
                      </button>
                      {acc.connection_status === 'connected' && (
                        <button className={styles.dropdownItem} onClick={() => handleDisconnectAccount(acc)} style={{ color: '#d97706', fontWeight: 'bold' }}>
                          🔌 إلغاء الربط (Disconnect)
                        </button>
                      )}
                      {acc.connection_status !== 'connected' && (
                        <button className={styles.dropdownItem} onClick={() => {
                          window.location.href = acc.platform === 'youtube' 
                            ? `/api/auth/google/login?creator_id=${acc.creator_id}` 
                            : `/api/auth/meta/login?creator_id=${acc.creator_id}`;
                        }} style={{ color: '#2563eb', fontWeight: 'bold' }}>
                          🔄 إعادة الربط (Reconnect)
                        </button>
                      )}
                      <button className={`${styles.dropdownItem} ${styles.dropdownItemDelete}`} onClick={() => handleDeleteAccount(acc.id)}>
                        🗑️ حذف نهائي (Delete)
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '14px 0', padding: '14px', background: 'linear-gradient(135deg, #ffffff, #f8fafc)', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ position: 'relative', width: '68px', height: '68px', flexShrink: 0 }}>
                  {acc.profile_picture_url ? (
                    <img 
                      src={acc.profile_picture_url} 
                      alt={acc.account_name}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #d4af37', boxShadow: '0 4px 12px rgba(212, 175, 55, 0.25)' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #d4af37, #f3e5ab)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 'bold', color: '#fff', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(212, 175, 55, 0.2)' }}>
                      {acc.account_name ? acc.account_name.charAt(0).toUpperCase() : '👑'}
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#fff', borderRadius: '50%', padding: '5px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getPlatformIcon(acc.platform)}
                  </div>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{acc.account_name}</h3>
                    <span title="حساب موثق ومربوط" style={{ color: '#3b82f6', fontSize: '16px' }}>✔️</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 8px 0', fontWeight: '600' }}>{acc.username_or_channel_name}</p>
                  {typeof acc.followers_count === 'number' && acc.followers_count > 0 ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '800', color: '#b45309', background: '#fef3c7', padding: '3px 10px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                      👥 {acc.followers_count.toLocaleString()} متابع
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: '#059669', background: '#d1fae5', padding: '3px 10px', borderRadius: '12px' }}>
                      ✨ متصل ونشط
                    </span>
                  )}
                </div>
              </div>
              
              <div className={styles.accDetails}>
                <div className={styles.detailRow}>
                  <span>Creator</span>
                  <strong>{creator?.full_name || 'Unknown'}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Platform ID</span>
                  <strong className="truncate max-w-[150px] text-right" title={acc.platform_account_id}>
                    {acc.platform_account_id}
                  </strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Token Status</span>
                  <StatusBadge status="success" label={acc.access_token_status} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
