import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Store,
  PlusCircle,
  Eye,
  Edit,
  Pause,
  Play,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles
} from 'lucide-react';

interface MyListingsProps {
  navigate: (path: string, params?: any) => void;
}

export const MyListingsPage: React.FC<MyListingsProps> = ({ navigate }) => {
  const { listings, updateListingStatus, formatPrice, showToast } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const filtered = listings.filter((l) => {
    if (filterStatus !== 'All' && l.status !== filterStatus) return false;
    if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Daftar Penawaran Saya (Katalog Depo)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola inventaris stok aktif, lelang live, penawaran harga, dan negosiasi pabrik di bursa
          </p>
        </div>

        <button
          onClick={() => navigate('dashboard-create-listing')}
          className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-xs flex items-center gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Pasang Listing Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan judul lot..."
            className="px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 font-medium"
          >
            <option value="All">Semua Status</option>
            <option value="Published">Tayang Aktif</option>
            <option value="Pending Review">Menunggu Verifikasi</option>
            <option value="Paused">Ditangguhkan</option>
            <option value="Sold">Terjual</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          {filtered.length} listing terdaftar
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-3">ID Listing</th>
              <th className="py-3 px-3">Lot Material</th>
              <th className="py-3 px-3">Kategori</th>
              <th className="py-3 px-3">Volume</th>
              <th className="py-3 px-3 text-right">Harga / Satuan</th>
              <th className="py-3 px-3">Skema</th>
              <th className="py-3 px-3 text-center">Dilihat</th>
              <th className="py-3 px-3 text-center">Tawaran</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-3 font-mono font-semibold text-slate-900">{item.id}</td>
                <td className="py-3 px-3">
                  <div
                    onClick={() => navigate('listing-detail', { id: item.id })}
                    className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer truncate max-w-[200px]"
                  >
                    {item.title}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {item.isPaidPromotion ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                        Berbayar (Prioritas)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        Gratis
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">· {item.incoterm}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-slate-600">{item.category}</td>
                <td className="py-3 px-3 font-mono tabular-nums font-semibold text-slate-900">
                  {item.quantity} {item.unit}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                  {item.listingType === 'FREE_PICKUP' ? 'GRATIS' : formatPrice(item.pricePerUnit)}
                </td>
                <td className="py-3 px-3">
                  <StatusBadge status={item.listingType} />
                </td>
                <td className="py-3 px-3 text-center font-mono text-slate-600">
                  {item.viewsCount || 42}
                </td>
                <td className="py-3 px-3 text-center font-mono text-slate-900 font-semibold">
                  {item.bidCount || (item.listingType === 'AUCTION' ? 6 : 2)}
                </td>
                <td className="py-3 px-3">
                  <StatusBadge status={item.status} type="listing" />
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => navigate('listing-detail', { id: item.id })}
                      className="p-1 text-slate-400 hover:text-slate-800"
                      title="Lihat Halaman Publik"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {item.status === 'Published' ? (
                      <button
                        onClick={() => updateListingStatus(item.id, 'Paused')}
                        className="p-1 text-slate-400 hover:text-amber-600"
                        title="Tangguhkan Penawaran"
                      >
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => updateListingStatus(item.id, 'Published')}
                        className="p-1 text-slate-400 hover:text-emerald-600"
                        title="Tayangkan Kembali"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
