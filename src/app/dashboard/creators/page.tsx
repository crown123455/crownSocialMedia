'use client';

import React, { useState } from 'react';
import { useTenant } from '@/store/TenantContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Search, Plus, Filter, MoreVertical, Archive } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

export default function CreatorsPage() {
  const { creators, accounts, deleteCreator } = useTenant();
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const router = useRouter();

  const filteredCreators = creators.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Creators</h1>
          <p className={styles.subtitle}>Manage your content creators and their contracts.</p>
        </div>
        <Button variant="primary" onClick={() => router.push('/dashboard/creators/new')}>
          <Plus size={16} /> Add Creator
        </Button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <Search size={18} className="text-gray" />
          <input 
            className={styles.searchInput}
            placeholder="Search by name or handle..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline"><Filter size={16} /> Filter</Button>
      </div>

      {filteredCreators.length === 0 ? (
        <EmptyState 
          icon={Users}
          title="No creators found"
          description={searchTerm ? "Try adjusting your search criteria." : "Get started by adding your first content creator."}
          action={!searchTerm && (
            <Button onClick={() => router.push('/dashboard/creators/new')}>Add Creator</Button>
          )}
        />
      ) : (
        <div className={styles.grid}>
          {filteredCreators.map(creator => {
            const creatorAccounts = accounts.filter(a => a.creator_id === creator.id);
            return (
              <Card key={creator.id} interactive className={styles.creatorCard} onClick={() => router.push(`/dashboard/creators/${creator.id}`)}>
                <div className={styles.cardHeader}>
                  <div className={styles.avatarWrap}>
                    {creator.profile_photo ? (
                      <img src={creator.profile_photo} alt={creator.display_name} className={styles.avatar} />
                    ) : (
                      <div className={styles.avatarFallback}>{creator.display_name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="relative">
                    <button 
                      className={styles.moreBtn} 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === creator.id ? null : creator.id);
                      }}
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {openMenuId === creator.id && (
                      <div 
                        className={styles.dropdownMenu} 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button 
                          className={styles.dropdownItemDelete}
                          onClick={() => {
                            if (window.confirm('هل أنت متأكد من حذف صانع المحتوى هذا؟')) {
                              deleteCreator(creator.id);
                            }
                            setOpenMenuId(null);
                          }}
                        >
                          حذف (Delete)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.name}>{creator.full_name}</h3>
                  <p className={styles.handle}>@{creator.display_name}</p>
                  
                  <div className={styles.badges}>
                    <StatusBadge status={creator.contract_status === 'active' ? 'success' : 'warning'} label={creator.contract_status.toUpperCase()} />
                    <StatusBadge status="neutral" label={creator.category} />
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <div className={styles.stat}>
                    <span>Accounts</span>
                    <strong>{creatorAccounts.length}</strong>
                  </div>
                  <div className={styles.stat}>
                    <span>Target/mo</span>
                    <strong>{creator.monthly_content_target}</strong>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
