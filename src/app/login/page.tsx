import { LoginForm } from '@/components/ui/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Crown',
  description: 'Login to Crown content management platform',
};

export default function LoginPage() {
  return <LoginForm />;
}
