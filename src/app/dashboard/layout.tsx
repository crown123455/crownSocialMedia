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
  FileText
} from 'lucide-react';
import { TenantProvider, useTenant } from '@/store/TenantContext';
import { CreatorSelector } from '@/components/ui/CreatorSelector';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Creators', href: '/dashboard/creators', icon: Users },
  { name: 'Social Accounts', href: '/dashboard/accounts', icon: Share2 },
  { name: 'Publishing Studio', href: '/dashboard/studio', icon: Video },
  { name: 'Planner Calendar', href: '/dashboard/planner', icon: Calendar },
  { name: 'Post History', href: '/dashboard/history', icon: History },
  { name: 'API Integrations', href: '/dashboard/integrations', icon: Settings },
  { name: 'Advanced Scheduling', href: '/dashboard/settings', icon: Activity },
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

  const currentSchedule = activeCreator ? creatorSchedules[activeCreator.id] : null;
  const isScheduleActive = currentSchedule && currentSchedule.enabled;

  return (
    <div className={styles.container} dir="ltr">
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <Crown className={styles.crownIcon} size={28} />
          <span className={styles.logoText}>Crown</span>
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
            <div className={styles.searchBar}>
              <Search size={18} className="text-gray" />
              <input 
                type="text" 
                placeholder="Search everything..." 
                className={styles.searchInput}
              />
            </div>
            <CreatorSelector />
          </div>
          
          <div className={styles.headerRight}>
            <Button variant="outline" size="sm">Workspace: Crown</Button>
            <Button variant="primary" size="sm" onClick={() => router.push('/dashboard/studio')}>
              <Plus size={16} /> Create Post
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
