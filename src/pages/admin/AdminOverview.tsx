import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  TrendingUp,
  DollarSign,
  Users,
  Building2,
  Store,
  Package,
  Scale,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileText,
  Truck,
  Landmark,
  Crown
} from 'lucide-react';

interface AdminOverviewProps {
  navigate: (path: string, params?: any) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ navigate }) => {
  const { listings, orders, disputes, formatPrice } = useApp();

  // Volume in Rupiah
  const totalGMVRupiah = 48500000000; // Rp 48,5 Miliar
  const platformFeeRevenueRupiah = Math.round(totalGMVRupiah * 0.012); // Rp 582 Juta

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Dashboard Ringkasan Operasional Admin
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengawasan real-time bursa bahan baku pabrik, moderasi listing, verifikasi pembeli & penyelesaian timbangan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('admin-buyer')}
            className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Verifikasi Buyer (2 Baru)</span>
          </button>
          <button
            onClick={() => navigate('admin-laporan')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Lihat Laporan</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (All in Rupiah) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>Total Nilai Transaksi (GMV)</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black font-mono text-emerald-700 mt-2">
            Rp 48,5 Miliar
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Total kontrak timbang terima</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>Pendapatan Fee Platform</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black font-mono text-slate-900 mt-2">
            Rp 582,0 Juta
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-semibold">Rata-rata fee 1.2% per transaksi</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>Pabrik & Supplier Aktif</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-md">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black font-mono text-slate-900 mt-2">
            184 Pabrik & Depo
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cilegon, Karawang, Surabaya & Medan</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>Pesanan & Timbangan Berjalan</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-md">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black font-mono text-purple-700 mt-2">
            {orders.length} Transaksi
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Dalam proses logistik & jembatan timbang</div>
        </div>
      </div>

      {/* Core Superadmin Feature Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <button
          onClick={() => navigate('admin-penjual')}
          className="p-3.5 bg-white border border-slate-200 hover:border-purple-500 rounded-xl text-left transition-all shadow-2xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-purple-50 flex items-center justify-center text-slate-700 group-hover:text-purple-700 mb-2 transition-colors">
            <Store className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 leading-tight">CRUD Penjual</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Depo & pengepul</div>
        </button>

        <button
          onClick={() => navigate('admin-pembeli')}
          className="p-3.5 bg-white border border-slate-200 hover:border-purple-500 rounded-xl text-left transition-all shadow-2xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-purple-50 flex items-center justify-center text-slate-700 group-hover:text-purple-700 mb-2 transition-colors">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 leading-tight">CRUD Pembeli</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Pabrik & smelter</div>
        </button>

        <button
          onClick={() => navigate('admin-verifikasi')}
          className="p-3.5 bg-white border border-slate-200 hover:border-purple-500 rounded-xl text-left transition-all shadow-2xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-purple-50 flex items-center justify-center text-slate-700 group-hover:text-purple-700 mb-2 transition-colors">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xs font-bold text-slate-900 leading-tight">Verifikasi Legalitas</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Cek NIB, NPWP & IUI</div>
        </button>

        <button
          onClick={() => navigate('admin-transaksi')}
          className="p-3.5 bg-white border border-slate-200 hover:border-purple-500 rounded-xl text-left transition-all shadow-2xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-purple-50 flex items-center justify-center text-slate-700 group-hover:text-purple-700 mb-2 transition-colors">
            <Package className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 leading-tight">Status Transaksi</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Siklus PO & bursa</div>
        </button>

        <button
          onClick={() => navigate('admin-pengiriman')}
          className="p-3.5 bg-white border border-slate-200 hover:border-purple-500 rounded-xl text-left transition-all shadow-2xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-purple-50 flex items-center justify-center text-slate-700 group-hover:text-purple-700 mb-2 transition-colors">
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xs font-bold text-slate-900 leading-tight">Pengiriman Manual</div>
          <div className="text-[10px] text-slate-500 mt-0.5">DO & timbangan netto</div>
        </button>

        <button
          onClick={() => navigate('admin-pembayaran')}
          className="p-3.5 bg-white border border-slate-200 hover:border-purple-500 rounded-xl text-left transition-all shadow-2xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-purple-50 flex items-center justify-center text-slate-700 group-hover:text-purple-700 mb-2 transition-colors">
            <Landmark className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xs font-bold text-slate-900 leading-tight">Pembayaran Escrow</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Top-up & release dana</div>
        </button>

        <button
          onClick={() => navigate('admin-laporan')}
          className="p-3.5 bg-white border border-slate-200 hover:border-purple-500 rounded-xl text-left transition-all shadow-2xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-purple-50 flex items-center justify-center text-slate-700 group-hover:text-purple-700 mb-2 transition-colors">
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 leading-tight">Laporan Keuangan</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Rekapitulasi tonase</div>
        </button>
      </div>

      {/* Recent Orders in Light Theme */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Transaksi & Pengiriman Terbaru</h2>
            <p className="text-[11px] text-slate-500">Monitoring status escrow dan timbang terima muatan</p>
          </div>
          <button
            onClick={() => navigate('admin-orders')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Buka Semua Transaksi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3">No. Order</th>
                <th className="p-3">Material / Produk</th>
                <th className="p-3">Pembeli (Pabrik)</th>
                <th className="p-3">Penjual (Depo)</th>
                <th className="p-3">Tonase</th>
                <th className="p-3">Nilai Transaksi (Rp)</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                  <td className="p-3 font-semibold text-slate-900">{o.productTitle}</td>
                  <td className="p-3">{o.buyerCompany}</td>
                  <td className="p-3">{o.sellerCompany}</td>
                  <td className="p-3 font-mono">{o.quantity} {o.unit}</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">
                    {formatPrice(o.totalOriginalValue)}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => navigate('admin-orders')}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                    >
                      Periksa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
