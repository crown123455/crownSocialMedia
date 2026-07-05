'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Crown, Play, Calendar, BarChart2, CheckCircle2, ChevronRight, Activity, Shield, Users } from 'lucide-react';
import styles from './page.module.css';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={styles.container} dir="rtl">
      {/* Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <Crown className="text-gold" size={28} />
            <span className={styles.logoText}>Crown</span>
          </div>
          <div className={styles.navLinks}>
            <Link href="#features">المميزات</Link>
            <Link href="#how-it-works">كيف نعمل</Link>
            <Link href="#showcase">نماذج</Link>
          </div>
          <div className={styles.navActions}>
            <Link href="/login">
              <Button variant="outline" size="sm">تسجيل الدخول</Button>
            </Link>
            <Link href="/login">
              <Button variant="primary" size="sm">ابدأ الآن</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeDot}></span>
            منصة إدارة المحتوى الرائدة
          </div>
          <h1 className={styles.headline}>
            منصة <span className="text-gold">Crown</span> لإدارة محتوى صناع المحتوى من التصوير إلى النشر والتحليل
          </h1>
          <p className={styles.subheadline}>
            منصة متكاملة نصور، نعدل، نرتب، ننشر، ونقيس النتائج من لوحة تحكم واحدة فاخرة صُممت خصيصاً لتناسب النخبة.
          </p>
          <div className={styles.heroActions}>
            <Link href="/login">
              <Button variant="primary" size="lg">الدخول للوحة التحكم</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                <Play size={18} /> مشاهدة تجربة النظام
              </Button>
            </Link>
          </div>
        </div>

        {/* Motion Hero */}
        <div className={styles.motionHero}>
          <div className={`${styles.motionCenter} ${mounted ? styles.animateCenter : ''}`}>
            <Crown size={64} className={styles.motionCrown} />
            <div className={styles.rings}></div>
          </div>
          <div className={`${styles.floatingCards} ${mounted ? styles.showCards : ''}`}>
            <Card className={styles.floatCard1} padding="sm">
              <VideoIcon /> فيديو قصير جاهز
            </Card>
            <Card className={styles.floatCard2} padding="sm">
              <Calendar size={18} className="text-gold" /> جدولة للنشر
            </Card>
            <Card className={styles.floatCard3} padding="sm">
              <BarChart2 size={18} className="text-gold" /> +150% نمو
            </Card>
            <Card className={styles.floatCard4} padding="sm">
              <CheckCircle2 size={18} className="text-success" /> تم النشر
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2>لماذا Crown؟</h2>
          <p>أدوات متكاملة تدير إبداعك من الفكرة وحتى الوصول للجمهور</p>
        </div>
        <div className={styles.featureGrid}>
          <FeatureCard 
            icon={Activity} 
            title="تحليلات دقيقة" 
            desc="تتبع أداء جميع حساباتك من مكان واحد بتقارير مفصلة."
          />
          <FeatureCard 
            icon={Users} 
            title="إدارة الفريق والموافقات" 
            desc="سير عمل منظم يتيح للعملاء مراجعة المحتوى والموافقة عليه قبل النشر."
          />
          <FeatureCard 
            icon={Shield} 
            title="أمان عالي وخصوصية" 
            desc="حماية كاملة لبيانات وحسابات المشاهير وصناع المحتوى."
          />
        </div>
      </section>

      {/* Showcase Section */}
      <section id="showcase" className={styles.showcase}>
        <div className={styles.sectionHeader}>
          <h2>نموذج إدارة صناع المحتوى</h2>
        </div>
        <div className={styles.showcaseContent}>
          <Card className={styles.creatorCard} padding="lg">
            <div className={styles.creatorHeader}>
              <div className={styles.creatorAvatar}></div>
              <div>
                <h3>أحمد صانع محتوى</h3>
                <p className="text-gray">متصل بـ 4 منصات</p>
              </div>
              <div className={styles.creatorStatus}>نشط</div>
            </div>
            <div className={styles.creatorStats}>
              <div className={styles.cStat}>
                <span>النمو الشهري</span>
                <strong>+24%</strong>
              </div>
              <div className={styles.cStat}>
                <span>آخر منشور</span>
                <strong>منذ ساعتين</strong>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <Crown size={24} className="text-gold" />
            <span>Crown</span>
          </div>
          <div className={styles.footerLinks}>
            <Link href="/login">Dashboard</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/data-deletion">Data Deletion</Link>
          </div>
        </div>
        <div className={styles.footerBottom}>
          © {new Date().getFullYear()} Crown. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function VideoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"></polygon>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
    </svg>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureIcon}>
        <Icon size={24} />
      </div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDesc}>{desc}</p>
    </div>
  );
}
