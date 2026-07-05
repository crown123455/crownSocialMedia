'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Creator, SocialAccount, AuditLog, MediaAsset, Post, PostTarget, PostApproval } from '@/types';
import { supabase } from '@/lib/supabase';

interface TenantContextType {
  activeCreatorId: string | null;
  setActiveCreatorId: (id: string | null) => void;
  creators: Creator[];
  setCreators: React.Dispatch<React.SetStateAction<Creator[]>>;
  accounts: SocialAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<SocialAccount[]>>;
  logs: AuditLog[];
  addLog: (action: string, resource: string, status: 'Success' | 'Failed') => void;
  media: MediaAsset[];
  setMedia: React.Dispatch<React.SetStateAction<MediaAsset[]>>;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  postTargets: PostTarget[];
  setPostTargets: React.Dispatch<React.SetStateAction<PostTarget[]>>;
  postApprovals: PostApproval[];
  setPostApprovals: React.Dispatch<React.SetStateAction<PostApproval[]>>;
  activeCreator: Creator | null;
  deleteCreator: (id: string) => Promise<void>;
  creatorSchedules: Record<string, { days: string[], time: string, enabled: boolean, notifyHoursBefore: number }>;
  updateCreatorSchedule: (creatorId: string, config: { days: string[], time: string, enabled: boolean, notifyHoursBefore: number }) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Removed Mock Data

export function TenantProvider({ children }: { children: ReactNode }) {
  // Try to load from localStorage first, fallback to mock data
  const [activeCreatorId, setActiveCreatorIdState] = useState<string | null>(null);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postTargets, setPostTargets] = useState<PostTarget[]>([]);
  const [postApprovals, setPostApprovals] = useState<PostApproval[]>([]);
  const [creatorSchedules, setCreatorSchedules] = useState<Record<string, { days: string[], time: string, enabled: boolean, notifyHoursBefore: number }>>({});

