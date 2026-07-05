'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import { useToast } from './ToastProvider';
import styles from './LoginForm.module.css';
import { Crown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function LoginForm() {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { error, success } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.user) {
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }

      if (data.user.id !== 'd7a5dff1-4e75-4f16-8e4b-dc1e7be7bf3d') {
        await supabase.auth.signOut();
        document.cookie = 'crown_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        throw new Error('عفواً، لا تملك صلاحية الدخول لهذه اللوحة');
      }

      if (data.session) {
        document.cookie = `crown_session=${data.session.access_token}; path=/; max-age=604800; secure`;
      }
      success('تم تسجيل الدخول بنجاح');
      router.push('/dashboard');
    } catch (err: any) {
      error(err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Card padding="lg" className={styles.loginCard}>
        <div className={styles.logoContainer}>
          <div className={styles.crownWrapper}>
            <Crown size={40} className={styles.crownIcon} />
          </div>
          <h1 className={styles.title}>Crown</h1>
          <p className={styles.subtitle}>تسجيل الدخول للوحة التحكم</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <Input 
            label="البريد الإلكتروني"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            dir="ltr"
          />
          <Input 
            label="كلمة المرور"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            dir="ltr"
          />
          <div className={styles.actions}>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'جاري الدخول...' : 'دخول'}
            </Button>
          </div>
        </form>
        
        <p className={styles.note}>
          Protected by Supabase Auth (Strict UID Enforced).
        </p>
      </Card>
    </div>
  );
}
