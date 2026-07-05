'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './layout.module.css';
import { Button } from '@/components/ui/Button';
import { 
  Crown, 
  LayoutDashboard, 
  Users, 
  Share2, 
  BarChart2, 
  Calendar, 
  Video, 
  Image as ImageIcon,
  History,
  CheckSquare,
  Users2,
  Settings,
  Activity,
  Search,
  Bell,
  Plus,
  RefreshCw,
  FileText,
  Menu,
  X
} from 'lucide-react';
import { TenantProvider, useTenant } from '@/store/TenantContext';
import { CreatorSelector } from '@/components/ui/CreatorSelector';
import { useState } from 'react';

const navItems = [
  { name: 'نظرة عامة (Overview)', href: '/dashboard', icon: LayoutDashboard },
  { name: 'صناع المحتوى (Creators)', href: '/dashboard/creators', icon: Users },
  { name: 'الحسابات (Accounts)', href: '/dashboard/accounts', icon: Share2 },
  { name: 'النشر الذكي (Studio)', href: '/dashboard/studio', icon: Video },
  { name: 'جدولة المنشورات (Planner)', href: '/dashboard/planner', icon: Calendar },
  { name: 'تاريخ النشر (History)', href: '/dashboard/history', icon: History },
  { name: 'إعدادات الربط التلقائي', href: '/dashboard/integrations', icon: Settings },
  { name: 'إعدادات متقدمة', href: '/dashboard/settings', icon: Activity },
];

const formatTime12Hour = (timeStr?: string) => {
  if (!timeStr) return '6:00 مساءً';
  const parts = timeStr.split(':');
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1] || '00';
  if (isNaN(hours)) return '6:00 مساءً';
  const period = hours >= 12 ? 'مساءً' : 'صباحاً';
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${period}`;
};

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeCreator, creatorSchedules } = useTenant();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentSchedule = activeCreator ? creatorSchedules[activeCreator.id] : null;
  const isScheduleActive = currentSchedule && currentSchedule.enabled;

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className={styles.container} dir="ltr">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={toggleMobileMenu}></div>
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logoArea}>
          <Crown className={styles.crownIcon} size={28} />
          <span className={styles.logoText}>Crown</span>
          <button className={styles.closeMenuBtn} onClick={toggleMobileMenu}>
            <X size={24} />
          </button>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.menuToggleBtn} onClick={toggleMobileMenu}>
              <Menu size={24} />
            </button>
            <div className={styles.searchBar}>
              <Search size={18} className="text-gray" />
              <input 
                type="text" 
                placeholder="Search..." 
                className={styles.searchInput}
              />
            </div>
            <div className={styles.creatorSelectWrapper}>
              <CreatorSelector />
            </div>
          </div>
          
          <div className={styles.headerRight}>
            <div className={styles.desktopOnly}>
              <Button variant="outline" size="sm">Workspace: Crown</Button>
            </div>
            <Button variant="primary" size="sm" onClick={() => router.push('/dashboard/studio')}>
              <Plus size={16} /> <span className={styles.hideOnMobile}>Create Post</span>
            </Button>
            <button className={styles.iconBtn} onClick={() => router.push('/dashboard/settings')} title="Advanced Scheduling">
              <Bell size={20} />
            </button>
            <div className={styles.userAvatar}>
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.contentWrapper}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <DashboardContent>{children}</DashboardContent>
    </TenantProvider>
  );
}
