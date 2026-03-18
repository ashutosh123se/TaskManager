'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { LogOut, Activity } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    api.get('/auth/me')
      .then((res) => setUser(res.data.data))
      .catch((err) => {
        router.push('/login');
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-blue-500 animate-spin mb-4"></div>
          <p className="text-blue-400 font-mono tracking-widest text-sm animate-pulse">SYNCHRONIZING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse pointer-events-none" style={{ animationDelay: '3s' }}></div>

      <nav className="glass-panel sticky top-0 z-40 w-full border-b border-white/5 shadow-2xl backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="bg-blue-500/20 p-2 rounded-xl group-hover:bg-blue-500/30 transition border border-blue-500/30">
                  <Activity className="text-blue-400 w-6 h-6" />
                </div>
                <span className="text-xl font-extrabold tracking-widest text-white">
                  TASK<span className="text-gradient">MASTER</span>
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-mono text-gray-400">ACTIVE NODE</span>
                <span className="text-sm font-medium text-blue-300">
                  {user.name || user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm rounded-xl bg-white/5 border border-white/10 text-gray-300 px-4 py-2 font-medium hover:bg-red-500/20 hover:text-red-400 transition hover:border-red-500/30"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
