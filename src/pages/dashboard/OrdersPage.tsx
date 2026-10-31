import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { OrderStatus } from '../../types';
import {
  Package,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Scale,
  Calendar,
  ChevronRight
} from 'lucide-react';

interface OrdersPageProps {
  navigate: (path: string, params?: any) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ navigate }) => {
  const { orders, formatPrice, currentCompany } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'placed' | 'received'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase()) && !o.productTitle.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Pesanan & Transaksi Dagang</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kontrak jual beli B2B aktif dan arsip, manifes pengangkutan jembatan timbang, serta pencairan escrow
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">Total Nilai Kontrak:</span>
          <span className="font-mono font-bold text-slate-900 text-sm">
            {formatPrice(orders.reduce((acc, curr) => acc + curr.totalOriginalValue, 0))}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari No. Pesanan atau Material..."
            className="px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 font-medium"
          >
            <option value="All">Semua Status</option>
            <option value="PAYMENT_PENDING">Menunggu Pembayaran</option>
            <option value="PAID">Terbayar (Escrow Ditahan)</option>
            <option value="PICKUP_SCHEDULED">Jadwal Muat Terbit</option>
            <option value="PICKED_UP">Sedang Diangkut</option>
            <option value="WEIGHING">Penimbangan (Jembatan Timbang)</option>
            <option value="QC">Inspeksi Mutu QC</option>
            <option value="SETTLEMENT">Rekonsiliasi Pembayaran</option>
            <option value="COMPLETED">Transaksi Selesai</option>
            <option value="DISPUTED">Dalam Sengketa</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Menampilkan {filteredOrders.length} pesanan
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-3">Nomor Pesanan</th>
              <th className="py-3 px-3">Lot Material</th>
              <th className="py-3 px-3">Pihak Lawan Transaksi</th>
              <th className="py-3 px-3">Kuantitas</th>
              <th className="py-3 px-3 text-right">Nilai Disepakati</th>
              <th className="py-3 px-3">Status Pipeline</th>
              <th className="py-3 px-3">Pembayaran</th>
              <th className="py-3 px-3">Tanggal</th>
              <th className="py-3 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                  {o.orderNumber}
                </td>
                <td className="py-3.5 px-3">
                  <div
                    onClick={() => navigate('dashboard-order-detail', { id: o.id })}
                    className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer truncate max-w-[180px]"
                  >
                    {o.productTitle}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">Ketentuan {o.incoterm}</div>
                </td>
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                      {o.sellerCompany === currentCompany.name ? o.buyerCompany : o.sellerCompany}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      o.sellerCompany === currentCompany.name ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {o.sellerCompany === currentCompany.name ? 'Jual' : 'Beli'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {o.sellerCompany === currentCompany.name ? `Pembeli · ${o.buyerCountry}` : `Penjual · ${o.sellerCountry}`}
                  </div>
                </td>
                <td className="py-3.5 px-3 font-mono font-semibold tabular-nums text-slate-800">
                  {o.quantity} {o.unit}
                </td>
                <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                  {formatPrice(o.totalOriginalValue)}
                </td>
                <td className="py-3.5 px-3">
                  <StatusBadge status={o.status} type="order" />
                </td>
                <td className="py-3.5 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${o.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-800' : o.paymentStatus === 'HELD' ? 'bg-blue-50 text-blue-800' : 'bg-amber-50 text-amber-800'}`}>
                    {o.paymentStatus === 'PAID' ? 'TERBAYAR (ESCROW)' : o.paymentStatus === 'HELD' ? 'ESCROW DITAHAN' : 'MENUNGGU PEMBAYARAN'}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                  {o.createdAt.split(' ')[0]}
                </td>
                <td className="py-3.5 px-3 text-right">
                  <button
                    onClick={() => navigate('dashboard-order-detail', { id: o.id })}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
                  >
                    Kelola
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
