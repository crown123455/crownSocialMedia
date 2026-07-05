'use client';

import React from 'react';
import Link from 'next/link';
import { Crown, Shield, Lock, Eye, Trash2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '40px 20px' }}>
      {/* Header */}
      <header style={{ maxWidth: '900px', margin: '0 auto 40px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '20px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: '#fff' }}>
          <div style={{ background: 'linear-gradient(135deg, #d4af37, #f3e5ab)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Crown size={28} color="#000" />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, background: 'linear-gradient(135deg, #fff, #d4af37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Crown SaaS</h1>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Content Creator Platform</span>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/terms" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>الشروط والأحكام</Link>
          <Link href="/data-deletion" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>حذف البيانات</Link>
          <Link href="/" style={{ color: '#d4af37', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>← العودة للرئيسية</Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '900px', margin: '0 auto', background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', borderRadius: '24px', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '48px', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(212, 175, 55, 0.15)', padding: '14px', borderRadius: '16px', color: '#d4af37' }}>
            <Shield size={36} />
          </div>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 6px 0', color: '#fff' }}>سياسة الخصوصية وحماية البيانات</h1>
            <p style={{ fontSize: '16px', color: '#94a3b8', margin: 0 }}>Privacy Policy &amp; Social OAuth Data Usage Notice</p>
          </div>
        </div>

        <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.8', marginBottom: '32px', background: 'rgba(15, 23, 42, 0.6)', padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid #d4af37' }}>
          <strong>تاريخ آخر تحديث (Last Updated):</strong> 4 يوليو 2026<br />
          تلتزم منصة <strong>Crown SaaS</strong> بأعلى معايير الأمان والشفافية في التعامل مع بيانات المستخدمين وحسابات التواصل الاجتماعي المربوطة. تشرح هذه الوثيقة كيفية جمعنا واستخدامنا وحمايتنا لبياناتك عند ربط حساباتك عبر منصات <strong>Facebook, Instagram, YouTube</strong>.
        </p>

        {/* Section 1: OAuth Connection */}
        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#f3e5ab', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
            <Lock size={22} color="#d4af37" />
            1. الاتصال الآمن عبر بروتوكول OAuth (Social Platform Integration)
          </h2>
          <p style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: '1.8', marginBottom: '12px' }}>
            تتصل منصتنا بمنصات التواصل الاجتماعي الرسمية <strong>(Facebook Pages, Instagram Business, YouTube Channels)</strong> حصرياً باستخدام بروتوكول المصادقة العالمي الآمن <strong>OAuth 2.0</strong> المعتمد رسمياً من شركتي <strong>Meta</strong> و <strong>Google</strong>.
          </p>
          <ul style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: '1.8', paddingRight: '24px', margin: '0 0 16px 0' }}>
            <li>نحن لا نطلب ولا نقوم بتخزين كلمات المرور (Passwords) الخاصة بحساباتك نهائياً.</li>
            <li>يتم الربط بموافقتك الصريحة (Explicit Consent) أثناء التوجيه إلى نافذة تسجيل الدخول الرسمية الخاصة بـ Meta أو Google.</li>
          </ul>
        </section>

        {/* Section 2: Encrypted Token Storage */}
        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#f3e5ab', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
            <Shield size={22} color="#d4af37" />
            2. تخزين رموز الوصول المشفرة (Encrypted Token Storage)
          </h2>
          <p style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: '1.8', marginBottom: '12px' }}>
            عند اكتمال عملية الربط، يتم إصدار أذونات ورموز وصول (Access Tokens &amp; Refresh Tokens) من المنصة المعنية. نحن نقوم بحماية هذه الرموز باستخدام أحدث تقنيات التشفير:
          </p>
          <ul style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: '1.8', paddingRight: '24px', margin: '0 0 16px 0' }}>
            <li><strong>التشفير في قواعد البيانات (Encrypted Storage):</strong> يتم تخزين كافة رموز الوصول بشكل مشفر وآمن داخل خوادمنا المحمية (Supabase DB).</li>
            <li><strong>عدم المشاركة:</strong> لا يتم أبداً بيع، أو تداول، أو مشاركة رموز الوصول الخاصة بك مع أي طرف ثالث أو أي جهة إعلانية تحت أي ظرف من الظروف.</li>
          </ul>
        </section>

        {/* Section 3: Exclusive Use for Publishing */}
        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#f3e5ab', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
            <Eye size={22} color="#d4af37" />
            3. استخدام الصلاحيات حصرياً للنشر المجدول (Purpose of Data Use)
          </h2>
          <p style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: '1.8', marginBottom: '12px' }}>
            تطلب منصة Crown SaaS الصلاحيات الرسمية لإدارة المحتوى. يتم استخدام هذه الصلاحيات لغرض واحد فقط:
          </p>
          <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '16px 20px', borderRadius: '12px', marginBottom: '16px' }}>
            <p style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: 'bold' }}>
              🎯 الصلاحيات تُستخدم حصرياً ونشر وإدارة المحتوى والمنشورات والفيديوهات التي يطلب المستخدم بنفسه نشرها أو جدولتها عبر لوحة التحكم الرسمية في المنصة. لا نقوم بأي إجراء، أو إعجاب، أو تعليق، أو تعديل دون إيعاز مباشر من المستخدم.
            </p>
          </div>
        </section>

        {/* Section 4: Disconnection & Deletion */}
        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#f3e5ab', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
            <Trash2 size={22} color="#ef4444" />
            4. إلغاء الربط وحذف البيانات (Account Disconnection &amp; Data Deletion)
          </h2>
          <p style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: '1.8', marginBottom: '12px' }}>
            يحتفظ المستخدم بملكية بياناته وحسابه بالكامل، ويمتلك الحق الفوري والمطلق في التحكم بها:
          </p>
          <ul style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: '1.8', paddingRight: '24px', margin: '0 0 16px 0' }}>
            <li><strong>إلغاء الربط (Disconnect):</strong> يمكنك في أي وقت الدخول إلى لوحة التحكم ← الحسابات المربوطة، والضغط على زر <strong>&quot;إلغاء الربط&quot; (Disconnect)</strong> لإيقاف وصول النظام لحسابك فوراً.</li>
            <li><strong>الحذف النهائي (Delete Data):</strong> يمكنك طلب مسح كافة التوكنز والبيانات المرتبطة بحسابك من خوادمنا بشكل دائم ونهائي عن طريق صفحة <Link href="/data-deletion" style={{ color: '#d4af37', textDecoration: 'underline' }}>تعべيمات حذف البيانات (Data Deletion Instructions)</Link>.</li>
          </ul>
        </section>

        {/* Section 5: English Summary for Reviewers */}
        <section style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '40px' }} dir="ltr">
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#d4af37', margin: '0 0 12px 0' }}>🇬🇧 Summary for Meta &amp; Google Verification Reviewers</h3>
          <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', margin: '0 0 10px 0' }}>
            <strong>Crown SaaS</strong> connects to Facebook, Instagram, and YouTube exclusively via standard OAuth 2.0 flows. Access tokens are stored securely with database-level encryption. We use granted scopes solely to publish user-created posts and videos as instructed by the user. Users can disconnect accounts or request complete deletion of their data at any time via their dashboard or our dedicated data deletion endpoint.
          </p>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
            Contact DPO / Support: <strong>privacy@crown-saas.com</strong>
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
