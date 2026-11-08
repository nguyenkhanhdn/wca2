/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { StandbyScreen } from './components/StandbyScreen';
import { CitizenHome } from './components/CitizenHome';
import { ServiceDetailScreen } from './components/ServiceDetailScreen';
import { WardMindmapView } from './components/WardMindmapView';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Lock, ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    currentScreen, 
    setCurrentScreen, 
    isAdminLoggedIn, 
    setIsAdminLoginModalOpen,
    selectedWard 
  } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6f9] text-slate-900">
      {/* Show Navbar on all screens except Standby (which has its own immersive kiosk header) */}
      {currentScreen !== 'standby' && <Navbar />}

      {/* Screen Router */}
      <main className="flex-1">
        {currentScreen === 'standby' && <StandbyScreen />}
        {currentScreen === 'citizen_home' && <CitizenHome />}
        {currentScreen === 'service_detail' && <ServiceDetailScreen />}
        {currentScreen === 'mindmap_view' && <WardMindmapView />}
        {currentScreen === 'admin' && <AdminPanel />}
      </main>

      {/* Global Citizen-Facing Government Footer (Bottom of page, with secure Admin Login link) */}
      {currentScreen !== 'standby' && currentScreen !== 'admin' && (
        <footer className="bg-white border-t border-slate-200 py-3.5 px-4 sm:px-8 shadow-xs mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
              <span className="flex items-center gap-1.5 font-bold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-[#be111a]" />
                UBND {selectedWard.name} · Cổng Dịch Vụ Công Một Cửa
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="text-slate-500">
                Hotline hỗ trợ: <strong className="text-slate-700">{selectedWard.hotline}</strong>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentScreen('standby')}
                className="text-slate-600 hover:text-slate-900 font-semibold transition-colors"
              >
                Màn hình chờ Kiosk
              </button>
              <span>·</span>
              <button
                onClick={() => {
                  if (isAdminLoggedIn) {
                    setCurrentScreen('admin');
                  } else {
                    setIsAdminLoginModalOpen(true);
                  }
                }}
                className="flex items-center gap-1.5 text-slate-500 hover:text-[#be111a] font-semibold transition-colors"
                title="Đăng nhập tài khoản cán bộ quản trị"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#be111a]" />
                <span>{isAdminLoggedIn ? 'Bảng quản trị (Đã đăng nhập)' : 'Đăng nhập quản trị'}</span>
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Admin Login Dialog Modal */}
      <AdminLoginModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
