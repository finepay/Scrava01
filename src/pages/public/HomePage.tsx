import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Scale,
  FileCheck2,
  Clock,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Building,
  Gavel,
  PlusCircle,
  CheckCircle2,
  ExternalLink,
  Layers,
  Truck,
  DollarSign,
  Sparkles,
  Flame,
  Star,
  MapPin,
  Tag,
  Lock,
  ArrowUpRight,
  Filter,
  Check,
  Eye,
  SlidersHorizontal,
  MessageSquare,
  User
} from 'lucide-react';

interface HomePageProps {
  navigate: (path: string, params?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { userRole, listings, auctions, reverseBids, priceIndex, formatPrice, activeCurrency, setSearchQuery, showToast, t, language } = useApp();

  // State for search and active filters
  const [localSearch, setLocalSearch] = useState('');
  const [activeMainTab, setActiveMainTab] = useState<'selling' | 'buying'>('selling');
  const [sellingCategoryFilter, setSellingCategoryFilter] = useState<string>('All');
  const [buyingCategoryFilter, setBuyingCategoryFilter] = useState<string>('All');

  // Carousel state
  const [activeSlide, setActiveSlide] = useState(0);

  // Flash Sale Countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Carousel auto-slide
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 4);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchQuery(localSearch.trim());
      navigate('marketplace');
    }
  };

  const handleQuickCategoryClick = (cat: string) => {
    setSearchQuery(cat);
    navigate('marketplace');
  };

  // Carousel Banner Data
  const carouselSlides = [
    {
      id: 1,
      badge: 'Bursa Bahan Baku & Scrap',
      title: 'Pusat Jual Beli Bahan Baku Pabrik & Scrap Industri',
      desc: 'Transaksi langsung antara pabrik peleburan dan depo scrap terverifikasi se-Indonesia. 100% aman dengan Jaminan Escrow & Timbangan Digital.',
      bgImage: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1600&q=80',
      ctaText: 'Ready Stok',
      ctaAction: () => {
        setActiveMainTab('selling');
        const el = document.getElementById('core-trading-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
      secondaryText: 'Dicari Pabrik',
      secondaryAction: () => {
        setActiveMainTab('buying');
        const el = document.getElementById('core-trading-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
      tags: ['Timbang Bayar Langsung', 'Bebas Calo', 'Didukung 240+ Pabrik'],
      gradient: 'from-slate-950 via-slate-900/90 to-teal-950/80',
      accentColor: 'text-emerald-300',
    },
    {
      id: 2,
      badge: 'Tender Smelter',
      title: 'Dibutuhkan 500 MT Besi Tua HMS 1 untuk Peleburan',
      desc: 'Smelter baja nasional membuka kuota pasokan scrap peleburan induksi. Menerima pasokan parsial (Split Order) minimal 1 tronton (20 MT). Pembayaran tunai H+1.',
      bgImage: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1600&q=80',
      ctaText: 'Daftar',
      ctaAction: () => navigate('register'),
      secondaryText: 'Dicari Pabrik',
      secondaryAction: () => navigate('reverse-bid'),
      tags: ['Franco Karawang & Cilegon', 'Target Rp 6.950/kg', 'ISRI 200 Standard'],
      gradient: 'from-slate-950 via-slate-900/90 to-cyan-950/80',
      accentColor: 'text-cyan-300',
    },
    {
      id: 3,
      badge: 'Lelang Kilat',
      title: 'Lot Alat Berat, Mesin Bubut CNC & Genset Pabrik',
      desc: 'Pelelangan terbuka ex-pabrik manufaktur otomotif. Unit mesin bubut CNC 5-axis, genset Cummins 500kVA, dan forklift komatsu siap kerja bergaransi operasional.',
      bgImage: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1600&q=80',
      ctaText: 'Lelang Kilat',
      ctaAction: () => navigate('auctions'),
      secondaryText: 'Jadwal Inspeksi',
      secondaryAction: () => navigate('auctions'),
      tags: ['Bisa Nego di Tempat', 'Fisik Lolos Uji', 'Mulai Rp 15 Juta'],
      gradient: 'from-slate-950 via-slate-900/90 to-amber-950/80',
      accentColor: 'text-amber-300',
    },
    {
      id: 4,
      badge: 'Daftar Mitra',
      title: 'Pengepul Kecil & Menengah Kini Bisa Pasok Pabrik',
      desc: 'Daftarkan depo Anda sekarang. Akses kuota pasokan smelter, lelang terbuka langsung tanpa calo, dan jaminan penagihan tunai.',
      bgImage: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=80',
      ctaText: 'Daftar',
      ctaAction: () => navigate('register'),
      secondaryText: 'Jaminan Escrow',
      secondaryAction: () => navigate('how-it-works'),
      tags: ['Fair Share Settlement', 'Kontrak PO Resmi', 'Solusi Cashflow Cepat'],
      gradient: 'from-slate-950 via-slate-900/90 to-teal-950/80',
      accentColor: 'text-teal-300',
    },
  ];

  // Quick category items (Tokopedia/Shopee style)
  const categoryIcons = [
    { name: 'Besi & Baja', query: 'Ferrous Metals', icon: '🏗️', count: '142 Lot', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'Tembaga & Kuningan', query: 'Copper', icon: '⚡', count: '68 Lot', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { name: 'Aluminium & UBC', query: 'Aluminum', icon: '🥫', count: '54 Lot', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    { name: 'Plastik Daur Ulang', query: 'Plastics', icon: '🧴', count: '89 Lot', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Kertas & Box (OCC)', query: 'Paper & Cardboard', icon: '📦', count: '45 Lot', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { name: 'E-Waste & Aki', query: 'E-Waste', icon: '🔋', count: '38 Lot', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { name: 'Mesin Industri', query: 'Industrial Machinery', icon: '⚙️', count: '29 Unit', color: 'bg-slate-100 text-slate-800 border-slate-300' },
    { name: 'Dicari Pabrik (RFQ)', query: 'RFQ', icon: '🏭', count: '24 Tender', isRfq: true, color: 'bg-rose-50 text-rose-700 border-rose-200' },
  ];

  // Filter listings for Tab 1 (Barang Dijual)
  const filteredListings = listings.filter((item) => {
    if (sellingCategoryFilter === 'All') return true;
    if (sellingCategoryFilter === 'Metals') return item.category.includes('Ferrous') || item.category === 'Copper' || item.category === 'Aluminum' || item.category === 'Stainless Steel';
    if (sellingCategoryFilter === 'Copper') return item.category === 'Copper';
    if (sellingCategoryFilter === 'Aluminum') return item.category === 'Aluminum';
    if (sellingCategoryFilter === 'Plastics') return item.category === 'Plastics' || item.category === 'Paper & Cardboard';
    if (sellingCategoryFilter === 'Machinery') return item.category === 'Industrial Machinery' || item.category === 'Heavy Equipment';
    return item.category.toLowerCase().includes(sellingCategoryFilter.toLowerCase());
  });

  // Filter reverse bids for Tab 2 (Dicari Pabrik)
  const filteredRequirements = reverseBids.filter((req) => {
    if (buyingCategoryFilter === 'All') return true;
    if (buyingCategoryFilter === 'Ferrous') return req.category.includes('Ferrous') || req.material.includes('Steel') || req.material.includes('HMS');
    if (buyingCategoryFilter === 'Copper') return req.category === 'Copper' || req.material.includes('Copper');
    if (buyingCategoryFilter === 'Aluminum') return req.category === 'Aluminum' || req.material.includes('Aluminum');
    return req.category.toLowerCase().includes(buyingCategoryFilter.toLowerCase());
  });

  return (
    <div className="space-y-10 pb-16 font-sans bg-slate-50/60">
      {/* 2. HERO CAROUSEL + QUICK PROMO CARDS (Classic Shopee/Tokopedia Hero Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Banner Slider (Left 8 cols) */}
          <div className="lg:col-span-8 relative rounded-2xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-950 min-h-[390px] flex flex-col justify-between p-6 sm:p-10 text-white group">
            {/* Background Image with Highly Visible Industrial Backdrop */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img
                key={carouselSlides[activeSlide].id}
                src={carouselSlides[activeSlide].bgImage}
                alt={carouselSlides[activeSlide].title}
                className="w-full h-full object-cover object-center filter brightness-70 contrast-105 transition-all duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/20" />
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Slide Content */}
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-wider uppercase text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{carouselSlides[activeSlide].badge}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight max-w-xl text-balance">
                {carouselSlides[activeSlide].title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
                {carouselSlides[activeSlide].desc}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {carouselSlides[activeSlide].tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-200 bg-white/10 px-2.5 py-0.5 rounded-md border border-white/10"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons & Slide Controls */}
            <div className="relative z-10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={carouselSlides[activeSlide].ctaAction}
                  className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-white hover:bg-slate-100 rounded-lg transition-all shadow-md flex items-center gap-2 group"
                >
                  <span>{carouselSlides[activeSlide].ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-900 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={carouselSlides[activeSlide].secondaryAction}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                >
                  {carouselSlides[activeSlide].secondaryText}
                </button>
              </div>

              {/* Dot Indicators & Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSlide((prev) => (prev === 0 ? carouselSlides.length - 1 : prev - 1))}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 px-2">
                  {carouselSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        activeSlide === idx ? 'w-6 bg-emerald-400' : 'w-2 bg-white/30 hover:bg-white/50'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setActiveSlide((prev) => (prev + 1) % carouselSlides.length)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Promo Cards (Right 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Card 1: Factory Demand / Post RFQ */}
            <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 border border-slate-700/80 rounded-2xl p-5 text-white flex flex-col justify-between shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10 text-white">
                <Building className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-700/40">
                    Dicari Pabrik
                  </span>
                  <span className="text-[11px] text-slate-300 font-mono">18 Tender</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Pabrik Butuh Pasokan Scrap?
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Buka tender pengadaan dalam 30 detik. Ratusan depo siap memasok sesuai spek.
                </p>
              </div>

              <div className="relative z-10 pt-4">
                <button
                  onClick={() => navigate('register')}
                  className="w-full py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Daftar</span>
                </button>
              </div>
            </div>

            {/* Card 2: Sell Scrap / Create Listing */}
            <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl p-5 text-slate-900 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Ready Stok
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">Pasti H+1</span>
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Ada Stok Scrap di Gudang?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Pasang iklan stok bahan gratis, hubungkan langsung ke smelter tanpa calo.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    if (userRole === 'public') {
                      showToast('Silakan masuk atau daftar akun terlebih dahulu untuk menjual stok scrap.');
                      navigate('login');
                    } else {
                      navigate('dashboard-create-listing');
                    }
                  }}
                  className="w-full py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Jual Stok</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. QUICK CATEGORY ICON GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800 tracking-wide">
                Kategori
              </h2>
            </div>
            <button
              onClick={() => navigate('marketplace')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Semua Kategori</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categoryIcons.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  if (cat.isRfq) {
                    navigate('reverse-bid');
                  } else {
                    handleQuickCategoryClick(cat.query);
                  }
                }}
                className="group flex flex-col items-center text-center p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-xs transition-all"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-2 border transition-transform group-hover:scale-110 ${cat.color}`}>
                  {cat.icon}
                </div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
                  {cat.name}
                </div>
                <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                  {cat.count}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FLASH DEAL / LELANG KILAT (Harmonious Teal/Emerald & Amber Palette) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-sm border border-emerald-700/30">
          {/* Header Flash Deal */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/15 mb-4 gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 font-black text-lg sm:text-xl tracking-tight text-white">
                <Flame className="w-5 h-5 text-amber-300 fill-amber-300" />
                <span>Lelang Kilat</span>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/15">
                <Clock className="w-3.5 h-3.5 text-amber-300 mr-0.5" />
                <span className="text-slate-200">Sisa waktu:</span>
                <span className="font-mono bg-white text-slate-900 px-1.5 py-0.5 rounded text-[11px] font-bold">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span>:</span>
                <span className="font-mono bg-white text-slate-900 px-1.5 py-0.5 rounded text-[11px] font-bold">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span>:</span>
                <span className="font-mono bg-white text-slate-900 px-1.5 py-0.5 rounded text-[11px] font-bold">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('auctions')}
              className="text-xs font-semibold text-emerald-200 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Semua Lot ({auctions.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Flash Deal / Lelang Kilat Items Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(auctions.filter((a) => (a as any).status !== 'PENDING_APPROVAL').length > 0
              ? auctions.filter((a) => (a as any).status !== 'PENDING_APPROVAL').slice(0, 4)
              : auctions.slice(0, 4)
            ).map((auctionItem, idx) => {
              const currentBid = auctionItem.currentBid || auctionItem.minAskingPrice || 1000;
              const buyNow = (auctionItem as any).buyNowPrice || Math.round(currentBid * (auctionItem.quantity || 1) * 1.35);

              return (
                <div
                  key={auctionItem.id}
                  onClick={() => navigate('auction-detail', { id: auctionItem.id })}
                  className="bg-white rounded-xl overflow-hidden text-slate-900 flex flex-col justify-between shadow-xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                    <img
                      src={auctionItem.photos[0] || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'}
                      alt={auctionItem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-slate-950" />
                      <span>LELANG AKTIF</span>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                      {auctionItem.location.city}
                    </div>
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">
                        {auctionItem.category}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5 group-hover:text-emerald-700 transition-colors">
                        {auctionItem.title}
                      </h4>

                      {/* Pricing Info */}
                      <div className="mt-2 space-y-0.5">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Tawaran Saat Ini:</div>
                        <div className="text-sm font-black text-slate-900 font-mono">
                          {formatPrice(currentBid, auctionItem.unit)}
                        </div>
                        <div className="text-[11px] text-emerald-800 font-semibold font-mono">
                          Beli Langsung: <strong>{formatPrice(buyNow)}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('auction-detail', { id: auctionItem.id });
                        }}
                        className="w-full py-2 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors text-center shadow-xs flex items-center justify-center gap-1 uppercase tracking-wider"
                      >
                        <Gavel className="w-3.5 h-3.5" />
                        <span>Beli Langsung / Bid →</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. DUAL CORE SECTION: READY STOK vs DICARI PABRIK */}
      <section id="core-trading-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Big Dual Tab Switcher */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Tab 1 Trigger: Ready Stok */}
            <button
              onClick={() => setActiveMainTab('selling')}
              className={`p-5 text-left transition-all relative flex items-center justify-between ${
                activeMainTab === 'selling'
                  ? 'bg-emerald-50/60 border-b-4 border-b-emerald-600'
                  : 'hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                  activeMainTab === 'selling' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                }`}>
                  📦
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-black text-slate-800">
                      Ready Stok
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded-full">
                      {listings.length} Lot
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Stok scrap, logam, plastik daur ulang, dan mesin siap kirim
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 transition-transform ${activeMainTab === 'selling' ? 'text-emerald-700 translate-x-1' : 'text-slate-300'}`} />
            </button>

            {/* Tab 2 Trigger: Dicari Pabrik */}
            <button
              onClick={() => setActiveMainTab('buying')}
              className={`p-5 text-left transition-all relative flex items-center justify-between ${
                activeMainTab === 'buying'
                  ? 'bg-emerald-50/60 border-b-4 border-b-emerald-600'
                  : 'hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                  activeMainTab === 'buying' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                }`}>
                  🏭
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-black text-slate-800">
                      Dicari Pabrik
                    </span>
                    <span className="text-[10px] font-bold bg-amber-100/80 text-amber-900 px-2 py-0.5 rounded-full">
                      {reverseBids.length} Permintaan
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Smelter mencari pasokan rutin. Bisa kirim bertahap via Split Order
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 transition-transform ${activeMainTab === 'buying' ? 'text-emerald-700 translate-x-1' : 'text-slate-300'}`} />
            </button>
          </div>
        </div>

        {/* -------------------- TAB CONTENT 1: BARANG DIJUAL -------------------- */}
        {activeMainTab === 'selling' && (
          <div className="space-y-6">
            {/* Filter Pills */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                <span className="text-slate-400 text-[11px] mr-1">Filter Kategori:</span>
                {[
                  { id: 'All', label: 'Semua Bahan' },
                  { id: 'Metals', label: 'Besi & Baja' },
                  { id: 'Copper', label: 'Tembaga & Kuningan' },
                  { id: 'Aluminum', label: 'Aluminium' },
                  { id: 'Plastics', label: 'Plastik & Kertas' },
                  { id: 'Machinery', label: 'Mesin Industri' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSellingCategoryFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      sellingCategoryFilter === f.id
                        ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
                <span className="text-slate-500">Urutkan:</span>
                <select
                  aria-label="Urutkan Produk"
                  className="bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded-md focus:outline-hidden"
                >
                  <option>Paling Sesuai</option>
                  <option>Harga Terendah</option>
                  <option>Tonase Terbesar</option>
                  <option>Terbaru Masuk</option>
                </select>
              </div>
            </div>

            {/* Product Card Grid (Shopee / Tokopedia B2B Product Layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredListings.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 hover:border-emerald-500 rounded-xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  {/* Photo Frame */}
                  <div className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => navigate('listing-detail', { id: item.id })}>
                    <img
                      src={item.photos[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase">
                        {item.condition}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                      {item.incoterm}
                    </div>

                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                      <Scale className="w-3 h-3 text-emerald-600" />
                      <span>{item.quantity} {item.unit} Ready</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Location & Category */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span className="font-semibold text-emerald-700">{item.category}</span>
                        <span className="flex items-center gap-0.5 text-slate-500 truncate max-w-[130px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{item.location.city}</span>
                        </span>
                      </div>

                      {/* Product Title */}
                      <h3
                        onClick={() => navigate('listing-detail', { id: item.id })}
                        className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 cursor-pointer leading-snug"
                      >
                        {item.title}
                      </h3>

                      {/* Seller Trust Badge */}
                      <div className="mt-2.5 flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-700 truncate max-w-[140px] font-medium">
                          {item.seller.companyName}
                        </span>
                        <span className="flex items-center gap-1 text-amber-600 font-bold font-mono">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{item.seller.rating}</span>
                        </span>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="mb-3">
                        <div className="text-[10px] text-slate-600 uppercase font-bold">Harga Satuan</div>
                        <div className="text-lg font-black text-slate-900 font-mono tracking-tight">
                          {formatPrice(item.pricePerUnit, item.unit)}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Total Lot: <strong className="text-slate-700">{formatPrice(item.totalPrice)}</strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => navigate('listing-detail', { id: item.id })}
                          className="w-full py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-center transition-colors"
                        >
                          Lihat Detail
                        </button>
                        <button
                          onClick={() => navigate('listing-detail', { id: item.id })}
                          className="w-full py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg text-center transition-colors shadow-2xs"
                        >
                          Beli / Nego
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Link */}
            <div className="text-center pt-4">
              <button
                onClick={() => navigate('marketplace')}
                className="px-6 py-3 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition-colors inline-flex items-center gap-2 shadow-2xs"
              >
                <span>Buka Katalog Lengkap (Semua 240+ Lot Bahan Dijual)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* -------------------- TAB CONTENT 2: DICARI PABRIK (TENDER & RFQ) -------------------- */}
        {activeMainTab === 'buying' && (
          <div className="space-y-6">
            {/* Top Info Banner for Factory Demand */}
            <div className="bg-gradient-to-r from-slate-900 to-emerald-950 rounded-xl p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-emerald-900/60 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Pusat Tender Peleburan & Pabrik Smelter
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Punya Pasokan Scrap? Ajukan Penawaran Langsung ke Pabrik Pembeli
                </h3>
                <p className="text-xs text-emerald-200/80 max-w-2xl">
                  Sistem Scrava mendukung <strong>Split Order</strong>: Jika pabrik butuh 100 MT, Anda tetap bisa memasok sebagian (misal 20 MT atau 40 MT) sesuai kapasitas gudang Anda!
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => navigate('register')}
                  className="px-4 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Daftar Mitra Pengadaan</span>
                </button>
                <button
                  onClick={() => navigate('reverse-bid')}
                  className="px-3.5 py-2.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                >
                  + Post Kebutuhan Pabrik
                </button>
              </div>
            </div>

            {/* Filter Pills for Buying */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[11px] mr-1">Filter Kebutuhan Pabrik:</span>
              {[
                { id: 'All', label: 'Semua Kebutuhan' },
                { id: 'Ferrous', label: 'Besi & Baja Smelter' },
                { id: 'Copper', label: 'Tembaga Kabel' },
                { id: 'Aluminum', label: 'Aluminium Extrusion' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setBuyingCategoryFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    buyingCategoryFilter === f.id
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Factory Demand Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredRequirements.map((req, idx) => {
                const totalTarget = req.quantity;
                const fulfilled = [45, 20, 15, 30][idx % 4];
                const remaining = Math.max(0, totalTarget - fulfilled);
                const percent = Math.min(100, Math.round((fulfilled / totalTarget) * 100));

                return (
                  <div
                    key={req.id}
                    className="bg-white border-2 border-slate-200 hover:border-emerald-600 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar: Company Name & Status */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-black text-sm shrink-0">
                            🏭
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-bold text-slate-900">{req.buyerCompany}</h4>
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                Terverifikasi
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>Tujuan: {req.deliveryLocation}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            Tutup: {req.deadline}
                          </span>
                        </div>
                      </div>

                      {/* Requirement Material Title */}
                      <h3
                        onClick={() => navigate('requirement-detail', { id: req.id })}
                        className="text-base font-bold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer leading-snug"
                      >
                        {req.title}
                      </h3>

                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        Spesifikasi: {req.specifications}
                      </p>

                      {/* Target Price & Volume */}
                      <div className="mt-4 grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Budget Beli Pabrik</div>
                          <div className="text-base font-black text-emerald-700 font-mono">
                            {formatPrice(req.targetPrice, req.unit)}
                          </div>
                          <div className="text-[10px] text-slate-500">Incoterm: {req.incoterm}</div>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Total Kuota Dicari</div>
                          <div className="text-base font-black text-slate-900 font-mono">
                            {req.quantity} {req.unit}
                          </div>
                          <div className="text-[10px] text-slate-500">Minimal Pasok: 20 {req.unit}</div>
                        </div>
                      </div>

                      {/* Split Order Progress Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-slate-600 font-medium">
                            Status Pemenuhan Kuota Pabrik:
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {fulfilled} / {totalTarget} {req.unit} (Sisa {remaining} {req.unit})
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-emerald-800 font-semibold mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Menerima Split Order: Pasok bertahap atau parsial disetujui</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-3">
                      <button
                        onClick={() => navigate('requirement-detail', { id: req.id })}
                        className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg text-center transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Pasok Kuota</span>
                      </button>

                      <button
                        onClick={() => navigate('requirement-detail', { id: req.id })}
                        className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Syarat
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Link for Buying */}
            <div className="text-center pt-4">
              <button
                onClick={() => navigate('reverse-bid')}
                className="px-6 py-3 text-xs font-bold text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors inline-flex items-center gap-2 shadow-2xs"
              >
                <span>Lihat Seluruh Tender Pabrik Terbuka ({reverseBids.length} RFQ)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 6. MITRA PABRIK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-white bg-slate-800 px-2 py-0.5 rounded tracking-wide">
                  Mitra Pabrik
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-800">
                  Smelter Rekanan
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pabrik pembeli terakreditasi dengan jaminan pembayaran tepat waktu
              </p>
            </div>
            <button
              onClick={() => navigate('procurement-hub')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Daftar Mitra</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Krakatau Steel Network', type: 'Smelter Baja & Billet', volume: '15.000 MT/bln', rating: '5.0', logo: 'KS' },
              { name: 'Gunung Raja Paksi Partner', type: 'Furnace Rebar & H-Beam', volume: '10.000 MT/bln', rating: '4.9', logo: 'GRP' },
              { name: 'Maspion Group Daur Ulang', type: 'Aluminium Extrusion', volume: '4.500 MT/bln', rating: '4.9', logo: 'MSG' },
              { name: 'Smelting Gresik Vendor', type: 'Katoda Tembaga', volume: '6.000 MT/bln', rating: '5.0', logo: 'SG' },
              { name: 'Indah Kiat Fiber Mills', type: 'Kardus Box & Pulp', volume: '8.000 MT/bln', rating: '4.8', logo: 'IK' },
              { name: 'Surabaya Wire & Cable', type: 'Copper Bare Bright', volume: '3.200 MT/bln', rating: '4.9', logo: 'SWC' },
            ].map((pabrik) => (
              <div
                key={pabrik.name}
                onClick={() => navigate('procurement-hub')}
                className="bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-400 p-4 rounded-xl flex flex-col justify-between text-center transition-all cursor-pointer group"
              >
                <div>
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm mb-2 group-hover:bg-emerald-600 transition-colors">
                    {pabrik.logo}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                    {pabrik.name}
                  </h4>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {pabrik.type}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/70 text-[10px] text-emerald-700 font-mono font-bold">
                  Beli: {pabrik.volume}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TRUST PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100/80 px-3 py-1 rounded-full">
            {t('trust.badge', 'Jaminan Keamanan Transaksi')}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 mt-2">
            {t('trust.title', 'Jaminan Timbang & Escrow')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('trust.subtitle', 'Transaksi terlindungi rekening penampung resmi dan jembatan timbang terkalibrasi')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 hover:border-emerald-400 transition-colors shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">{t('trust.escrow_title', 'Jaminan Escrow')}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {t('trust.escrow_desc', 'Dana diamankan di bank kustodi terpercaya hingga timbang terima di pabrik selesai.')}
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-5 hover:border-emerald-400 transition-colors shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 mb-3">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">{t('trust.scale_title', 'Timbangan Digital')}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {t('trust.scale_desc', 'Terkoneksi timbangan berizin Metrologi Legal Kemendag dengan rekonsiliasi otomatis.')}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-500 transition-colors shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">{t('trust.qc_title', 'Uji Lab QC Independen')}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {t('trust.qc_desc', 'Bekerja sama dengan surveyor Sucofindo & SGS untuk spektrometri kemurnian kadar logam dan sertifikat bebas kontaminasi radiasi.')}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-500 transition-colors shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">{t('trust.manifest_title', 'Surat Jalan Digital (QR)')}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {t('trust.manifest_desc', 'Manifest truk trailer dan identitas supir tervalidasi kode QR. Verifikasi cepat di pos satpam pabrik tanpa dokumen kertas yang hilang.')}
            </p>
          </div>
        </div>
      </section>

      {/* 10. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 border border-slate-700/80 rounded-2xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t('cta.title', 'Siap Bertransaksi Bahan Baku?')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {t('cta.desc', 'Daftarkan perusahaan Anda untuk mulai menjual pasokan scrap atau membuka tender kebutuhan pabrik secara langsung.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('register')}
              className="px-6 py-3 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {t('cta.register_now', 'Daftar Akun Sekarang →')}
            </button>
            <button
              onClick={() => navigate('marketplace')}
              className="px-5 py-3 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors cursor-pointer"
            >
              {t('nav.ready_stock', 'Ready Stok')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
