'use client';

import React from 'react';
import { useTenant } from '@/store/TenantContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { CheckSquare, Check, X, Eye } from 'lucide-react';
import styles from './page.module.css';

export default function ApprovalsPage() {
  const { activeCreator, posts, postTargets, media, setPosts } = useTenant();
  const [selectedPostId, setSelectedPostId] = React.useState<string | null>(null);

  if (!activeCreator) {
    return (
      <div className={styles.container}>
        <EmptyState 
          icon={CheckSquare}
          title="Select a Creator"
          description="Approvals are isolated per creator. Please select one from the top menu."
        />
      </div>
    );
  }

  const pendingPosts = posts.filter(p => p.creator_id === activeCreator.id && p.status === 'pending_approval');

  const selectedPost = selectedPostId ? posts.find(p => p.id === selectedPostId) : null;
  const selectedTargets = selectedPost ? postTargets.filter(t => t.post_id === selectedPost.id) : [];
  const selectedMedia = selectedPost ? media.find(m => m.id === selectedPost.media_asset_ids[0]) : null;

  const handleApproval = (postId: string, approved: boolean) => {
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, status: approved ? 'approved' : 'draft', updated_at: new Date().toISOString() }
        : p
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Approval Queue</h1>
          <p className={styles.subtitle}>Review and approve posts for {activeCreator.full_name}</p>
        </div>
      </div>

      {pendingPosts.length === 0 ? (
        <EmptyState 
          icon={CheckSquare}
          title="All caught up!"
          description="There are no posts waiting for approval."
        />
      ) : (
        <div className={styles.grid}>
          {pendingPosts.map(post => (
            <Card key={post.id} className={styles.approvalCard}>
              <div className={styles.cardHeader}>
                <span className={styles.date}>{new Date(post.created_at).toLocaleString()}</span>
                <span className={styles.author}>By: {post.created_by}</span>
              </div>
              <div className={styles.content}>
                <p>{post.global_caption.substring(0, 100)}...</p>
              </div>
              <button className={styles.viewBtn} onClick={() => setSelectedPostId(post.id)}>
                <Eye size={16} /> View Post Details
              </button>
              <div className={styles.actions}>
                <Button variant="outline" onClick={() => handleApproval(post.id, false)}>
                  <X size={16} /> Reject to Draft
                </Button>
                <Button variant="primary" onClick={() => handleApproval(post.id, true)}>
                  <Check size={16} /> Approve Post
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Post Details Modal */}
      {selectedPost && (
        <div className={styles.modalOverlay} onClick={() => setSelectedPostId(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Review Post</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedPostId(null)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              
              <div className={styles.modalMedia}>
                {selectedMedia?.mime_type.startsWith('video') ? (
                  <video src={selectedMedia.public_url} controls className="w-full h-full object-contain" />
                ) : (
                  <img src={selectedMedia?.public_url} alt="media" className="w-full h-full object-contain" />
                )}
              </div>

              <div className={styles.modalDetails}>
                <div className={styles.detailSection}>
                  <h4>Caption</h4>
                  <div className={styles.captionText}>{selectedPost.global_caption}</div>
                </div>
                
                <div className={styles.detailSection}>
                  <h4>Target Platforms</h4>
                  <div className={styles.modalPlatforms}>
                    {selectedTargets.map(t => (
                      <span key={t.id} className={styles.platformBadge}>{t.platform}</span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
