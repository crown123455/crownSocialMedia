'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import { Button } from '@/components/ui/Button';
import { 
  Key, 
  Shield, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Database, 
  Share2, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  HelpCircle,
  Lock,
  Layers
} from 'lucide-react';
import styles from './page.module.css';

export default function IntegrationsPage() {
  const { success, error } = useToast();
  
  const [activeTab, setActiveTab] = useState<'vault' | 'guide' | 'database'>('vault');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  const [showMetaSecret, setShowMetaSecret] = useState(false);
  const [showGoogleSecret, setShowGoogleSecret] = useState(false);
  const [showTiktokSecret, setShowTiktokSecret] = useState(false);

  const [settings, setSettings] = useState({
    META_CLIENT_ID: '',
    META_CLIENT_SECRET: '',
    GOOGLE_CLIENT_ID: '',
    GOOGLE_CLIENT_SECRET: '',
    TIKTOK_CLIENT_ID: '',
    TIKTOK_CLIENT_KEY: '',
    TIKTOK_CLIENT_SECRET: '',
  });

  const [origin, setOrigin] = useState('http://localhost:3000');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(prev => ({ ...prev, ...data.settings, TIKTOK_CLIENT_KEY: data.settings.TIKTOK_CLIENT_KEY || data.settings.TIKTOK_CLIENT_ID || '' }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      error('حدث خطأ في تحميل المفاتيح المخزنة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const payloadToSave = {
        ...settings,
        TIKTOK_CLIENT_ID: settings.TIKTOK_CLIENT_KEY || settings.TIKTOK_CLIENT_ID || '',
        TIKTOK_CLIENT_KEY: settings.TIKTOK_CLIENT_KEY || settings.TIKTOK_CLIENT_ID || '',
      };
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadToSave)
      });
      const data = await res.json();
      if (data.success) {
        if (data.supabaseSuccess) {
          success('✨ تم حفظ المفاتيح في قاعدة بيانات Supabase والسيرفر المحلي بنجاح!');
        } else {
          success('💾 تم حفظ المفاتيح محلياً بنجاح (يرجى إنشاء جدول system_settings في Supabase للمزامنة السحابية)');
        }
      } else {
        throw new Error(data.error || 'فشل الحفظ');
      }
    } catch (err: any) {
      error(`خطأ في حفظ الإعدادات: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
    success('تم النسخ إلى الحافظة!');
  };

  const metaRedirectUri = `${origin}/api/auth/meta/callback`;
  const googleRedirectUri = `${origin}/api/auth/google/callback`;
  const tiktokRedirectUri = `${origin}/api/auth/tiktok/callback`;

  const supabaseSqlSchema = `-- 1. حل مشكلة أمان RLS لجدول الحسابات المربوطة (السماح بالربط والحفظ التلقائي)
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on social_accounts" ON public.social_accounts;
CREATE POLICY "Allow all operations on social_accounts" ON public.social_accounts FOR ALL USING (true) WITH CHECK (true);

-- 2. لإنشاء جدول إعدادات التكامل (اختياري للمزامنة السحابية)
CREATE TABLE IF NOT EXISTS public.system_settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin access to system_settings" ON public.system_settings;
CREATE POLICY "Allow admin access to system_settings" ON public.system_settings FOR ALL USING (true);`;

  return (
    <div className={styles.container} dir="rtl">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>
            <Shield className="text-blue-600 fill-blue-100" size={32} />
            لوحة إدارة التكامل ومفاتيح الربط (Integration Vault)
          </h1>
          <p className={styles.subtitle}>
            قم بإدارة مفاتيح الـ API لـ Instagram, Facebook, YouTube, و TikTok في مكان واحد وآمن وبدون الحاجه لتعديل الأكواد!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchSettings} disabled={isLoading}>
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> تحديث البيانات
          </Button>
          <Button variant="primary" onClick={() => handleSave()} disabled={isSaving}>
            <Key size={16} /> حفظ جميع المفاتيح
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsNav}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'vault' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('vault')}
        >
          <Key size={18} /> خزنة المفاتيح (API Vault)
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'guide' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('guide')}
        >
          <HelpCircle size={18} /> دليل خطوة بخطوة للربط
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'database' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('database')}
        >
          <Database size={18} /> إعداد جدول Supabase
        </button>
      </div>

      {/* TAB 1: VAULT */}
      {activeTab === 'vault' && (
        <form onSubmit={handleSave}>
          <div className={styles.gridSection}>
            {/* GOOGLE CARD */}
            <div className={`${styles.platformCard} ${styles.googleCard}`} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div className={styles.cardHeader}>
                <div className={styles.platformTitle}>
                  <div className={`${styles.platformIcon} ${styles.googleIcon}`}>
                    <Zap size={26} />
                  </div>
                  <div>
                    <h3 style={{ color: '#0f172a', fontWeight: 'bold' }}>Google & YouTube API</h3>
                    <p style={{ color: '#64748b' }}>YouTube Channel Data & Video Publish</p>
                  </div>
                </div>
                <div className={`${styles.statusBadge} ${settings.GOOGLE_CLIENT_ID ? styles.statusActive : styles.statusPending}`}>
                  {settings.GOOGLE_CLIENT_ID ? <><CheckCircle2 size={14} /> مفعّل وجاهز</> : <><AlertCircle size={14} /> بانتظار المفتاح</>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.label}>
                  <span style={{ color: '#334155', fontWeight: '600' }}>OAuth Client ID</span>
                  <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="text-red-600 hover:underline text-xs flex items-center gap-1">
                    Google Cloud Console <ExternalLink size={12} />
                  </a>
                </div>
                <div className={styles.inputWrapper}>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="مثال: 123456789-xxxx.apps.googleusercontent.com"
                    value={settings.GOOGLE_CLIENT_ID}
                    onChange={e => setSettings({ ...settings, GOOGLE_CLIENT_ID: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.label}>
                  <span style={{ color: '#334155', fontWeight: '600' }}>Client Secret</span>
                  <span className="text-xs text-gray-500">سري جداً</span>
                </div>
                <div className={styles.inputWrapper}>
                  <input 
                    type={showGoogleSecret ? 'text' : 'password'} 
                    className={styles.input} 
                    placeholder="••••••••••••••••••••••••••••••••"
                    value={settings.GOOGLE_CLIENT_SECRET}
                    onChange={e => setSettings({ ...settings, GOOGLE_CLIENT_SECRET: e.target.value })}
                  />
                  <button 
                    type="button" 
                    className={styles.toggleBtn} 
                    onClick={() => setShowGoogleSecret(!showGoogleSecret)}
                  >
                    {showGoogleSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className={styles.redirectBox}>
                <div className={styles.redirectLabel}>
                  <Lock size={12} className="text-red-600" />
                  <span>رابط تحويل Google (Authorized redirect URI):</span>
                </div>
                <div className={styles.redirectUrl}>
                  <span>{googleRedirectUri}</span>
                  <button 
                    type="button" 
                    className={styles.copyBtn} 
                    onClick={() => copyToClipboard(googleRedirectUri, 'google_uri')}
                    style={{ position: 'static' }}
                  >
                    {copiedKey === 'google_uri' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* TIKTOK CARD */}
            <div className={styles.platformCard} style={{ border: '1px solid #fecdd3', background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div className={styles.cardHeader}>
                <div className={styles.platformTitle}>
                  <div className={styles.platformIcon} style={{ background: '#fff1f2', color: '#f43f5e', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '24px', fontWeight: 'bold' }}>🎵</span>
                  </div>
                  <div>
                    <h3 style={{ color: '#0f172a', fontWeight: 'bold' }}>TikTok API Integration</h3>
                    <p style={{ color: '#64748b' }}>TikTok Auto-Connect & Video Publishing</p>
                  </div>
                </div>
                <div className={`${styles.statusBadge} ${settings.TIKTOK_CLIENT_KEY || settings.TIKTOK_CLIENT_ID ? styles.statusActive : styles.statusPending}`}>
                  {settings.TIKTOK_CLIENT_KEY || settings.TIKTOK_CLIENT_ID ? <><CheckCircle2 size={14} /> مفعّل وجاهز</> : <><AlertCircle size={14} /> بانتظار المفتاح</>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.label}>
                  <span style={{ color: '#334155', fontWeight: '600' }}>TikTok Client Key (App ID)</span>
                  <a href="https://developers.tiktok.com/" target="_blank" className="text-red-500 hover:underline text-xs flex items-center gap-1 font-semibold">
                    بوابة TikTok Developers <ExternalLink size={12} />
                  </a>
                </div>
                <div className={styles.inputWrapper}>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="مثال: awxxxxxx12345678"
                    value={settings.TIKTOK_CLIENT_KEY || settings.TIKTOK_CLIENT_ID || ''}
                    onChange={e => setSettings({ ...settings, TIKTOK_CLIENT_KEY: e.target.value, TIKTOK_CLIENT_ID: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.label}>
                  <span style={{ color: '#334155', fontWeight: '600' }}>Client Secret</span>
                  <span className="text-xs text-gray-500">سري جداً</span>
                </div>
                <div className={styles.inputWrapper}>
                  <input 
                    type={showTiktokSecret ? 'text' : 'password'} 
                    className={styles.input} 
                    placeholder="••••••••••••••••••••••••••••••••"
                    value={settings.TIKTOK_CLIENT_SECRET || ''}
                    onChange={e => setSettings({ ...settings, TIKTOK_CLIENT_SECRET: e.target.value })}
                  />
                  <button 
                    type="button" 
                    className={styles.toggleBtn} 
                    onClick={() => setShowTiktokSecret(!showTiktokSecret)}
                  >
                    {showTiktokSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className={styles.redirectBox}>
                <div className={styles.redirectLabel}>
                  <Lock size={12} className="text-red-500" />
                  <span>رابط تحويل تيك توك (Redirect URI) - ضعه في تطبيق TikTok:</span>
                </div>
                <div className={styles.redirectUrl}>
                  <span>{tiktokRedirectUri}</span>
                  <button 
                    type="button" 
                    className={styles.copyBtn} 
                    onClick={() => copyToClipboard(tiktokRedirectUri, 'tiktok_uri')}
                    style={{ position: 'static' }}
                  >
                    {copiedKey === 'tiktok_uri' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

          </div>

          <div className={styles.saveBar}>
            <div className="flex items-center gap-3">
              <Shield className="text-green-400" size={24} />
              <div>
                <h4 className="m-0 text-base font-bold">الحفظ السحابي والمحلي المزدوج</h4>
                <p className="m-0 text-xs text-slate-300">سيتم حفظ المفاتيح في قاعدة بيانات Supabase وفي ملفات السيرفر لضمان الأمان وموثوقية الربط.</p>
              </div>
            </div>
            <Button type="submit" variant="primary" size="lg" disabled={isSaving} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold px-8 py-3 shadow-lg">
              {isSaving ? 'جاري الحفظ...' : '💾 حفظ وتفعيل جميع المفاتيح الآن'}
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: GUIDE */}
      {activeTab === 'guide' && (
        <div className={styles.guideCard}>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <HelpCircle className="text-blue-600" size={28} />
            كيفية ربط المنصات والحصول على المفاتيح بشكل احترافي
          </h2>
          <p className="text-gray-600 mb-6">اتبع هذه الخطوات البسيطة لمرة واحدة فقط لكي يعمل الربط التلقائي لكل عملاء موقعك مدى الحياة:</p>

          <div className="space-y-8">
            <div className="p-6 bg-red-50/50 rounded-2xl border border-red-100">
              <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                ▶️ خطوات إعداد Google (YouTube & Shorts):
              </h3>
              <ul className={styles.stepList}>
                <li className={styles.stepItem}>
                  <div className={styles.stepNumber}>1</div>
                  <div className={styles.stepText}>
                    <h4>الدخول إلى Google Cloud Console</h4>
                    <p>افتح رابط <a href="https://console.cloud.google.com/" target="_blank" className="text-red-600 font-bold underline">console.cloud.google.com</a> واختر مشروعك الحالي.</p>
                  </div>
                </li>
                <li className={styles.stepItem}>
                  <div className={styles.stepNumber}>2</div>
                  <div className={styles.stepText}>
                    <h4>تفعيل مكتبة اليوتيوب</h4>
                    <p>اذهب إلى <strong>APIs & Services → Library</strong> وابحث عن <code>YouTube Data API v3</code> واضغط <strong>Enable</strong>.</p>
                  </div>
                </li>
                <li className={styles.stepItem}>
                  <div className={styles.stepNumber}>3</div>
                  <div className={styles.stepText}>
                    <h4>إنشاء مفتاح OAuth Client ID</h4>
                    <p>اذهب إلى <strong>Credentials → Create Credentials → OAuth client ID</strong> واختر نوع التطبيق <strong>Web application</strong>.</p>
                  </div>
                </li>
                <li className={styles.stepItem}>
                  <div className={styles.stepNumber}>4</div>
                  <div className={styles.stepText}>
                    <h4>إضافة رابط التحويل وحفظ المفاتيح</h4>
                    <p>في قسم <strong>Authorized redirect URIs</strong>، أضف الرابط: <code className="bg-white px-2 py-1 rounded text-red-600 border font-mono">{googleRedirectUri}</code>، ثم انسخ Client ID و Client Secret والصقهم في خزنة المفاتيح في موقعك!</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-rose-50/50 rounded-2xl border border-rose-100">
              <h3 className="text-xl font-bold text-rose-900 mb-4 flex items-center gap-2">
                🎵 خطوات إعداد TikTok (الربط التلقائي ونشر الفيديوهات):
              </h3>
              <ul className={styles.stepList}>
                <li className={styles.stepItem}>
                  <div className={styles.stepNumber} style={{ background: '#fe2c55', color: '#fff' }}>1</div>
                  <div className={styles.stepText}>
                    <h4 className="text-slate-800">الدخول إلى TikTok Developers</h4>
                    <p className="text-slate-600">افتح رابط <a href="https://developers.tiktok.com/" target="_blank" className="text-rose-600 font-bold underline">developers.tiktok.com</a> وسجل حسابك كمطور أو حساب تجاري.</p>
                  </div>
                </li>
                <li className={styles.stepItem}>
                  <div className={styles.stepNumber} style={{ background: '#fe2c55', color: '#fff' }}>2</div>
                  <div className={styles.stepText}>
                    <h4 className="text-slate-800">إنشاء تطبيق جديد (Create App)</h4>
                    <p className="text-slate-600">اضغط على <strong>Manage Apps → Connect an App</strong> وقم باختيار صلاحيات الفيديو الأساسية: <code>user.info.basic</code> و <code>video.publish</code> و <code>video.upload</code>.</p>
                  </div>
                </li>
                <li className={styles.stepItem}>
                  <div className={styles.stepNumber} style={{ background: '#fe2c55', color: '#fff' }}>3</div>
                  <div className={styles.stepText}>
                    <h4 className="text-slate-800">لصق رابط التحويل (Redirect URI)</h4>
                    <p className="text-slate-600">في إعدادات التطبيق، ضع الرابط: <code className="bg-white px-2 py-1 rounded text-rose-600 border border-rose-200 font-mono">{tiktokRedirectUri}</code> واضغط حفظ.</p>
                  </div>
                </li>
                <li className={styles.stepItem}>
                  <div className={styles.stepNumber} style={{ background: '#fe2c55', color: '#fff' }}>4</div>
                  <div className={styles.stepText}>
                    <h4 className="text-slate-800">نسخ Client Key و Client Secret</h4>
                    <p className="text-slate-600">انسخ الـ <strong>Client Key</strong> والـ <strong>Client Secret</strong> من لوحة تيك توك والصقهم هنا في خزنة المفاتيح واضغط حفظ ليعمل زر الربط التلقائي فوراً بضغطة واحدة!</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DATABASE */}
      {activeTab === 'database' && (
        <div className={styles.guideCard}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 m-0">
              <Database className="text-indigo-600" size={28} />
              إعداد جدول Supabase للمزامنة السحابية
            </h2>
            <Button 
              variant="outline" 
              onClick={() => copyToClipboard(supabaseSqlSchema, 'sql')}
              className="bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold flex items-center gap-2"
            >
              {copiedKey === 'sql' ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
              نسخ كود الـ SQL بالكامل
            </Button>
          </div>
          <p className="text-gray-600 mb-6">
            لكي يتم حفظ مفاتيح التطبيق وإعدادات التكامل سحابياً في Supabase (بالإضافة للحفظ المحلي)، يرجى نسخ كود الـ SQL التالي وتشغيله مرة واحدة في قسم <strong>SQL Editor</strong> داخل حسابك في Supabase:
          </p>

          <pre className={styles.sqlContainer} dir="ltr">
            <code>{supabaseSqlSchema}</code>
          </pre>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0" size={24} />
            <p className="text-sm text-amber-800 m-0">
              <strong>ملاحظة هامة:</strong> حتى لو لم تقم بإنشاء الجدول الآن، النظام مبرمج ليقوم بالحفظ المحلي التلقائي في ملفات السيرفر بحيث لا تتعطل أو تتوقف أي وظيفة في موقعك أبداً!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
