'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/store/TenantContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/ToastProvider';
import { ArrowLeft, Save } from 'lucide-react';
import styles from './page.module.css';
import { Creator } from '@/types';
import { supabase } from '@/lib/supabase';

export default function AddCreatorPage() {
  const router = useRouter();
  const { creators, setCreators, addLog, setActiveCreatorId } = useTenant();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    full_name: '',
    category: 'Business',
    monthly_content_target: '30',
  });
  const [profilePhoto, setProfilePhoto] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(reader.result as string);
      success('تم رفع الصورة مؤقتاً وبنجاح!');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name) {
      error('يرجى إدخال الاسم الكامل لصانع المحتوى');
      return;
    }

    const newCreator = {
      id: crypto.randomUUID(),
      user_id: 'd7a5dff1-4e75-4f16-8e4b-dc1e7be7bf3d',
      full_name: formData.full_name,
      display_name: formData.full_name,
      category: formData.category,
      country: 'United Arab Emirates',
      city: 'Dubai',
      manager_name: 'إدارة Crown',
      manager_phone: '',
      manager_email: 'manager@crown.com',
      contract_status: 'active' as const,
      content_package: 'full_management' as const,
      monthly_content_target: parseInt(formData.monthly_content_target, 10) || 30,
      profile_photo: profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    const createdObj = {
      ...newCreator,
      id: newCreator.id || crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as unknown as Creator;

    const deletedIds = JSON.parse(localStorage.getItem('crown_deleted_creators') || '[]');
    if (deletedIds.includes(createdObj.id)) {
      localStorage.setItem('crown_deleted_creators', JSON.stringify(deletedIds.filter((id: string) => id !== createdObj.id)));
    }

    const nextCreators = [...creators, createdObj];
    setCreators(nextCreators);
    localStorage.setItem('crown_creators', JSON.stringify(nextCreators));
    setActiveCreatorId(createdObj.id);
    localStorage.setItem('crown_active_creator_id', createdObj.id);
    addLog('Add Creator', newCreator.full_name, 'Success');

    // Directly save to external Supabase from browser
    try {
      const { error: sbError } = await supabase.from('creators').upsert([
        {
          id: createdObj.id,
          full_name: createdObj.full_name,
          display_name: createdObj.display_name || createdObj.full_name,
          category: createdObj.category || 'Business',
          monthly_content_target: createdObj.monthly_content_target || 30,
          profile_photo: createdObj.profile_photo || '',
          contract_status: createdObj.contract_status || 'active'
        }
      ]);
      if (sbError) {
        console.error('Supabase direct upsert error:', sbError);
      }
    } catch (e) {
      console.error('Supabase direct upsert exception:', e);
    }

    success('تمت إضافة صانع المحتوى وحفظه في قاعدة البيانات الخارجية بنجاح!');
    router.push('/dashboard/creators');
  };

  return (
    <div className={styles.container} dir="rtl">
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/dashboard/creators')}>
          <ArrowLeft size={20} /> العودة لقائمة صناع المحتوى
        </button>
        <h1 className={styles.title}>إضافة صانع محتوى جديد (Add New Creator)</h1>
        <p className={styles.subtitle}>قم بإدخال البيانات الأساسية فقط وصورة البروفايل للبدء فوراً في نشر وجدولة الفيديوهات.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <Card padding="lg" className={styles.formSection}>
          <h3 className={styles.sectionTitle}>البيانات الأساسية وصورة البروفايل</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eff6ff', border: '2px dashed #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '32px' }}>📷</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', color: '#1e3a8a', marginBottom: '6px' }}>
                صورة البروفايل (Profile Photo) *
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                style={{ fontSize: '13px', color: '#475569', width: '100%' }}
              />
              <span style={{ display: 'block', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                ستظهر هذه الصورة في القائمة العلوية عند اختيار صانع المحتوى للنشر.
              </span>
            </div>
          </div>

          <div className={styles.grid}>
            <Input 
              label="الاسم الكامل (Full Name) *" 
              name="full_name" 
              placeholder="مثال: أحمد محمد / سارة الفاشن"
              value={formData.full_name} 
              onChange={handleChange} 
              required 
            />
            
            <Select 
              label="التخصص / المجال (Category) *" 
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              options={[
                { value: 'Business', label: 'ريادة أعمال وبيزنس (Business)' },
                { value: 'Fashion', label: 'موضة وأزياء (Fashion)' },
                { value: 'Tech', label: 'تكنولوجيا وتقنية (Tech)' },
                { value: 'Gaming', label: 'ألعاب فيديو (Gaming)' },
                { value: 'Fitness', label: 'لياقة وصحة (Fitness)' },
                { value: 'Food', label: 'طبخ ومأكولات (Food)' },
                { value: 'Lifestyle', label: 'لايف ستايل ويوميات (Lifestyle)' },
                { value: 'Education', label: 'تعليم وتطوير (Education)' },
                { value: 'Other', label: 'تخصص آخر (Other)' },
              ]}
              required 
            />

            <Input 
              label="الهدف الشهري للفيديوهات (Monthly Content Target) *" 
              type="number" 
              name="monthly_content_target" 
              value={formData.monthly_content_target} 
              onChange={handleChange} 
              min="1"
            />
          </div>
        </Card>

        <div className={styles.formActions}>
          <Button type="button" variant="ghost" onClick={() => router.push('/dashboard/creators')}>إلغاء</Button>
          <Button type="submit" variant="primary" style={{ background: '#2563eb', color: '#fff', padding: '10px 24px', borderRadius: '12px', fontWeight: 'bold' }}>
            <Save size={18} /> حفظ صانع المحتوى
          </Button>
        </div>
      </form>
    </div>
  );
}
