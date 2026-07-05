'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTenant } from '@/store/TenantContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';
import { supabase } from '@/lib/supabase';
import { UploadCloud, Send, FileText, CalendarClock, Share2, Video, X, Smile, Users as UsersIcon, Settings2 } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import styles from './page.module.css';

export default function PublishingStudioPage() {
  const { activeCreator, setActiveCreatorId, creators, accounts, setPosts, setPostTargets, setMedia, addLog } = useTenant();
  const { success, error } = useToast();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedAsset, setUploadedAsset] = useState<{ id: string, url: string, type: string, name: string, rawFile?: File, geminiFileUri?: string } | null>(null);

  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [igCollabUsername, setIgCollabUsername] = useState('');
  
  // AI State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiCaptions, setAiCaptions] = useState<string[]>([]);
  
  // Platform specific settings (e.g. { 'account_id': 'REELS' })
  const [platformConfig, setPlatformConfig] = useState<Record<string, string>>({});

  // Scheduling State
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  
  const creatorAccounts = activeCreator ? accounts.filter(a => a.creator_id === activeCreator.id && a.connection_status === 'connected') : [];

  useEffect(() => {
    const dupStr = localStorage.getItem('duplicate_post');
    if (dupStr) {
      try {
        const dup = JSON.parse(dupStr);
        if (dup.creator_id) setActiveCreatorId(dup.creator_id);
        if (dup.caption) setCaption(dup.caption);
        if (dup.media_url) {
          setUploadedAsset({
            id: 'dup_' + Date.now(),
            url: dup.media_url,
            type: dup.media_type || 'video',
            name: 'duplicated_media'
          });
        }
        if (dup.target_account_ids) setSelectedAccountIds(dup.target_account_ids);
        success('تم تحميل بيانات الفيديو المكرر (Duplicate) في الاستوديو بنجاح! يمكنك التعديل والنشر الآن.');
      } catch (e) {
        console.error('Error parsing duplicate post:', e);
      } finally {
        localStorage.removeItem('duplicate_post');
      }
    }
  }, [setActiveCreatorId, success]);

  const handleFileUpload = async (file: File) => {
    if (!activeCreator) {
      error('Please select a Creator first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const CHUNK_SIZE = 3.5 * 1024 * 1024; // 3.5MB per chunk (under Vercel's 4.5MB limit)
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const sessionId = `upload_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      let finalData: any = null;

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunkBlob = file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunkBlob, file.name);
        formData.append('chunkIndex', String(i));
        formData.append('totalChunks', String(totalChunks));
        formData.append('sessionId', sessionId);
        formData.append('filename', file.name);
        formData.append('contentType', file.type);

        const res = await fetch('/api/upload-chunk', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || `فشل رفع الجزء ${i + 1} من ${totalChunks}`);
        }

        // Update progress
        const progress = Math.round(((i + 1) / totalChunks) * 100);
        setUploadProgress(progress);

        if (data.done) {
          finalData = data;
        }
      }

      if (!finalData) {
        throw new Error('لم يتم استلام تأكيد نهائي من السيرفر');
      }

      const newAsset = {
        id: finalData.r2Key,
        creator_id: activeCreator.id,
        file_name: file.name,
        file_size_bytes: file.size,
        mime_type: file.type,
        status: 'raw',
        tags: [],
        uploaded_by: 'd7a5dff1-4e75-4f16-8e4b-dc1e7be7bf3d',
        created_at: new Date().toISOString(),
        public_url: finalData.publicUrl,
        r2_key: finalData.r2Key
      };

      try {
        const { error: dbError } = await supabase.from('media_assets').insert([newAsset]);
        if (dbError) console.warn('Note: Could not save media metadata to database:', dbError.message);
      } catch (dbErr) {
        console.warn('DB insert skip:', dbErr);
      }

      setMedia(prev => [newAsset as any, ...prev]);

      setUploadedAsset({
        id: finalData.r2Key,
        url: finalData.publicUrl,
        type: file.type,
        name: file.name,
        rawFile: file
      });
      
      success('تم رفع الملف بنجاح! ✅');
    } catch (err: any) {
      console.error(err);
      error(`Upload Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };


  const handleToggleAccount = (id: string) => {
    setSelectedAccountIds(prev => {
      if (prev.includes(id)) {
        const nextConfig = { ...platformConfig };
        delete nextConfig[id];
        setPlatformConfig(nextConfig);
        return prev.filter(a => a !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const setConfig = (accountId: string, type: string) => {
    setPlatformConfig(prev => ({ ...prev, [accountId]: type }));
  };

  const handleGenerateAICaptions = async () => {
    setIsGeneratingAI(true);
    setAiCaptions([]);
    try {
      let finalFileUri = uploadedAsset?.geminiFileUri || '';
      let finalMimeType = uploadedAsset?.type || '';

      if (!finalFileUri && uploadedAsset?.rawFile) {
        success('⏳ جاري الرفع والتحليل المباشر عبر السيرفرات السريعة... يرجى الانتظار');
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
        const file = uploadedAsset.rawFile;
        
        try {
          const uploadRes = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'X-Goog-Upload-Protocol': 'raw',
              'Content-Type': file.type || 'video/mp4',
            },
            body: file,
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            const fileName = uploadData.file.name;
            finalFileUri = uploadData.file.uri;
            finalMimeType = uploadData.file.mimeType;

            let fileState = uploadData.file.state;
            let attempts = 0;
            while (fileState === 'PROCESSING' && attempts < 20) { // Max 60 seconds
              await new Promise(resolve => setTimeout(resolve, 3000));
              const checkRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${apiKey}`);
              if (checkRes.ok) {
                const checkData = await checkRes.json();
                fileState = checkData.state;
              }
              attempts++;
            }
          }
        } catch (e) {
          console.error("Direct upload failed", e);
        }
      }

      const res = await fetch('/api/ai/captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          videoName: uploadedAsset?.name || '', 
          description: caption || '',
          fileUri: finalFileUri,
          mimeType: finalMimeType
        })
      });
      const data = await res.json();
      if (data.success && data.captions) {
        setAiCaptions(data.captions);
        success('✨ تم توليد خيارات الكابشن بنجاح!');
      } else {
        error(data.error || 'حدث خطأ أثناء توليد الكابشن');
      }
    } catch (err: any) {
      error('فشل الاتصال بخدمة الذكاء الاصطناعي');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const submitPost = async (action: 'draft' | 'submit') => {
    if (!uploadedAsset) return error('Please upload a video or image first.');
    if (selectedAccountIds.length === 0) return error('Please select at least one account to publish to.');
    if (!caption.trim()) return error('Please write a caption.');
    
    // Validate media types
    const isVideo = uploadedAsset.type.startsWith('video/');
    if (!isVideo) {
      const hasVideoOnlyPlatforms = selectedAccountIds.some(id => {
        const p = accounts.find(a => a.id === id)?.platform;
        return p === 'youtube' || p === 'tiktok';
      });
      if (hasVideoOnlyPlatforms) {
        return error('YouTube and TikTok only support Video uploads. Please remove them or upload a video instead.');
      }
    }

    if (action === 'submit' && publishMode === 'schedule') {
      if (!scheduleDate) return error('Please select a valid date and time for scheduling.');
      const selectedTime = new Date(scheduleDate).getTime();
      if (selectedTime <= Date.now()) return error('Schedule time must be in the future.');
    }

    const postId = `post_${Date.now()}`;
    const postStatus = action === 'draft' ? 'draft' : (publishMode === 'schedule' ? 'scheduled' : 'publishing');
    
    // Create Post
    setPosts(prev => [{
      id: postId,
      creator_id: activeCreator!.id,
      media_asset_ids: [uploadedAsset.id],
      media_url: uploadedAsset.url,
      media_type: uploadedAsset.type,
      global_caption: caption,
      status: postStatus,
      publish_at: publishMode === 'schedule' ? new Date(scheduleDate).toISOString() : undefined,
      created_by: 'admin_user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, ...prev]);

    const targets = selectedAccountIds.map(accId => {
      const acc = accounts.find(a => a.id === accId);
      return {
        id: `target_${Date.now()}_${accId}`,
        post_id: postId,
        social_account_id: accId,
        platform: acc?.platform || '',
        post_type: platformConfig[accId] || 'FEED',
        custom_caption: caption,
        status: 'pending' as any,
      };
    });
    
    setPostTargets(prev => [...targets, ...prev]);
    addLog(publishMode === 'schedule' ? 'Schedule Post' : 'Create Post', `For ${targets.length} targets`, 'Success');

    // Actually Publish to Meta if NOW
    if (action === 'submit' && publishMode === 'now') {
      try {
        for (const target of targets) {
          const acc = accounts.find(a => a.id === target.social_account_id);
          if (!acc) continue;
          
          const payload: any = {
            platform: acc.platform,
            platformAccountId: acc.platform_account_id || (acc as any).account_id || acc.id,
            accessToken: (acc as any).access_token, 
            videoUrl: uploadedAsset.url,
            mediaType: uploadedAsset.type,
            caption: caption,
            postType: target.post_type
          };

          if (igCollabUsername) {
            payload.collaborator = igCollabUsername.trim();
          }

          if (acc.platform === 'youtube') {
            payload.ageRestriction = platformConfig[`${acc.id}_18plus`] === 'yes';
            payload.madeForKids = platformConfig[`${acc.id}_kids`] === 'yes';
          }

          const res = await fetch('/api/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          const data = await res.json();
          if (data.error) {
            error(`${acc.platform} Error: ${data.error}`);
          } else {
            success(`${acc.platform} Published! ID: ${data.platform_post_id}`);
            setPostTargets(prev => prev.map(t => 
              t.id === target.id ? { ...t, status: 'published', platform_post_id: data.platform_post_id } : t
            ));
          }
        }
      } catch (err: any) {
        error(`API Error: ${err.message}`);
      }
    } else if (action === 'submit' && publishMode === 'schedule') {
      success(`Post scheduled successfully for ${new Date(scheduleDate).toLocaleString()}`);
    } else {
      success(`Post saved successfully as draft.`);
    }
    
    // Reset Form
    setUploadedAsset(null);
    setSelectedAccountIds([]);
    setCaption('');
    setPublishMode('now');
    setScheduleDate('');
    setShowEmojiPicker(false);
    setIgCollabUsername('');
  };

  const hasInstagram = selectedAccountIds.some(id => accounts.find(a => a.id === id)?.platform === 'instagram');

  return (
    <div className={styles.container} dir="rtl" style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
      {/* 👑 Clean Classy Brand Selector Top Bar */}
      <div style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 'bold', overflow: 'hidden', border: activeCreator?.profile_photo ? '2px solid #3b82f6' : 'none' }}>
            {activeCreator?.profile_photo ? (
              <img src={activeCreator.profile_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : '✨'}
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>استوديو النشر السريع (Publishing Studio)</span>
              {activeCreator && <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>{activeCreator.full_name}</span>}
            </h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>ارفع الفيديو، اختر الحسابات المربوطة، اكتب التعليق وانشر فوراً أو احفظه كمسودة بسهولة تامة.</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <select
            value={activeCreator?.id || ''}
            onChange={(e) => {
              setActiveCreatorId(e.target.value || null);
            }}
            style={{ background: '#f8fafc', color: '#1e293b', padding: '12px 20px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: 'bold', minWidth: '240px', outline: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
          >
            <option value="">-- 🔍 اختر صانع المحتوى --</option>
            {creators.map(c => (
              <option key={c.id} value={c.id}>👤 {c.full_name} (Creator)</option>
            ))}
          </select>
        </div>
      </div>

      {!activeCreator ? (
        <div style={{ background: '#ffffff', padding: '60px 20px', borderRadius: '20px', textAlign: 'center', border: '1px dashed #cbd5e1', color: '#64748b', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '20px', color: '#2563eb', marginBottom: '10px', fontWeight: 'bold' }}>⚡ يرجى اختيار صانع المحتوى أولاً من الشريط العلوي</h3>
          <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '450px', margin: '0 auto' }}>اختر أحد الصناع من القائمة المنسدلة للبدء في رفع الوسائط واختيار حسابات النشر والجدولة!</p>
        </div>
      ) : (
      <>
        {/* Network Selection Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px', flexWrap: 'wrap', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <span style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⚡ حدد المنصات للنشر:</span>
          </span>
          {creatorAccounts.map(acc => (
            <button
              key={acc.id}
              type="button"
              onClick={() => handleToggleAccount(acc.id)}
              style={{
                padding: '8px 18px',
                borderRadius: '12px',
                border: selectedAccountIds.includes(acc.id) ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: selectedAccountIds.includes(acc.id) ? '#eff6ff' : '#f8fafc',
                color: selectedAccountIds.includes(acc.id) ? '#1e40af' : '#64748b',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: selectedAccountIds.includes(acc.id) ? '0 2px 6px rgba(37, 99, 235, 0.15)' : 'none'
              }}
            >
              <span className="capitalize">{acc.platform} ({acc.account_name})</span>
              {selectedAccountIds.includes(acc.id) && <span style={{ color: '#2563eb' }}>✓</span>}
            </button>
          ))}
          {creatorAccounts.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', width: '100%' }}>
              <span style={{ color: '#ef4444', fontSize: '14px', fontWeight: '600' }}>⚠️ لا توجد حسابات مربوطة لهذا الصانع. يمكنك ربطها الآن فوراً بضغطة زر:</span>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => window.location.href = `/api/auth/meta/login?creator_id=${activeCreator.id}&filter=facebook`}
                  style={{ background: '#1877f2', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                >
                  <span style={{ fontSize: '16px' }}>🔵</span> ربط صفحة Facebook
                </button>
                <button
                  type="button"
                  onClick={() => window.location.href = `/api/auth/meta/login?creator_id=${activeCreator.id}&filter=instagram`}
                  style={{ background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                >
                  <span style={{ fontSize: '16px' }}>📸</span> ربط حساب Instagram
                </button>
                <span style={{ fontSize: '12px', color: '#7f1d1d', alignSelf: 'center' }}>
                  (رابط التحويل لـ Meta هو: <strong>https://crown-social-media.vercel.app/api/auth/meta/callback</strong>)
                </span>
              </div>
            </div>
          )}
        </div>

        <Card padding="lg" className={styles.studioCard} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <div className={styles.twoColumn}>
          
          {/* Left Column: Media Preview */}
          <div className={styles.leftCol}>
            <div className={styles.sectionTitle} style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>
              <Video size={20} className="text-blue-600" /> ملف الفيديو / الصورة (Media Asset Preview)
            </div>
            
            {!uploadedAsset ? (
              <div 
                className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '40px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/jpeg,image/png,video/mp4,video/quicktime"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                />
                {isUploading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px 0' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                      <UploadCloud size={24} className="animate-bounce" />
                    </div>
                    <span style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '16px' }}>جاري الرفع للسيرفر السحابي... {uploadProgress}%</span>
                    <div style={{ width: '100%', maxWidth: '300px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#2563eb', transition: 'width 0.2s ease-out' }}></div>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>يرجى الانتظار، لا تقم بإغلاق الصفحة. الفيديوهات الكبيرة قد تستغرق بضع دقائق.</span>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-slate-800">اختر أو اسحب فيديو هنا</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">يدعم فيديوهات MP4 أو الصور بجميع المقاسات للنشر الفوري والجدولة.</p>
                  </>
                )}
              </div>
            ) : (
              <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
                {/* Header Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>🎥</span>
                    <span style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '15px', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadedAsset.name}</span>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>جاهز للمعاينة والنشر</span>
                  </div>
                  <button type="button" onClick={() => setUploadedAsset(null)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <X size={14} /> إزالة الملف
                  </button>
                </div>

                {/* Clean Single Video / Image Player */}
                <div style={{ background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', maxHeight: '480px', minHeight: '300px', position: 'relative' }}>
                  {uploadedAsset.type.startsWith('video/') ? (
                    <video src={uploadedAsset.url} controls style={{ maxHeight: '480px', width: '100%', objectFit: 'contain' }} />
                  ) : (
                    <img src={uploadedAsset.url} alt="Preview" style={{ maxHeight: '480px', width: '100%', objectFit: 'contain' }} />
                  )}
                </div>

                {/* Live Caption & Targeting Bar Below */}
                <div style={{ padding: '18px 20px', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ color: '#475569', fontSize: '13px', fontWeight: 'bold' }}>💬 معاينة النص المكتوب (Caption Preview):</span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {creatorAccounts.filter(a => selectedAccountIds.includes(a.id)).map(a => (
                        <span key={a.id} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', color: '#1d4ed8', fontWeight: 'bold' }}>
                          {a.platform === 'youtube' ? '🔴 يوتيوب' : a.platform === 'tiktok' ? '🎵 تيك توك' : a.platform === 'facebook' ? '🔵 فيسبوك' : a.platform === 'instagram' ? '🔴 انستقرام' : a.platform}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#1e293b', fontSize: '14px', direction: 'rtl', textAlign: 'right', minHeight: '60px', whiteSpace: 'pre-wrap', maxHeight: '140px', overflowY: 'auto' }}>
                    {caption || 'لم تقم بكتابة تعليق (Caption) بعد... ✨'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Details & Accounts */}
          <div className={styles.rightCol}>
            
            {/* Accounts */}
            <div>
              <div className={styles.sectionTitle}>
                <Share2 size={18} className="text-gold" /> Select Target Accounts
              </div>
              <div className={styles.accountsList}>
                {creatorAccounts.map(acc => (
                  <div 
                    key={acc.id}
                    className={`${styles.accountRow} ${selectedAccountIds.includes(acc.id) ? styles.selectedRow : ''}`}
                    onClick={() => handleToggleAccount(acc.id)}
                  >
                    <input type="checkbox" checked={selectedAccountIds.includes(acc.id)} readOnly className="w-4 h-4 text-gold focus:ring-gold border-gray-300 rounded" />
                    <div className="capitalize font-semibold text-gray-800 flex-1">{acc.platform}</div>
                    <div className="text-gray-500 text-sm truncate max-w-[150px]">{acc.account_name}</div>
                  </div>
                ))}
                {creatorAccounts.length === 0 && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                    No connected accounts found. Go to Social Accounts to link them first.
                  </div>
                )}
              </div>
            </div>

            {/* Platform Specific Publishing Options */}
            {selectedAccountIds.length > 0 && uploadedAsset && (
              <div className="animate-in fade-in duration-300">
                <div className={styles.sectionTitle}>
                  <Settings2 size={18} className="text-gold" /> Publishing Options
                </div>
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {selectedAccountIds.map(accId => {
                    const acc = accounts.find(a => a.id === accId);
                    if (!acc) return null;
                    const isVideo = uploadedAsset.type.startsWith('video/');
                    
                    return (
                      <div key={accId} className="flex flex-col gap-2 pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                        <span className="text-sm font-bold text-gray-800 capitalize">{acc.platform} ({acc.account_name})</span>
                        <div className="flex gap-4">
                          
                          {acc.platform === 'instagram' && isVideo && (
                            <>
                              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input type="radio" name={`type_${accId}`} checked={platformConfig[accId] === 'REELS' || !platformConfig[accId]} onChange={() => setConfig(accId, 'REELS')} className="text-gold focus:ring-gold" /> Reel
                              </label>
                              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input type="radio" name={`type_${accId}`} checked={platformConfig[accId] === 'FEED'} onChange={() => setConfig(accId, 'FEED')} className="text-gold focus:ring-gold" /> Post
                              </label>
                              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input type="radio" name={`type_${accId}`} checked={platformConfig[accId] === 'STORIES'} onChange={() => setConfig(accId, 'STORIES')} className="text-gold focus:ring-gold" /> Story
                              </label>
                            </>
                          )}

                          {acc.platform === 'instagram' && !isVideo && (
                            <>
                              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input type="radio" name={`type_${accId}`} checked={platformConfig[accId] === 'FEED' || !platformConfig[accId]} onChange={() => setConfig(accId, 'FEED')} className="text-gold focus:ring-gold" /> Post
                              </label>
                              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input type="radio" name={`type_${accId}`} checked={platformConfig[accId] === 'STORIES'} onChange={() => setConfig(accId, 'STORIES')} className="text-gold focus:ring-gold" /> Story
                              </label>
                            </>
                          )}

                          {acc.platform === 'youtube' && (
                            <div className="flex flex-col gap-3 w-full mt-2 pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-4 flex-wrap">
                                <span className="text-xs font-bold text-gray-700">شكل العرض:</span>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                  <input type="radio" name={`type_${accId}`} checked={platformConfig[accId] === 'VIDEO' || !platformConfig[accId]} onChange={() => setConfig(accId, 'VIDEO')} className="text-gold focus:ring-gold" /> فيديو قياسي (Standard)
                                </label>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                  <input type="radio" name={`type_${accId}`} checked={platformConfig[accId] === 'SHORTS'} onChange={() => setConfig(accId, 'SHORTS')} className="text-gold focus:ring-gold" /> Shorts قصير
                                </label>
                              </div>

                              <div className="flex items-center gap-4 flex-wrap bg-red-50 p-3 rounded-xl border border-red-100">
                                <span className="text-xs font-bold text-red-900">سياسة الخصوصية والأعمار (Privacy & Age):</span>
                                <label className="flex items-center gap-1.5 text-xs text-red-800 cursor-pointer font-semibold">
                                  <input type="checkbox" checked={platformConfig[`${accId}_18plus`] === 'yes'} onChange={(e) => setConfig(`${accId}_18plus`, e.target.checked ? 'yes' : 'no')} className="rounded text-red-600 focus:ring-red-500" />
                                  تقييد المحتوى للفئة العمرية 18 سنة فما فوق (Age Restriction 18+)
                                </label>
                                <label className="flex items-center gap-1.5 text-xs text-red-800 cursor-pointer font-semibold">
                                  <input type="checkbox" checked={platformConfig[`${accId}_kids`] === 'yes'} onChange={(e) => setConfig(`${accId}_kids`, e.target.checked ? 'yes' : 'no')} className="rounded text-red-600 focus:ring-red-500" />
                                  مخصص للأطفال (Made for Kids)
                                </label>
                              </div>
                            </div>
                          )}

                          {acc.platform === 'facebook' && isVideo && (
                            <>
                              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input type="radio" name={`type_${accId}`} checked={platformConfig[accId] === 'FEED' || !platformConfig[accId]} onChange={() => setConfig(accId, 'FEED')} className="text-gold focus:ring-gold" /> Page Post
                              </label>
                              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input type="radio" name={`type_${accId}`} checked={platformConfig[accId] === 'REELS'} onChange={() => setConfig(accId, 'REELS')} className="text-gold focus:ring-gold" /> Facebook Reel
                              </label>
                            </>
                          )}

                          {acc.platform === 'facebook' && !isVideo && (
                            <span className="text-sm text-gray-500">Will be published as a Page Post.</span>
                          )}

                          {acc.platform === 'tiktok' && (
                            <span className="text-sm text-gray-500">Will be published as a TikTok Video.</span>
                          )}

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Caption */}
            <div>
              <div className={styles.sectionTitle}>
                <FileText size={18} className="text-gold" /> Post Caption
              </div>
              <div className="relative">
                <textarea 
                  className={styles.textarea}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write an engaging caption here..."
                />
                <button 
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute bottom-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
                  title="Add Emoji"
                >
                  <Smile size={20} />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-14 right-0 z-50 shadow-2xl rounded-lg">
                    <EmojiPicker 
                      onEmojiClick={(emojiData) => setCaption(prev => prev + emojiData.emoji)}
                      autoFocusSearch={false}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* AI Captions Generator */}
            <div style={{ marginTop: '16px' }}>
              <button
                type="button"
                onClick={handleGenerateAICaptions}
                disabled={isGeneratingAI || !uploadedAsset}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: isGeneratingAI ? '#f1f5f9' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: isGeneratingAI ? '#94a3b8' : '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  border: 'none',
                  cursor: isGeneratingAI || !uploadedAsset ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s',
                  boxShadow: isGeneratingAI ? 'none' : '0 4px 12px rgba(139, 92, 246, 0.3)'
                }}
              >
                {isGeneratingAI ? (
                  <>
                    <span className="animate-spin text-xl">⏳</span> جاري توليد الكابشن بالذكاء الاصطناعي...
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '18px' }}>✨</span> توليد 5 خيارات كابشن (بالعامية الأردنية) عبر AI
                  </>
                )}
              </button>

              {aiCaptions.length > 0 && (
                <div style={{ marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#8b5cf6' }}>🤖</span> الخيارات المقترحة:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {aiCaptions.map((cap, idx) => (
                      <div key={idx} style={{ 
                        background: '#ffffff', 
                        padding: '12px 16px', 
                        borderRadius: '12px', 
                        border: '1px solid #cbd5e1',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        transition: 'all 0.2s'
                      }}>
                        <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: '1.5' }}>{cap}</p>
                        <button
                          type="button"
                          onClick={() => setCaption(cap)}
                          style={{
                            alignSelf: 'flex-start',
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>✅</span> استخدم هذا الكابشن
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Collab Section - Redesigned & Premium */}
            <div 
              className="animate-in fade-in duration-300"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '18px 20px',
                marginBottom: '24px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.015)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '10px', color: '#2563eb', display: 'flex' }}>
                    <UsersIcon size={18} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>
                      دعوة حساب للتعاون المشترك (Collaboration Invite)
                    </h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>اختياري - متاح لجميع الحسابات المربوطة</span>
                  </div>
                </div>
              </div>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', direction: 'ltr' }}>
                <div style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRight: 'none',
                  borderRadius: '10px 0 0 10px',
                  padding: '0 16px',
                  color: '#475569',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '48px',
                  userSelect: 'none'
                }}>
                  @
                </div>
                <input 
                  type="text"
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0 10px 10px 0',
                    fontSize: '14px',
                    color: '#0f172a',
                    background: '#ffffff',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    direction: 'ltr',
                    textAlign: 'left'
                  }}
                  placeholder="username (مثال: حساب شريك أو صانع محتوى آخر)"
                  value={igCollabUsername}
                  onChange={(e) => setIgCollabUsername(e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ 
                background: '#eff6ff', 
                border: '1px solid #dbeafe', 
                borderRadius: '10px', 
                padding: '10px 14px', 
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '16px' }}>ℹ️</span>
                <p style={{ margin: 0, fontSize: '12px', color: '#1e40af', lineHeight: '1.6', fontWeight: '500' }}>
                  سيتم إرسال دعوة تعاون رسمية (Collaboration Invite) لهذا الحساب ليظهر المنشور ومشاركات التفاعل على صفحته أيضاً فور موافقته.
                </p>
              </div>
            </div>

            {/* Scheduling */}
            <div className={styles.scheduleBox}>
              <div className={styles.sectionTitle} style={{borderBottom: 'none', paddingBottom: 0, marginBottom: '12px'}}>
                <CalendarClock size={18} className="text-gold" /> Publish Timing
              </div>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="timing" 
                    value="now" 
                    checked={publishMode === 'now'}
                    onChange={() => setPublishMode('now')} 
                  />
                  Publish Now
                </label>
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="timing" 
                    value="schedule" 
                    checked={publishMode === 'schedule'}
                    onChange={() => setPublishMode('schedule')} 
                  />
                  Schedule for Later
                </label>
              </div>
              
              {publishMode === 'schedule' && (
                <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-sm text-gray-600 mb-1">Select Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className={styles.datetimeInput}
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className={styles.finalActions}>
              <Button variant="outline" onClick={() => submitPost('draft')} disabled={isUploading}>
                Save Draft
              </Button>
              <Button variant="primary" onClick={() => submitPost('submit')} disabled={isUploading}>
                {publishMode === 'schedule' ? <><CalendarClock size={16} /> Schedule Post</> : <><Send size={16} /> Publish Now</>}
              </Button>
            </div>

          </div>

        </div>
      </Card>
      </>
      )}
    </div>
  );
}
