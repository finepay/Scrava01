import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Package,
  TrendingUp,
  DollarSign,
  Gavel,
  MessageSquare,
  Scale,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  ChevronRight,
  ExternalLink,
  PlusCircle
} from 'lucide-react';

interface DashboardOverviewProps {
  navigate: (path: string, params?: any) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ navigate }) => {
  const { currentCompany, currentUser, orders, negotiations, listings, formatPrice, showToast } = useApp();

  const totalValue = orders.reduce((acc, curr) => acc + curr.totalOriginalValue, 0);
  const activeOrders = orders.filter((o) => o.status !== 'COMPLETED');
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');

  return (
    <div className="space-y-6 font-sans">
      {/* Welcome Banner for Customer (Pabrik & Pengepul) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-6 shadow-sm border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
              Akun Customer Scrava
            </span>
            <span className="text-xs text-slate-300">
              {currentUser?.businessType || currentCompany.businessType}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Selamat Datang, {currentCompany.name}
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Satu portal terpadu untuk menjual pasokan scrap, membeli bahan baku industri dengan jaminan Rekber Escrow & Timbangan Digital, serta mengikuti lelang proyek terpercaya.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('dashboard-create-listing')}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Pasang Iklan / Lelang</span>
          </button>
          <button
            onClick={() => navigate('dashboard-project-bids')}
            className="px-3.5 py-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Gavel className="w-3.5 h-3.5 text-blue-400" />
            <span>Lelang Proyek</span>
          </button>
          <button
            onClick={() => navigate('dashboard-wallet')}
            className="px-3.5 py-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dompet & Saldo</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 flex items-center justify-between font-medium">
            <span>Total Nilai Transaksi</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900 mt-2 tabular-nums">
            {formatPrice(totalValue)}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>100% Rekonsiliasi Escrow</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 flex items-center justify-between font-medium">
            <span>Pesanan Sedang Berjalan</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900 mt-2 tabular-nums">
            {activeOrders.length} Pesanan
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Proses angkutan / jembatan timbang
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 flex items-center justify-between font-medium">
            <span>Negosiasi Aktif</span>
            <MessageSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900 mt-2 tabular-nums">
            {negotiations.length} Room Nego
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Tawar-menawar harga langsung
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 flex items-center justify-between font-medium">
            <span>Transaksi Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900 mt-2 tabular-nums">
            {completedOrders.length + 14} Transaksi
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-semibold">
            100% Selesai Timbang Terima
          </div>
        </div>
      </div>

      {/* Active Orders Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Transaksi Berjalan & Pelacakan Logistik
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pelacakan status pembayaran escrow, surat jalan angkutan, penimbangan jembatan, dan rekonsiliasi pencairan
            </p>
          </div>
          <button
            onClick={() => navigate('dashboard-orders')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Lihat Semua Pesanan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">No. Order / Kontrak</th>
                <th className="py-2.5 px-3">Lot Material</th>
                <th className="py-2.5 px-3">Mitra Transaksi</th>
                <th className="py-2.5 px-3">Volume</th>
                <th className="py-2.5 px-3 text-right">Nilai Kontrak</th>
                <th className="py-2.5 px-3">Status Saat Ini</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    {o.orderNumber}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 truncate max-w-[200px]">{o.productTitle}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Ketentuan: {o.incoterm}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-800 font-semibold truncate max-w-[150px]">
                        {o.sellerCompany === currentCompany.name ? o.buyerCompany : o.sellerCompany}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        o.sellerCompany === currentCompany.name ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {o.sellerCompany === currentCompany.name ? 'Jual' : 'Beli'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {o.sellerCompany === currentCompany.name ? o.buyerCountry : o.sellerCountry}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono tabular-nums text-slate-800 font-bold">
                    {o.quantity} {o.unit}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 tabular-nums">
                    {formatPrice(o.totalOriginalValue)}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={o.status} type="order" />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => navigate('dashboard-order-detail', { id: o.id })}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                    >
                      Buka Timeline
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two-Column Lower Grid: Negotiations & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Negotiations */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Negosiasi Terkini
            </h3>
            <button
              onClick={() => navigate('dashboard-negotiations')}
              className="text-xs text-emerald-700 font-semibold hover:underline"
            >
              Buka Ruang Obrolan →
            </button>
          </div>

          <div className="space-y-3">
            {negotiations.map((n) => (
              <div
                key={n.id}
                onClick={() => navigate('dashboard-negotiations')}
                className="p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 truncate max-w-xs">{n.productTitle}</div>
                  <div className="text-slate-500 mt-0.5">
                    Rekan: <strong>{n.sellerCompany}</strong> · {n.messages.length} pesan
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-slate-900 tabular-nums">
                    {formatPrice(n.currentOfferPrice, n.unit)}
                  </div>
                  <StatusBadge status={n.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Status Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Status Kepatuhan & Legalitas Usaha
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Akses Penuh Tier 1
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Entitas bisnis Anda <strong>{currentCompany.name}</strong> memegang sertifikasi Tier 1 aktif. Anda memiliki otorisasi penuh untuk transaksi kuota besar, rekonsiliasi timbangan otomatis, dan pencairan rekening bersama.
            </p>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">NPWP / Tax ID:</span>
                <span className="text-slate-800 font-bold">{currentCompany.taxId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rekening Kustodi:</span>
                <span className="text-slate-800 font-bold">{currentCompany.bankAccount}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={() => navigate('dashboard-verification')}
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>Lihat Dokumen Legalitas (KYC)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
