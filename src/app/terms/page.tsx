'use client';

import React from 'react';
import Link from 'next/link';
import { Crown, FileText, CheckCircle2, AlertCircle, Scale, Globe } from 'lucide-react';

export default function TermsOfServicePage() {
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
          <Link href="/data-deletion" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>حذف البيانات</Link>
          <Link href="/" style={{ color: '#d4af37', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>← العودة للرئيسية</Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '900px', margin: '0 auto', background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', borderRadius: '24px', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '48px', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(212, 175, 55, 0.15)', padding: '14px', borderRadius: '16px', color: '#d4af37' }}>
            <FileText size={36} />
          </div>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 6px 0', color: '#fff' }}>الشروط والأحكام واتفاقية الاستخدام</h1>
            <p style={{ fontSize: '16px', color: '#94a3b8', margin: 0 }}>Terms of Service &amp; Platform Usage Agreement</p>
          </div>
        </div>

        <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.8', marginBottom: '32px', background: 'rgba(15, 23, 42, 0.6)', padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid #d4af37' }}>
          <strong>تاريخ السريان (Effective Date):</strong> 4 يوليو 2026<br />
          مرحباً بك في منصة <strong>Crown SaaS</strong> لإدارة وجدولة المحتوى الرقمي. باستخدامك للمنصة أو ربط حساباتك الاجتماعية، فإنك توافق التام على الالتزام بهذه الشروط والأحكام وأحكام منصات التواصل الاجتماعي المرتبطة.
        </p>

        {/* Section 1: Acceptance */}
        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#f3e5ab', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
            <CheckCircle2 size={22} color="#d4af37" />
            1. قبول الشروط والأهلية (Acceptance of Terms)
          </h2>
          <p style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: '1.8', marginBottom: '12px' }}>
            يجب أن تكون كامل الأهلية القانونية لاستخدام هذه المنصة وإدارة الحسابات المرتبطة بها. يُحظر استخدام المنصة لأي أغراض مخالفة للقوانين المحلية والدولية أو لنشر محتوى يحض على الكراهية، العنف، أو انتهاك حقوق الملكية الفكرية.
          </p>
        </section>

        {/* Section 2: Platform Compliance */}
        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#f3e5ab', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
            <Globe size={22} color="#d4af37" />
            2. التوافق مع شروط طرف ثالث (Meta &amp; YouTube Compliance)
          </h2>
          <p style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: '1.8', marginBottom: '12px' }}>
            عند ربط حساباتك عبر منصات التواصل الاجتماعي، فإنك تقر وتلتزم بالشروط الخاصة بتلك المنصات:
          </p>
          <ul style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: '1.8', paddingRight: '24px', margin: '0 0 16px 0' }}>
            <li><strong>YouTube / Google:</strong> باستخدامك لميزات يوتيوب في منصتنا، فإنك توافق على الالتزام بـ <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#d4af37' }}>شروط خدمة YouTube (YouTube Terms of Service)</a> وسياسته للخصوصية.</li>
            <li><strong>Meta (Facebook &amp; Instagram):</strong> توافق على الالتزام بشروط وأحكام منصة Meta للمطورين والمستخدمين التجاريين، وعدم إساءة استخدام صلاحيات النشر التلقائي.</li>
          </ul>
        </section>

        {/* Section 3: Intellectual Property */}
        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#f3e5ab', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
            <Scale size={22} color="#d4af37" />
            3. ملكية المحتوى والمسؤولية (Content Ownership &amp; Liability)
          </h2>
          <p style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: '1.8', marginBottom: '12px' }}>
            أنت المالك الوحيد والمسؤول بالكامل عن المحتوى (فيديوهات، صور، نصوص) الذي تقوم بجدولته أو نشره عبر منصة Crown SaaS. لا تتحمل المنصة أي مسؤولية قانونية عن أي مخالفات لحقوق النشر أو اعتراضات تصدر من المنصات الاجتماعية ضد محتواك.
          </p>
        </section>

        {/* Section 4: Termination */}
        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#f3e5ab', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
            <AlertCircle size={22} color="#ef4444" />
            4. إنهاء الخدمة أو إلغاء الوصول (Service Termination)
          </h2>
          <p style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: '1.8', marginBottom: '12px' }}>
            يحق لإدارة منصة Crown SaaS تعليق أو إنهاء حساب أي مستخدم يثبت قيامه بإساءة استخدام المنصة، أو محاولة اختراق خوادمها، أو استغلال واجهات الربط (API) لإرسال رسائل مزعجة (Spam).
          </p>
        </section>

        {/* Section 5: English Summary */}
        <section style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '40px' }} dir="ltr">
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#d4af37', margin: '0 0 12px 0' }}>🇬🇧 Terms of Service Overview</h3>
          <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', margin: '0 0 10px 0' }}>
            By accessing <strong>Crown SaaS</strong> and utilizing our OAuth integrations with Meta and Google, you agree to comply with all platform policies, including YouTube Terms of Service and Meta Business Policies. Users retain 100% ownership of their published content and are responsible for adherence to copyright laws.
          </p>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
            Legal Inquiries: <strong>legal@crown-saas.com</strong>
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
