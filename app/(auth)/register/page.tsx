import type { Metadata } from 'next';
import BrandPanel from '@/components/auth/BrandPanel';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      <BrandPanel />
      <RegisterForm />
    </div>
  );
}