  useEffect(() => {
    const fetchSupabaseData = async () => {
      try {
        const [creatorsRes, accountsRes, mediaRes] = await Promise.all([
          supabase.from('creators').select('*'),
          supabase.from('social_accounts').select('*'),
          supabase.from('media_assets').select('*')
        ]);
        
        const deletedCreators = JSON.parse(localStorage.getItem('crown_deleted_creators') || '[]');
        const deletedAccounts = JSON.parse(localStorage.getItem('crown_deleted_accounts') || '[]');

        // Merge Creators
        let mergedCreators: Creator[] = [];
        if (creatorsRes.data && creatorsRes.data.length > 0) {
          mergedCreators = creatorsRes.data.filter((c: Creator) => !deletedCreators.includes(c.id));
        }
        const savedCreators = localStorage.getItem('crown_creators');
        if (savedCreators) {
          try {
            const localCreators: Creator[] = JSON.parse(savedCreators);
            localCreators.forEach(lc => {
              if (lc.id.startsWith('creator_') || lc.id.length < 32) {
                const newId = crypto.randomUUID();
                const oldId = lc.id;
                lc.id = newId;
                const activeId = localStorage.getItem('crown_active_creator_id');
                if (activeId === oldId) {
                  localStorage.setItem('crown_active_creator_id', newId);
                  setActiveCreatorIdState(newId);
                }
              }
              if (!deletedCreators.includes(lc.id) && !mergedCreators.some(mc => mc.id === lc.id || mc.full_name === lc.full_name)) {
                mergedCreators.push(lc);
              }
            });
          } catch(e){}
        }
        if (mergedCreators.length > 0) {
          setCreators(mergedCreators);
          localStorage.setItem('crown_creators', JSON.stringify(mergedCreators));
          mergedCreators.forEach(async (mc) => {
            try {
              const { data: exists } = await supabase.from('creators').select('id').eq('id', mc.id).maybeSingle();
              if (!exists) {
                await supabase.from('creators').insert([mc]);
              }
            } catch(e){}
          });
        }

        // Merge Accounts
        let mergedAccounts: SocialAccount[] = [];
        if (accountsRes.data && accountsRes.data.length > 0) {
          mergedAccounts = accountsRes.data.filter((a: SocialAccount) => !deletedAccounts.includes(a.id));
        }
        const savedAccounts = localStorage.getItem('crown_accounts');
        if (savedAccounts) {
          try {
            const localAccounts: SocialAccount[] = JSON.parse(savedAccounts);
            localAccounts.forEach(la => {
              if (!deletedAccounts.includes(la.id) && !mergedAccounts.some(ma => ma.id === la.id || (ma.creator_id === la.creator_id && ma.platform === la.platform && ma.account_name === la.account_name))) {
                mergedAccounts.push(la);
              }
            });
          } catch(e){}
        }
        if (mergedAccounts.length > 0) {
          setAccounts(mergedAccounts);
          localStorage.setItem('crown_accounts', JSON.stringify(mergedAccounts));
        }

        // Merge Media
        let mergedMedia: MediaAsset[] = [];
        if (mediaRes.data && mediaRes.data.length > 0) {
          mergedMedia = [...mediaRes.data];
        }
        const savedMedia = localStorage.getItem('crown_media');
        if (savedMedia) {
          try {
            const localMedia: MediaAsset[] = JSON.parse(savedMedia);
            localMedia.forEach(lm => {
              if (!mergedMedia.some(mm => mm.id === lm.id || mm.file_name === lm.file_name)) {
                mergedMedia.push(lm);
              }
            });
          } catch(e){}
        }
        if (mergedMedia.length > 0) {
          setMedia(mergedMedia);
          localStorage.setItem('crown_media', JSON.stringify(mergedMedia));
        }
      } catch (err) {
        console.error('Error fetching Supabase data', err);
        const savedCreators = localStorage.getItem('crown_creators');
        if (savedCreators) try { setCreators(JSON.parse(savedCreators)); } catch(e){}
        const savedAccounts = localStorage.getItem('crown_accounts');
        if (savedAccounts) try { setAccounts(JSON.parse(savedAccounts)); } catch(e){}
      }
    };
    
    fetchSupabaseData();
    
    const savedId = localStorage.getItem('crown_active_creator_id');
    if (savedId) {
      setActiveCreatorIdState(savedId);
    }

    const savedSchedules = localStorage.getItem('crown_creator_schedules');
    if (savedSchedules) {
      try {
        setCreatorSchedules(JSON.parse(savedSchedules));
      } catch (e) {
        console.error('Error parsing creator schedules', e);
      }
    }

    const savedPosts = localStorage.getItem('crown_posts');
    if (savedPosts) {
      try { setPosts(JSON.parse(savedPosts)); } catch (e) {}
    }
    const savedTargets = localStorage.getItem('crown_post_targets');
    if (savedTargets) {
      try { setPostTargets(JSON.parse(savedTargets)); } catch (e) {}
    }
    const savedCreatorsInit = localStorage.getItem('crown_creators');
    if (savedCreatorsInit) {
      try { 
        const parsed: Creator[] = JSON.parse(savedCreatorsInit);
        parsed.forEach(c => {
          if (c.id.startsWith('creator_') || c.id.length < 32) {
            const newId = crypto.randomUUID();
            const oldId = c.id;
            c.id = newId;
            const activeId = localStorage.getItem('crown_active_creator_id');
            if (activeId === oldId) {
              localStorage.setItem('crown_active_creator_id', newId);
              setActiveCreatorIdState(newId);
            }
          }
        });
        setCreators(parsed); 
        localStorage.setItem('crown_creators', JSON.stringify(parsed));
        parsed.forEach(async (mc) => {
          try {
            const { data: exists } = await supabase.from('creators').select('id').eq('id', mc.id).maybeSingle();
            if (!exists) {
              await supabase.from('creators').insert([mc]);
            }
          } catch(e){}
        });
      } catch (e) {}
    }
    const savedAccountsInit = localStorage.getItem('crown_accounts');
    if (savedAccountsInit) {
      try { setAccounts(JSON.parse(savedAccountsInit)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (posts.length > 0) localStorage.setItem('crown_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    if (postTargets.length > 0) localStorage.setItem('crown_post_targets', JSON.stringify(postTargets));
  }, [postTargets]);

  useEffect(() => {
    if (media.length > 0) localStorage.setItem('crown_media', JSON.stringify(media));
  }, [media]);

  useEffect(() => {
    if (creators.length > 0) localStorage.setItem('crown_creators', JSON.stringify(creators));
  }, [creators]);

  useEffect(() => {
    if (accounts.length > 0) localStorage.setItem('crown_accounts', JSON.stringify(accounts));
  }, [accounts]);

  const updateCreatorSchedule = (creatorId: string, config: { days: string[], time: string, enabled: boolean, notifyHoursBefore: number }) => {
    setCreatorSchedules(prev => {
      const next = { ...prev, [creatorId]: config };
      localStorage.setItem('crown_creator_schedules', JSON.stringify(next));
      return next;
    });
  };

  const setActiveCreatorId = (id: string | null) => {
    setActiveCreatorIdState(id);
    if (id) {
      localStorage.setItem('crown_active_creator_id', id);
    } else {
      localStorage.removeItem('crown_active_creator_id');
    }
  };

  const addLog = (action: string, resource: string, status: 'Success' | 'Failed') => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      user_name: 'Admin User', // Hardcoded for now
      action,
      resource,
      status,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const deleteCreator = async (id: string) => {
    const deletedIds = JSON.parse(localStorage.getItem('crown_deleted_creators') || '[]');
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      localStorage.setItem('crown_deleted_creators', JSON.stringify(deletedIds));
    }
    setCreators(prev => {
      const next = prev.filter(c => c.id !== id);
      localStorage.setItem('crown_creators', JSON.stringify(next));
      return next;
    });
    if (activeCreatorId === id) setActiveCreatorId(null);
    try {
      await supabase.from('creators').delete().eq('id', id);
      addLog('Delete Creator', `Deleted creator ${id}`, 'Success');
    } catch (err) {
      console.error('Error deleting creator:', err);
      addLog('Delete Creator', `Deleted locally ${id}`, 'Success');
    }
  };

  const activeCreator = creators.find((c) => c.id === activeCreatorId) || null;

  return (
    <TenantContext.Provider 
      value={{ 
        activeCreatorId, 
        setActiveCreatorId, 
        creators, 
        setCreators, 
        accounts, 
        setAccounts, 
        logs, 
        addLog,
        media,
        setMedia,
        posts,
        setPosts,
        postTargets,
        setPostTargets,
        postApprovals,
        setPostApprovals,
        activeCreator,
        deleteCreator,
        creatorSchedules,
        updateCreatorSchedule
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
