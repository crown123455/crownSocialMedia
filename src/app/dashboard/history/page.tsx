'use client';

import React from 'react';
import { useTenant } from '@/store/TenantContext';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { History as HistoryIcon, Search, Eye, X } from 'lucide-react';
import styles from './page.module.css';

export default function HistoryPage() {
  const { activeCreator, posts, postTargets, media } = useTenant();
  const [selectedPostId, setSelectedPostId] = React.useState<string | null>(null);

  if (!activeCreator) {
    return (
      <div className={styles.container}>
        <EmptyState 
          icon={HistoryIcon}
          title="Select a Creator"
          description="Post history is isolated per creator. Please select one from the top menu."
        />
      </div>
    );
  }

  const creatorPosts = posts.filter(p => p.creator_id === activeCreator.id);

  const selectedPost = selectedPostId ? posts.find(p => p.id === selectedPostId) : null;
  const selectedTargets = selectedPost ? postTargets.filter(t => t.post_id === selectedPost.id) : [];
  const selectedMedia = selectedPost ? media.find(m => m.id === selectedPost.media_asset_ids[0]) : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Post History</h1>
          <p className={styles.subtitle}>Complete log of all content published for {activeCreator.full_name}</p>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <Search size={18} className="text-gray" />
          <input 
            className={styles.searchInput}
            placeholder="Search captions..." 
          />
        </div>
      </div>

      <Card padding="none">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Media</th>
                <th>Caption</th>
                <th>Platforms</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {creatorPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray">No posts found.</td>
                </tr>
              ) : (
                creatorPosts.map(post => {
                  const targets = postTargets.filter(t => t.post_id === post.id);
                  const firstMedia = media.find(m => m.id === post.media_asset_ids[0]);

                  return (
                    <tr key={post.id}>
                      <td>
                        <div className={styles.mediaThumb}>
                          {(() => {
                            const url = firstMedia?.public_url || post.media_url;
                            const type = firstMedia?.mime_type || post.media_type || 'video/mp4';
                            if (!url) return <div className={styles.videoPlaceholder}>▶️ Video</div>;
                            if (type.startsWith('video') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov')) {
                              return <video src={url} className="w-full h-full object-cover" muted />;
                            }
                            return <img src={url} alt="thumbnail" className="w-full h-full object-cover" />;
                          })()}
                        </div>
                      </td>
                      <td>
                        <div className={styles.captionCol}>
                          {post.global_caption.substring(0, 50)}...
                        </div>
                      </td>
                      <td>
                        <div className={styles.platformBadges}>
                          {targets.map(t => (
                            <span key={t.id} className={styles.platformBadge}>{t.platform}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <StatusBadge 
                          status={post.status === 'published' ? 'success' : post.status === 'failed' ? 'error' : 'warning'} 
                          label={post.status.replace('_', ' ')} 
                        />
                      </td>
                      <td className="text-gray">{new Date(post.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className={styles.actionBtn} onClick={() => setSelectedPostId(post.id)}>
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Post Details Modal */}
      {selectedPost && (
        <div className={styles.modalOverlay} onClick={() => setSelectedPostId(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Post Details</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedPostId(null)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              
              <div className={styles.modalMedia}>
                {(() => {
                  const url = selectedMedia?.public_url || selectedPost.media_url;
                  const type = selectedMedia?.mime_type || selectedPost.media_type || 'video/mp4';
                  if (!url) {
                    return <div className="flex items-center justify-center h-48 bg-slate-100 text-slate-600 rounded-xl w-full font-bold">▶️ فيديو محمي / سحابي</div>;
                  }
                  if (type.startsWith('video') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov')) {
                    return <video src={url} controls className="w-full h-full object-contain max-h-[350px] bg-black rounded-xl" />;
                  }
                  return <img src={url} alt="media" className="w-full h-full object-contain max-h-[350px] rounded-xl" />;
                })()}
              </div>

              <div className={styles.modalDetails}>
                <div className={styles.detailSection}>
                  <h4>Caption</h4>
                  <div className={styles.captionText}>{selectedPost.global_caption}</div>
                </div>
                
                <div className={styles.detailSection}>
                  <h4>Platforms</h4>
                  <div className={styles.modalPlatforms}>
                    {selectedTargets.map(t => (
                      <span key={t.id} className={styles.platformBadge}>{t.platform}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4>Status</h4>
                  <StatusBadge 
                    status={selectedPost.status === 'published' ? 'success' : selectedPost.status === 'failed' ? 'error' : 'warning'} 
                    label={selectedPost.status.replace('_', ' ').toUpperCase()} 
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
