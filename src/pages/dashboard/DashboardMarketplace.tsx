import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Search, Filter, ShoppingCart, MapPin, ShieldCheck, Eye, ArrowRight, Layers } from 'lucide-react';

interface DashboardMarketplaceProps {
  navigate: (path: string, params?: any) => void;
}

export const DashboardMarketplace: React.FC<DashboardMarketplaceProps> = ({ navigate }) => {
  const { listings, formatPrice, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filtered = listings.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.seller.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'all' || item.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchSearch && matchCategory;
  });

  const categories = [
    { id: 'all', label: 'Semua Kategori' },
    { id: 'ferrous', label: 'Besi & Baja' },
    { id: 'copper', label: 'Tembaga' },
    { id: 'aluminum', label: 'Aluminium' },
    { id: 'plastics', label: 'Plastik Daur Ulang' },
    { id: 'machinery', label: 'Mesin Industri' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Beli Scrap
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cari stok material pabrik, scrap industri terverifikasi, dan lakukan pemesanan langsung dengan jaminan Escrow Scrava
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
            Ready Stok: <strong>{filtered.length} Lot Siap Angkut</strong>
          </span>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari besi tua HMS, tembaga millberry, aluminium, mesin CNC, dsb..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-600 bg-slate-50/50 font-medium"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Material Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Product Photo */}
              <div className="aspect-16/10 relative overflow-hidden bg-slate-100">
                <img
                  src={item.photos[0]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white uppercase">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                    {item.condition}
                  </span>
                </div>
                <div className="absolute top-2.5 right-2.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-900 shadow-xs">
                  {item.incoterm}
                </div>
              </div>

              {/* Product Details */}
              <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                  {item.title}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{item.location.city}, {item.location.country}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                  <span>Tersedia: <strong>{item.quantity} {item.unit}</strong></span>
                  <span className="text-emerald-700 font-semibold">{item.seller.companyName}</span>
                </div>

                {/* Price Display (Rupiah) */}
                <div className="pt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Harga Satuan (Rupiah):</div>
                  <div className="text-base font-black font-mono text-emerald-800 mt-0.5">
                    {formatPrice(item.pricePerUnit, item.unit)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Total Lot: <strong>{formatPrice(item.totalPrice)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="p-4 pt-0 grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate('listing-detail', { id: item.id })}
                className="py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
              >
                Lihat Spek
              </button>

              <button
                onClick={() => navigate('dashboard-checkout', { id: item.id })}
                className="py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors text-center flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Beli Sekarang</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
