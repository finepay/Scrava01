/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { OffPlatformWarningModal } from './components/common/OffPlatformWarningModal';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { MarketplacePage } from './pages/public/MarketplacePage';
import { ListingDetailPage } from './pages/public/ListingDetailPage';
import { AuctionDetailPage } from './pages/public/AuctionDetailPage';
import { ReverseBidPage } from './pages/public/ReverseBidPage';
import { RequirementDetailPage } from './pages/public/RequirementDetailPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { AuthPages } from './pages/public/AuthPages';
import { ProcurementHubPage } from './pages/public/ProcurementHubPage';
import { CheckoutPage } from './pages/public/CheckoutPage';
import { ProjectAuctionPage } from './pages/public/ProjectAuctionPage';

// Dashboard Pages
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { DashboardMarketplace } from './pages/dashboard/DashboardMarketplace';
import { FactoryRequirementForm } from './pages/dashboard/FactoryRequirementForm';
import { WalletPage } from './pages/dashboard/WalletPage';
import { BidsAndNegoPage } from './pages/dashboard/BidsAndNegoPage';
import { MyListingsPage } from './pages/dashboard/MyListingsPage';
import { CreateListingPage } from './pages/dashboard/CreateListingPage';
import { OrdersPage } from './pages/dashboard/OrdersPage';
import { OrderDetailPage } from './pages/dashboard/OrderDetailPage';
import { NegotiationsPage } from './pages/dashboard/NegotiationsPage';
import { BidsPage } from './pages/dashboard/BidsPage';
import { FinancePages } from './pages/dashboard/FinancePages';
import { CompanyProfilePage } from './pages/dashboard/CompanyProfilePage';
import { ProjectBidsHistoryPage } from './pages/dashboard/ProjectBidsHistoryPage';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminPenjualManager } from './pages/admin/AdminPenjualManager';
import { AdminPembeliManager } from './pages/admin/AdminPembeliManager';
import { AdminVerifikasiLegalitas } from './pages/admin/AdminVerifikasiLegalitas';
import { AdminTransaksiManager } from './pages/admin/AdminTransaksiManager';
import { AdminPengirimanManual } from './pages/admin/AdminPengirimanManual';
import { AdminPembayaranManager } from './pages/admin/AdminPembayaranManager';
import { AdminListingsModeration } from './pages/admin/AdminListingsModeration';
import { AdminBuyerManager } from './pages/admin/AdminBuyerManager';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminKycQueue } from './pages/admin/AdminKycQueue';
import { AdminUsersCompanies } from './pages/admin/AdminUsersCompanies';
import { AdminOrdersOps } from './pages/admin/AdminOrdersOps';
import { AdminDisputes } from './pages/admin/AdminDisputes';
import { AdminFeeConfig } from './pages/admin/AdminFeeConfig';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { AdminProjectAuctions } from './pages/admin/AdminProjectAuctions';

// Mobile bottom navigation icons
import { Home, Store, Package, MessageSquare, User, Flame, Building, LayoutDashboard } from 'lucide-react';

