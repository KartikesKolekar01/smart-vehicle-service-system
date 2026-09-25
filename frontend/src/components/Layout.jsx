import { useState } from 'react';
import { Menu } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 left-6 z-20 lg:hidden p-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-2xl shadow-2xl shadow-brand-500/50 hover:scale-105 transition-transform"
        >
          <Menu size={22} />
        </button>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}