import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  Store,
  FileText,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Gavel
} from 'lucide-react';

interface AdminLayoutProps {
  currentPath: string;
  navigate: (path: string, params?: any) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentPath, navigate, children }) => {
  const { setUserRole, disputes, listings, orders, showToast } = useApp();

  const activeOrdersCount = orders.filter((o) => o.status !== 'COMPLETED').length;

  const handleLogout = () => {
    setUserRole('public');
    showToast('Berhasil keluar dari sesi Administrator.');
    navigate('home');
  };

  // Exact 5 Core Admin Features requested by user + Project Auctions
  const adminMenuItems = [
    {
      label: 'Ringkasan Dashboard',
      path: 'admin-overview',
      icon: LayoutDashboard,
      desc: 'Ringkasan metriks bursa & status operasional',
    },
    {
      label: 'Lelang Proyek & Jaminan',
      path: 'admin-project-auctions',
      icon: Gavel,
      desc: 'Verifikasi jaminan, penawaran OTP, pemenang & refund',
    },
    {
      label: 'Manage Pelanggan',
      path: 'admin-users',
      icon: Users,
      desc: 'Data pengguna, kontak PIC, dan status akun',
    },
    {
      label: 'Manage Buyer (Pabrik)',
      path: 'admin-buyer',
      icon: Building2,
      desc: 'Verifikasi legalitas pabrik, NPWP/NIB, kuota beli',
    },
    {
      label: 'Manage Produk',
      path: 'admin-listings',
      icon: Store,
      badge: listings.length,
      desc: 'Moderasi listing scrap, cek foto & spesifikasi',
    },
    {
      label: 'Manage Transaction',
      path: 'admin-orders',
      icon: Package,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
      desc: 'Escrow, timbangan jembatan, dan persetujuan payout',
    },
    {
      label: 'Laporan',
      path: 'admin-laporan',
      icon: FileText,
      desc: 'Laporan volume transaksi (MT/Rp) & fee platform',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Enterprise Bar (Clean Light Theme) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('home')}
              className="text-xs font-semibold text-slate-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Marketplace</span>
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-sm font-black tracking-tight text-slate-900">
                Scrava Admin Console
              </span>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                LIGHT OPS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-500 hidden sm:block font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200">
              Admin: ops@scrava.com
            </div>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-rose-700 hover:bg-rose-50 hover:border-rose-300 transition-colors"
              title="Keluar dari Admin"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Shell: Left Drawer + Main Viewport (Light Theme) */}
      <div className="flex-1 flex w-full">
        {/* Admin Left Drawer / Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 p-4 shrink-0 space-y-6 hidden md:block">
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Menu Utama Admin
            </div>
            <div className="space-y-1">
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path || (item.path === 'admin-users' && currentPath === 'admin-companies');
                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors text-left ${
                      isActive
                        ? 'bg-slate-900 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <div>
                        <div>{item.label}</div>
                      </div>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 px-3">
            <div className="text-[11px] font-bold text-slate-700">Mata Uang Transaksi:</div>
            <div className="text-xs font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
              <span>🇮🇩</span>
              <span>100% Rupiah (IDR)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
              Seluruh transaksi, jembatan timbang, dan pencairan escrow otomatis dikonversi dan diselesaikan dalam Rupiah.
            </p>
          </div>

          {/* Logout Button at bottom of Left Drawer */}
          <div className="pt-2 px-1 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Keluar Sesi Admin</span>
            </button>
          </div>
        </aside>

        {/* Admin Main Canvas (Light Theme) */}
        <main className="flex-1 bg-slate-50 p-6 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
