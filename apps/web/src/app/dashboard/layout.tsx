import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'GestiónPro - Dashboard',
  description: 'Panel de gestión para Estudio BB',
  robots: {
    index: false,
    follow: false
  }
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Server-side auth check: redirect to /login if no refreshToken cookie
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken');

  if (!refreshToken?.value) {
    redirect('/login');
  }

  // Persisting the sidebar state in the cookie.
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <InfobarProvider defaultOpen={false}>
            {children}
            <InfoSidebar side='right' />
          </InfobarProvider>
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
