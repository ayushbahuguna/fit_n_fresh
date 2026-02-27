import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CartProvider } from '@/contexts/CartContext';
import { getSession } from '@/lib/session';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session ? { role: session.role } : null;

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
