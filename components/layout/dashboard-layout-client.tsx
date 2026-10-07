'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/sidebar';
import Topbar from '@/components/layout/topbar';

export default function DashboardLayoutClient({ children, userName }: { children: React.ReactNode, userName: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-black text-white selection:bg-cyan-500/20 selection:text-cyan-200">
      
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full lg:pl-64">
        <Topbar userName={userName} onMenuToggle={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-8 pt-20 sm:pt-22 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
