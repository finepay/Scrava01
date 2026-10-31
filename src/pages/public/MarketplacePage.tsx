import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, COUNTRIES } from '../../data/mockData';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw,
  CheckCircle2,
  MapPin,
  Clock,
  ChevronRight,
  ShieldCheck,
  Grid,
  List as ListIcon,
  X,
  Sparkles
} from 'lucide-react';
import { ListingType, MaterialCondition, IncotermType } from '../../types';

interface MarketplacePageProps {
  navigate: (path: string, params?: any) => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({ navigate }) => {
  const { listings, formatPrice, searchQuery, setSearchQuery } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [selectedIncoterm, setSelectedIncoterm] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Filter & sort logic
  const filteredListings = useMemo(() => {
    return listings
      .filter((item) => {
        // Search query
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchLoc = item.location.country.toLowerCase().includes(q) || item.location.city.toLowerCase().includes(q);
          if (!matchTitle && !matchCat && !matchLoc) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }

        // Type filter
        if (selectedType !== 'All' && item.listingType !== selectedType) {
          return false;
        }

        // Condition filter
        if (selectedCondition !== 'All' && item.condition !== selectedCondition) {
          return false;
        }

        // Incoterm filter
        if (selectedIncoterm !== 'All' && item.incoterm !== selectedIncoterm) {
          return false;
        }

        // Country filter
        if (selectedCountry !== 'All' && item.location.country !== selectedCountry) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'price_asc') {
          return a.pricePerUnit - b.pricePerUnit;
        }
        if (sortBy === 'price_desc') {
          return b.pricePerUnit - a.pricePerUnit;
        }
        if (sortBy === 'ending_soon') {
          if (a.listingType === 'AUCTION' && b.listingType !== 'AUCTION') return -1;
          if (b.listingType === 'AUCTION' && a.listingType !== 'AUCTION') return 1;
          return (a.bidCount || 0) - (b.bidCount || 0);
        }
        return 0;
      });
  }, [listings, searchQuery, selectedCategory, selectedType, selectedCondition, selectedIncoterm, selectedCountry, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedType('All');
    setSelectedCondition('All');
    setSelectedIncoterm('All');
    setSelectedCountry('All');
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Header & Breadcrumb */}
      <div className="mb-6">
        <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
          <button onClick={() => navigate('home')} className="hover:text-slate-800">Beranda</button>
          <span>/</span>
          <span className="text-slate-800 font-medium">Katalog Bahan Baku & Scrap Industri</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Katalog Bahan Baku & Scrap</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan {filteredListings.length} lot material terverifikasi dari depo resmi se-Indonesia
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('dashboard-create-listing')}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
            >
              + Pasang Iklan Stok
            </button>
          </div>
        </div>
      </div>

      {/* Main Search & Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari material scrap, grade, atau kota gudang..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg border border-slate-200"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-hidden"
            >
              <option value="newest">Listing Terbaru</option>
              <option value="price_asc">Harga: Rendah ke Tinggi</option>
              <option value="price_desc">Harga: Tinggi ke Rendah</option>
              <option value="ending_soon">Lelang Segera Berakhir</option>
            </select>
          </div>

          {/* Grid / List switch */}
          <div className="hidden sm:flex items-center border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
              title="Tampilan Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 ${viewMode === 'list' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
              title="Tampilan Daftar"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Desktop Sidebar Filters */}
        <aside className={`md:block ${mobileFilterOpen ? 'block' : 'hidden'} md:col-span-1 space-y-6 bg-white border border-slate-200 rounded-xl p-5 h-fit`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pilihan Filter</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              Atur Ulang
            </button>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Kategori Bahan</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-700 focus:outline-hidden"
            >
              <option value="All">Semua Kategori ({CATEGORIES.length})</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Listing Type */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Tipe Penjualan</label>
            <div className="space-y-1.5 text-xs text-slate-600">
              {[
                { id: 'All', label: 'Semua Tipe' },
                { id: 'FIXED_PRICE', label: 'Harga Tetap (Beli Langsung)' },
                { id: 'AUCTION', label: 'Lelang Terbuka' },
                { id: 'FREE_PICKUP', label: 'Ambil Gratis (Limbah)' },
              ].map((t) => (
                <label key={t.id} className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                  <input
                    type="radio"
                    name="listingType"
                    checked={selectedType === t.id}
                    onChange={() => setSelectedType(t.id)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Material Condition */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Kondisi Material</label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-700 focus:outline-hidden"
            >
              <option value="All">Semua Kondisi</option>
              <option value="Clean">Bersih & Tersortir</option>
              <option value="Processed">Sudah Diproses (Press/Potong)</option>
              <option value="Unprocessed">Belum Diproses (Mentah)</option>
              <option value="Contaminated">Ada Kontaminasi / Campuran</option>
              <option value="Mixed">Campuran Pelbagai Grade</option>
            </select>
          </div>

          {/* Incoterm */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Syarat Pengiriman (Incoterm)</label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {['All', 'EXW', 'FOB', 'DDP', 'CIF'].map((inco) => (
                <button
                  key={inco}
                  onClick={() => setSelectedIncoterm(inco)}
                  className={`py-1.5 px-2 rounded-lg border text-center font-mono ${
                    selectedIncoterm === inco
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {inco === 'All' ? 'Semua' : inco}
                </button>
              ))}
            </div>
          </div>

          {/* Country / Region */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Wilayah / Asal</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-700 focus:outline-hidden"
            >
              <option value="All">Semua Wilayah</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* Listings Result View */}
        <main className="md:col-span-3">
          {filteredListings.length === 0 ? (
            /* EMPTY STATE */
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Tidak ada listing aktif yang cocok</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Coba atur ulang filter pencarian atau buka kebutuhan pengadaan pabrik agar depo scrap dapat mengajukan pasokan.
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Hapus Filter
                </button>
                <button
                  onClick={() => navigate('reverse-bid')}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                >
                  Buat Kebutuhan Pabrik (RFQ)
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredListings.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl overflow-hidden flex flex-col justify-between transition-all group ${
                    item.isPaidPromotion
                      ? 'border-2 border-amber-400 ring-2 ring-amber-300/40 shadow-md'
                      : 'border border-slate-200 hover:border-emerald-500 hover:shadow-md'
                  }`}
                >
                  {/* Photo frame */}
                  <div className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => navigate('listing-detail', { id: item.id })}>
                    <img
                      src={item.photos[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                      {item.isPaidPromotion && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 shadow-xs flex items-center gap-1 border border-amber-300">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>PRIORITAS</span>
                        </span>
                      )}
                      <StatusBadge status={item.listingType} />
                    </div>
                    <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                      {item.incoterm}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] text-slate-500 mb-1 flex items-center justify-between">
                        <span className="font-semibold text-emerald-700">{item.category}</span>
                        <span className="font-medium text-slate-600">{item.condition}</span>
                      </div>

                      <h3
                        onClick={() => navigate('listing-detail', { id: item.id })}
                        className="text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-2 cursor-pointer leading-snug"
                      >
                        {item.title}
                      </h3>

                      <div className="mt-3 text-xs text-slate-500 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Tonase Tersedia:</span>
                          <span className="font-mono font-bold text-slate-900 tabular-nums">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>Lokasi:</span>
                          </span>
                          <span className="text-slate-800 truncate max-w-[130px]">
                            {item.location.city}, {item.location.country}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="flex items-center gap-1 text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="truncate max-w-[130px] font-medium text-slate-700">{item.seller.companyName}</span>
                          </span>
                          <span className="text-[11px] font-mono font-bold text-amber-600">★ {item.seller.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-baseline justify-between mb-3">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold">
                            {item.listingType === 'AUCTION' ? 'Tawaran Tertinggi' : 'Harga Satuan'}
                          </div>
                          <div className="text-base font-black text-slate-900 font-mono tabular-nums">
                            {item.listingType === 'AUCTION'
                              ? formatPrice(item.currentBid || item.minAskingPrice || 0, item.unit)
                              : formatPrice(item.pricePerUnit, item.unit)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold">
                            {item.listingType === 'AUCTION' ? 'Jumlah Bid' : 'Nilai Lot'}
                          </div>
                          <div className="text-xs font-bold text-slate-700 font-mono tabular-nums">
                            {item.listingType === 'AUCTION' ? `${item.bidCount} tawaran` : formatPrice(item.totalPrice)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => navigate(item.listingType === 'AUCTION' ? 'auction-detail' : 'listing-detail', { id: item.id })}
                          className="w-full py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-center transition-colors"
                        >
                          Lihat Detail
                        </button>
                        <button
                          onClick={() => navigate(item.listingType === 'AUCTION' ? 'auction-detail' : 'listing-detail', { id: item.id })}
                          className={`w-full py-2 text-xs font-bold text-white rounded-lg text-center transition-colors shadow-2xs ${
                            item.listingType === 'AUCTION'
                              ? 'bg-amber-600 hover:bg-amber-700'
                              : 'bg-emerald-600 hover:bg-emerald-700'
                          }`}
                        >
                          {item.listingType === 'AUCTION' ? 'Ikut Lelang' : 'Beli / Nego'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {filteredListings.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-400 transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.photos[0]}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg bg-slate-100 shrink-0"
                      loading="lazy"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={item.listingType} />
                        <span className="text-[11px] text-slate-400 font-mono">{item.incoterm}</span>
                        <span className="text-[11px] text-slate-500">· {item.category}</span>
                      </div>
                      <h3
                        onClick={() => navigate(item.listingType === 'AUCTION' ? 'auction-detail' : 'listing-detail', { id: item.id })}
                        className="text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer"
                      >
                        {item.title}
                      </h3>
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-4">
                        <span>Tonase: <strong>{item.quantity} {item.unit}</strong></span>
                        <span>Lokasi: {item.location.city}, {item.location.country}</span>
                        <span>Penjual: {item.seller.companyName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-black text-slate-900 font-mono tabular-nums">
                        {item.listingType === 'AUCTION'
                          ? formatPrice(item.currentBid || 0, item.unit)
                          : formatPrice(item.pricePerUnit, item.unit)}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {item.listingType === 'AUCTION' ? `${item.bidCount} tawaran` : `Total: ${formatPrice(item.totalPrice)}`}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(item.listingType === 'AUCTION' ? 'auction-detail' : 'listing-detail', { id: item.id })}
                        className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => navigate(item.listingType === 'AUCTION' ? 'auction-detail' : 'listing-detail', { id: item.id })}
                        className={`px-3.5 py-1.5 text-xs font-bold text-white rounded-lg transition-colors shadow-2xs ${
                          item.listingType === 'AUCTION' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        {item.listingType === 'AUCTION' ? 'Ikut Lelang' : 'Beli / Nego'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
