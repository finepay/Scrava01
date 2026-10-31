import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Store, Eye, CheckCircle2, XCircle, Pause, Play, Search, Filter } from 'lucide-react';

interface AdminListingsProps {
  navigate: (path: string, params?: any) => void;
}

export const AdminListingsModeration: React.FC<AdminListingsProps> = ({ navigate }) => {
  const { listings, updateListingStatus, formatPrice, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = listings.filter((l) => {
    const matchSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) || l.seller.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'all' || l.category.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Manage Produk & Moderasi Listing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit spesifikasi material scrap, kebersihan, sertifikat uji bebas radiasi, dan kelayakan tayang
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg">
            Total Produk: <strong>{listings.length} Lot Material</strong>
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari judul material atau nama penjual/depo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-600 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-600 shrink-0">Kategori:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-hidden focus:border-emerald-600 font-medium"
          >
            <option value="all">Semua Kategori</option>
            <option value="ferrous">Besi & Baja</option>
            <option value="copper">Tembaga</option>
            <option value="aluminum">Aluminium</option>
            <option value="plastic">Plastik Daur Ulang</option>
            <option value="machinery">Mesin Industri</option>
          </select>
        </div>
      </div>

      {/* Table (Light Theme) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">ID Lot</th>
                <th className="py-3 px-4">Foto & Nama Material</th>
                <th className="py-3 px-4">Perusahaan Penjual</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Stok / Tonase</th>
                <th className="py-3 px-4 text-right">Harga Satuan (Rp)</th>
                <th className="py-3 px-4">Status Tayang</th>
                <th className="py-3 px-4 text-right">Moderasi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">{item.id}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.photos[0]}
                        alt={item.title}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                      <div className="truncate max-w-xs">
                        <div className="font-bold text-slate-900 truncate">{item.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Incoterm: {item.incoterm} · {item.condition}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{item.seller.companyName}</td>
                  <td className="py-3 px-4 text-slate-600">{item.category}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">{item.quantity} {item.unit}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                    {formatPrice(item.pricePerUnit, item.unit)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'Published'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {item.status === 'Published' ? 'Tayang Aktif' : item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => navigate('listing-detail', { id: item.id })}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] transition-colors"
                      >
                        Lihat
                      </button>
                      {item.status === 'Published' ? (
                        <button
                          onClick={() => {
                            updateListingStatus(item.id, 'Paused');
                            showToast(`Listing ${item.id} ditahan sementara oleh Admin.`);
                          }}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded text-[11px] transition-colors"
                          title="Tahan Listing"
                        >
                          <Pause className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            updateListingStatus(item.id, 'Published');
                            showToast(`Listing ${item.id} telah disetujui & dipublikasikan.`);
                          }}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded text-[11px] transition-colors"
                          title="Setujui Listing"
                        >
                          <Play className="w-3 h-3" />
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
    </div>
  );
};
