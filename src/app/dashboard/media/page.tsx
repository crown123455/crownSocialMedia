'use client';

import React, { useState, useRef } from 'react';
import { useTenant } from '@/store/TenantContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/ToastProvider';
import { mediaStorageService } from '@/services/mediaStorageService';
import { Image as ImageIcon, UploadCloud, Search, Filter, Play, MoreVertical } from 'lucide-react';
import { MediaAsset } from '@/types';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';

export default function MediaLibraryPage() {
  const { activeCreator, media, setMedia, addLog } = useTenant();
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const creatorMedia = activeCreator ? media.filter(m => m.creator_id === activeCreator.id) : media;
  const filteredMedia = creatorMedia.filter(m => m.file_name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleFileUpload = async (file: File) => {
    if (!activeCreator) {
      error('Please select a Creator first');
      return;
    }

    const validation = mediaStorageService.validateFileBeforeUpload(file);
    if (!validation.valid) {
      error(validation.error || 'Invalid file');
      return;
    }

    try {
      // 1. Get presigned URL from our API
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type })
      });
      
      const { uploadUrl, publicUrl, r2Key, error: apiError } = await res.json();
      if (apiError || !uploadUrl) throw new Error(apiError || 'Failed to get upload URL');

      // 2. Upload file directly to Cloudflare R2
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });
      
      if (!uploadRes.ok) throw new Error('Failed to upload to Cloudflare R2');
      
      const localMeta = await mediaStorageService.extractMetadataLocal(file);
      
      const newAsset: MediaAsset = {
        id: r2Key,
        creator_id: activeCreator.id,
        file_name: file.name,
        file_size_bytes: file.size,
        mime_type: file.type,
        status: 'raw',
        tags: [],
        uploaded_by: 'd7a5dff1-4e75-4f16-8e4b-dc1e7be7bf3d', // Specific admin UID
        created_at: new Date().toISOString(),
        public_url: publicUrl,
        r2_key: r2Key,
        ...localMeta
      };

      const { data, error: sbError } = await supabase.from('media_assets').insert([newAsset]).select();
      if (sbError) throw sbError;

      setMedia(prev => [data[0] as MediaAsset, ...prev]);
      addLog('Media Upload', `Uploaded ${file.name}`, 'Success');
      success('File uploaded successfully');
    } catch (err: any) {
      console.error(err);
      error(`Failed to upload file: ${err.message}`);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  if (!activeCreator) {
    return (
      <div className={styles.container}>
        <EmptyState 
          icon={ImageIcon}
          title="Select a Creator"
          description="Media Library is isolated per creator. Please select an active creator from the top menu."
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Media Library</h1>
          <p className={styles.subtitle}>Upload and manage assets for {activeCreator.full_name}</p>
        </div>
        <div className={styles.actions}>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/jpeg,image/png,video/mp4,video/quicktime"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
          />
          <Button variant="primary" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud size={16} /> Upload Media
          </Button>
        </div>
      </div>

      <div 
        className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <UploadCloud size={32} className="text-gray-medium mb-2" />
        <h4>Drag & Drop files here</h4>
        <p>Supports JPG, PNG, MP4, MOV up to 500MB</p>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <Search size={18} className="text-gray" />
          <input 
            className={styles.searchInput}
            placeholder="Search by file name or tags..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline"><Filter size={16} /> Filters</Button>
      </div>

      {filteredMedia.length === 0 ? (
        <EmptyState 
          icon={ImageIcon}
          title="No media found"
          description="Upload your first image or video to get started."
        />
      ) : (
        <div className={styles.grid}>
          {filteredMedia.map(asset => {
            const isVideo = asset.mime_type.startsWith('video/');
            const mbSize = (asset.file_size_bytes / (1024 * 1024)).toFixed(2);
            
            return (
              <Card key={asset.id} padding="none" className={styles.mediaCard}>
                <div className={styles.mediaPreview}>
                  {isVideo ? (
                    <div className={styles.videoPreview}>
                      <video src={asset.public_url} className={styles.mediaImg} />
                      <div className={styles.playIcon}><Play size={24} /></div>
                      {asset.duration_seconds && (
                        <span className={styles.durationBadge}>
                          {Math.floor(asset.duration_seconds / 60)}:{(Math.floor(asset.duration_seconds % 60)).toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  ) : (
                    <img src={asset.public_url} alt={asset.file_name} className={styles.mediaImg} />
                  )}
                  <div className={styles.actionsOverlay}>
                    <button className={styles.iconBtn}><MoreVertical size={20} /></button>
                  </div>
                </div>
                <div className={styles.mediaInfo}>
                  <h4 className={styles.fileName} title={asset.file_name}>{asset.file_name}</h4>
                  <div className={styles.metaRow}>
                    <span>{mbSize} MB</span>
                    <span>•</span>
                    <span>{isVideo ? 'Video' : 'Image'}</span>
                    <span>•</span>
                    <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <StatusBadge status={asset.status === 'raw' ? 'warning' : 'success'} label={asset.status} />
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
