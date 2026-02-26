import type { Metadata } from 'next';
import BrandPanel from '@/components/auth/BrandPanel';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <BrandPanel />
      <LoginForm />
    </div>
  );
}
