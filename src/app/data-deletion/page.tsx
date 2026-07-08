'use client';

import React from 'react';
import Link from 'next/link';
import { Crown, Trash2, CheckCircle2, AlertTriangle, Shield, ExternalLink, Mail } from 'lucide-react';

export default function DataDeletionPage() {
  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '40px 20px' }}>
      {/* Header */}
      <header style={{ maxWidth: '900px', margin: '0 auto 40px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '20px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: '#fff' }}>
          <div style={{ padding: '4px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/tiktok-app-icon.png" alt="Crown Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, background: 'linear-gradient(135deg, #fff, #d4af37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Crown SaaS</h1>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Content Creator Platform</span>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/privacy" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>سياسة الخصوصية</Link>
          <Link href="/terms" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>الشروط والأحكام</Link>
          <Link href="/" style={{ color: '#d4af37', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>← العودة للرئيسية</Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '900px', margin: '0 auto', background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', borderRadius: '24px', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '48px', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '14px', borderRadius: '16px', color: '#ef4444' }}>
            <Trash2 size={36} />
          </div>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 6px 0', color: '#fff' }}>إرشادات حذف البيانات وإلغاء صلاحيات الربط</h1>
            <p style={{ fontSize: '16px', color: '#94a3b8', margin: 0 }}>Social OAuth Data Deletion Instructions &amp; Token Purge Guide</p>
          </div>
        </div>

        <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.8', marginBottom: '32px', background: 'rgba(15, 23, 42, 0.6)', padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
          تطبيقاً لمعايير الخصوصية العالمية ولتوجيهات منصات <strong>Meta (Facebook &amp; Instagram)</strong> و <strong>Google (YouTube)</strong>، توفر منصة <strong>Crown SaaS</strong> طرقاً مباشرة وسريعة تمنحك الحق المطلق في مسح كافة بيانات حساباتك ورموز وصولك المشفرة (Access Tokens) من خوادمنا بشكل دائم ونهائي في أي وقت.
        </p>

        {/* Method 1: Instant Dashboard Deletion */}
        <section style={{ marginBottom: '36px', background: 'rgba(15, 23, 42, 0.5)', padding: '24px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#f3e5ab', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <CheckCircle2 size={22} color="#10b981" />
            الطريقة الأولى: الحذف الفوري والمباشر من لوحة التحكم (الأسرع والأسهل)
          </h2>
          <p style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: '1.8', marginBottom: '16px' }}>
            يمكنك إزالة حسابك المرتبط بنفسك دون الرجوع للدعم الفني، وسيتم مسح التوكن المشفر وكافة سجلات الحساب من قاعدة البيانات فوراً:
          </p>
          <ol style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: '2', paddingRight: '24px', margin: '0 0 16px 0' }}>
            <li>قم بتسجيل الدخول إلى حسابك في منصة <strong>Crown SaaS</strong>.</li>
            <li>اذهب إلى قسم <strong>الحسابات المربوطة (Connected Accounts)</strong>.</li>
            <li>اضغط على زر القائمة (الثلاث نقاط) بجانب الحساب الذي ترغب بحذفه (فيسبوك، إنستقرام، أو يوتيوب).</li>
            <li>اختر <strong>🔌 إلغاء الربط (Disconnect)</strong> أو <strong>🗑️ حذف نهائي (Delete)</strong>.</li>
          </ol>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px 16px', borderRadius: '10px', color: '#a7f3d0', fontSize: '14px', fontWeight: 'bold' }}>
            ⚡ بمجرد الضغط على الحذف، يقوم النظام تلقائياً بتدمير رموز المصادقة (Tokens) من قاعدة بيانات Supabase بشكل نهائي غير قابل للاسترجاع.
          </div>
        </section>

        {/* Method 2: Revoke from Meta & Google */}
        <section style={{ marginBottom: '36px', background: 'rgba(15, 23, 42, 0.5)', padding: '24px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#f3e5ab', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Shield size={22} color="#3b82f6" />
            الطريقة الثانية: إزالة الصلاحيات من إعدادات Meta أو Google مباشرة
          </h2>
          <p style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: '1.8', marginBottom: '16px' }}>
            يمكنك أيضاً إبطال صلاحيات تطبيق <strong>Crown SaaS</strong> مباشرة من إعدادات حسابك على المنصات الرسمية، مما يؤدي لإلغاء صلاحية التوكن المخزن لدينا فوراً:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px 0' }}>
                📘 لحسابات Facebook &amp; Instagram:
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', margin: '0 0 12px 0' }}>
                اذهب إلى إعدادات فيسبوك ← <strong>الأمان وتسجيل الدخول ← تكاملات الأعمال (Business Integrations)</strong>، ابحث عن تطبيق Crown واضغط <strong>إزالة (Remove)</strong>.
              </p>
              <a href="https://www.facebook.com/settings?tab=business_tools" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#3b82f6', fontSize: '13px', textDecoration: 'none', fontWeight: 'bold' }}>
                فتح إعدادات فيسبوك <ExternalLink size={14} />
              </a>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px 0' }}>
                ▶️ لقنوات YouTube (Google):
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', margin: '0 0 12px 0' }}>
                اذهب إلى إدارة حساب Google ← <strong>الأمان ← التطبيقات والخدمات التابعة لجهات خارجية</strong>، ابحث عن Crown واضغط <strong>إزالة الوصول (Remove Access)</strong>.
              </p>
              <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '13px', textDecoration: 'none', fontWeight: 'bold' }}>
                فتح إعدادات Google <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* Method 3: Email Support Request */}
        <section style={{ marginBottom: '36px', background: 'rgba(15, 23, 42, 0.5)', padding: '24px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#f3e5ab', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Mail size={22} color="#d4af37" />
            الطريقة الثالثة: طلب الحذف الشامل عبر البريد الإلكتروني (Manual Request)
          </h2>
          <p style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: '1.8', margin: '0 0 16px 0' }}>
            إذا كنت ترغب في أن يقوم فريق الدعم الفني بمسح كافة بياناتك وسجلاتك وتوكنز الربط بالنيابة عنك، يمكنك إرسال رسالة بريد إلكتروني من عنوانك المسجل لدينا:
          </p>
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '13px', color: '#94a3b8', display: 'block' }}>البريد الإلكتروني لمسؤول حماية البيانات:</span>
              <strong style={{ fontSize: '18px', color: '#fff' }}>support@crown-saas.com</strong>
            </div>
            <span style={{ background: 'rgba(212, 175, 55, 0.2)', color: '#f3e5ab', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
              ⏱️ يتم التنفيذ خلال 24 ساعة
            </span>
          </div>
        </section>

        {/* Section 4: English Summary for Reviewers */}
        <section style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '40px' }} dir="ltr">
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#d4af37', margin: '0 0 12px 0' }}>🇬🇧 Meta &amp; Google Data Deletion Verification Instructions</h3>
          <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', margin: '0 0 10px 0' }}>
            According to Meta Platform Term 4 and Google OAuth API policies, users can request full deletion of their connected social accounts, access tokens, and stored metadata from <strong>Crown SaaS</strong> at any time. Users can trigger immediate automated deletion by clicking <strong>&quot;Disconnect / Delete&quot;</strong> in their dashboard under Connected Accounts. Alternatively, users may revoke app authorization in their Facebook Business Integrations or Google Security Settings, or email <strong>support@crown-saas.com</strong> with the subject &quot;Social Data Deletion Request&quot; for complete manual erasure within 24 hours.
          </p>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
            Callback / Verification Endpoint: <strong>https://crown-saas.com/data-deletion</strong>
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ maxWidth: '900px', margin: '40px auto 0 auto', textAlign: 'center', color: '#64748b', fontSize: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '24px' }}>
        <p style={{ margin: '0 0 12px 0' }}>© {new Date().getFullYear()} Crown SaaS. جميع الحقوق محفوظة.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <Link href="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>الخصوصية</Link>
          <Link href="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>الشروط</Link>
          <Link href="/data-deletion" style={{ color: '#94a3b8', textDecoration: 'none' }}>حذف البيانات</Link>
        </div>
      </footer>
    </div>
  );
}