const AppContent: React.FC = () => {
  const { userRole, toastMessage, orders, negotiations } = useApp();
  const [currentPath, setCurrentPath] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>({});

  const activeOrdersCount = orders ? orders.filter((o) => o.status !== 'SETTLEMENT').length : 0;
  const pendingNegotiationsCount = negotiations ? negotiations.filter((n) => n.status === 'Pending' || n.status === 'Countered').length : 0;

  const navigate = (path: string, params: any = {}) => {
    const targetPath = (path === '/' || path === '') ? 'home' : path;
    setCurrentPath(targetPath);
    setPageParams(params);
    if (path === '/' || path === 'home' || targetPath === 'home') {
      try {
        window.history.pushState({}, '', '/');
      } catch {
        // Safe in iframe environments
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isDashboardRoute = currentPath.startsWith('dashboard-');
  const isAdminRoute = currentPath.startsWith('admin-');

  // Render current view
  const renderView = () => {
    switch (currentPath) {
      // Public
      case '/':
      case 'home':
        return <HomePage navigate={navigate} />;
      case 'marketplace':
      case 'auctions':
        return <MarketplacePage navigate={navigate} />;
      case 'listing-detail':
        return <ListingDetailPage id={pageParams.id || 'LIST-1001'} navigate={navigate} />;
      case 'checkout':
        return <CheckoutPage listingId={pageParams.id || pageParams.listingId} navigate={navigate} />;
      case 'auction-detail':
        return <AuctionDetailPage id={pageParams.id} navigate={navigate} />;
      case 'prices':
        return <MarketplacePage navigate={navigate} />;
      case 'reverse-bid':
        return <ReverseBidPage navigate={navigate} />;
      case 'procurement-hub':
        return <ProcurementHubPage navigate={navigate} />;
      case 'project-auctions':
      case 'project-auction':
      case 'project-auction-detail':
        return <ProjectAuctionPage navigate={navigate} selectedProjectId={pageParams.id} />;
      case 'requirement-detail':
        return <RequirementDetailPage id={pageParams.id || 'RFQ-701'} navigate={navigate} />;
      case 'how-it-works':
        return <HowItWorksPage navigate={navigate} />;
      case 'login':
        return <AuthPages mode="login" navigate={navigate} />;
      case 'register':
        return <AuthPages mode="register" navigate={navigate} />;
      case 'verification':
        return <AuthPages mode="verification" navigate={navigate} />;

      // Client Dashboard
      case 'dashboard-overview':
        return <DashboardOverview navigate={navigate} />;
      case 'dashboard-marketplace':
        return <DashboardMarketplace navigate={navigate} />;
      case 'dashboard-create-rfq':
        return <FactoryRequirementForm navigate={navigate} />;
      case 'dashboard-wallet':
        return <WalletPage navigate={navigate} />;
      case 'dashboard-bids-nego':
        return <BidsAndNegoPage navigate={navigate} />;
      case 'dashboard-project-bids':
      case 'dashboard-project-auctions':
        return <ProjectBidsHistoryPage navigate={navigate} />;
      case 'dashboard-checkout':
        return <CheckoutPage listingId={pageParams.id || pageParams.listingId} navigate={navigate} />;
      case 'dashboard-procurement-hub':
      case 'dashboard-procurement':
        return <ProcurementHubPage navigate={navigate} />;
      case 'dashboard-listings':
        return <MyListingsPage navigate={navigate} />;
      case 'dashboard-create-listing':
        return <CreateListingPage navigate={navigate} />;
      case 'dashboard-orders':
        return <OrdersPage navigate={navigate} />;
      case 'dashboard-order-detail':
        return <OrderDetailPage id={pageParams.id} navigate={navigate} />;
      case 'dashboard-negotiations':
        return <NegotiationsPage navigate={navigate} />;
      case 'dashboard-bids':
        return <BidsPage navigate={navigate} />;
      case 'dashboard-payments':
        return <FinancePages view="payments" navigate={navigate} />;
      case 'dashboard-settlements':
        return <FinancePages view="settlements" navigate={navigate} />;
      case 'dashboard-disputes':
        return <FinancePages view="disputes" navigate={navigate} />;
      case 'dashboard-company':
      case 'dashboard-settings':
        return <CompanyProfilePage navigate={navigate} />;
      case 'dashboard-verification':
        return <AuthPages mode="verification" navigate={navigate} />;

      // Superadmin Console Routes (CRUD Penjual, Pembeli, Verifikasi, Transaksi, Pengiriman Manual, Pembayaran, Laporan)
      case 'admin-overview':
        return <AdminOverview navigate={navigate} />;
      case 'admin-project-auctions':
      case 'admin-lelang-proyek':
        return <AdminProjectAuctions />;
      case 'admin-penjual':
      case 'admin-users':
      case 'admin-pelanggan':
      case 'admin-companies':
        return <AdminPenjualManager />;
      case 'admin-pembeli':
      case 'admin-buyer':
        return <AdminPembeliManager />;
      case 'admin-verifikasi':
      case 'admin-kyc':
        return <AdminVerifikasiLegalitas />;
      case 'admin-transaksi':
      case 'admin-orders':
      case 'admin-transaction':
      case 'admin-transactions':
        return <AdminTransaksiManager />;
      case 'admin-pengiriman':
        return <AdminPengirimanManual />;
      case 'admin-pembayaran':
      case 'admin-settlements':
      case 'admin-payments':
        return <AdminPembayaranManager />;
      case 'admin-laporan':
      case 'admin-reports':
        return <AdminReports navigate={navigate} />;
      case 'admin-listings':
      case 'admin-produk':
        return <AdminListingsModeration navigate={navigate} />;
      case 'admin-disputes':
        return <AdminDisputes navigate={navigate} />;
      case 'admin-fees':
        return <AdminFeeConfig navigate={navigate} />;
      case 'admin-audit-logs':
        return <AdminAuditLogs navigate={navigate} />;

      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Platform-wide Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Anti-Off-Platform Alert Modal */}
      <OffPlatformWarningModal />

      {/* Top Navbar for Public and Client */}
      {!isAdminRoute && <Navbar currentPath={currentPath} navigate={navigate} />}

      {/* Main Content Area */}
      <div className="flex-1 pb-16 lg:pb-0">
        {isAdminRoute ? (
          <AdminLayout currentPath={currentPath} navigate={navigate}>
            {renderView()}
          </AdminLayout>
        ) : isDashboardRoute ? (
          <DashboardLayout currentPath={currentPath} navigate={navigate}>
            {renderView()}
          </DashboardLayout>
        ) : (
          renderView()
        )}
      </div>

      {/* Public Footer */}
      {!isAdminRoute && !isDashboardRoute && <Footer navigate={navigate} />}

      {/* Mobile Bottom Navigation (Always accessible on mobile for Public and Customer) */}
      {!isAdminRoute && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-3px_12px_rgba(0,0,0,0.08)] flex items-center justify-around h-15 px-1 pb-[env(safe-area-inset-bottom)]">
          {userRole === 'public' ? (
            <>
              <button
                onClick={() => navigate('home')}
                className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                  currentPath === 'home' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                <Home className={`w-5 h-5 ${currentPath === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[11px] leading-tight">Beranda</span>
              </button>

              <button
                onClick={() => navigate('marketplace')}
                className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                  currentPath === 'marketplace' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                <Store className={`w-5 h-5 ${currentPath === 'marketplace' ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[11px] leading-tight">Beli Scrap</span>
              </button>

              <button
                onClick={() => navigate('auctions')}
                className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                  currentPath === 'auctions' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                <Flame className={`w-5 h-5 ${currentPath === 'auctions' ? 'text-amber-500 stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[11px] leading-tight">Lelang</span>
              </button>

              <button
                onClick={() => navigate('reverse-bid')}
                className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                  currentPath === 'reverse-bid' || currentPath === 'procurement-hub' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                <Building className={`w-5 h-5 ${currentPath === 'reverse-bid' || currentPath === 'procurement-hub' ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[11px] leading-tight">Tender</span>
              </button>

              <button
                onClick={() => navigate('register')}
                className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                  currentPath === 'login' || currentPath === 'register' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                <User className={`w-5 h-5 ${currentPath === 'login' || currentPath === 'register' ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[11px] leading-tight">Daftar</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('home')}
                className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                  currentPath === 'home' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                <Home className={`w-5 h-5 ${currentPath === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[11px] leading-tight">Beranda</span>
              </button>

              <button
                onClick={() => navigate('dashboard-marketplace')}
                className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                  currentPath === 'dashboard-marketplace' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                <Store className={`w-5 h-5 ${currentPath === 'dashboard-marketplace' ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[11px] leading-tight">Beli Scrap</span>
              </button>

              <button
                onClick={() => navigate('dashboard-orders')}
                className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition-colors relative ${
                  currentPath === 'dashboard-orders' || currentPath === 'dashboard-order-detail' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="relative">
                  <Package className={`w-5 h-5 ${currentPath.includes('order') ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  {activeOrdersCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {activeOrdersCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] leading-tight">Pesanan</span>
              </button>

              <button
                onClick={() => navigate('dashboard-bids-nego')}
                className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition-colors relative ${
                  currentPath === 'dashboard-bids-nego' || currentPath === 'dashboard-negotiations' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="relative">
                  <MessageSquare className={`w-5 h-5 ${currentPath.includes('nego') ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  {pendingNegotiationsCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                      {pendingNegotiationsCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] leading-tight">Negosiasi</span>
              </button>

              <button
                onClick={() => navigate('dashboard-overview')}
                className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                  currentPath === 'dashboard-overview' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                <LayoutDashboard className={`w-5 h-5 ${currentPath === 'dashboard-overview' ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[11px] leading-tight">Dashboard</span>
              </button>
            </>
          )}
        </nav>
      )}
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
