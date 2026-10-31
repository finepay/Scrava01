import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { CURRENCIES } from '../../data/mockData';
import {
  Search,
  Globe,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  User,
  ShoppingCart,
  Bell,
  MessageSquare,
  MapPin,
  Flame,
  Building,
  Package,
  Sparkles,
  Truck,
  PhoneCall,
  Download,
  ChevronDown,
  Layers,
  Check,
  LogOut,
  Gavel
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string, params?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const {
    userRole,
    setUserRole,
    showToast,
    activeCurrency,
    setActiveCurrency,
    language,
    setLanguage,
    setSearchQuery,
    orders,
    negotiations,
    reverseBids,
    t,
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const [navSearch, setNavSearch] = useState('');
  const [searchScope, setSearchScope] = useState<'all' | 'selling' | 'buying'>('all');

  // Close category dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };
    if (categoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [categoryDropdownOpen]);

  // Stable scroll detection using requestAnimationFrame & threshold to prevent jitter/flicker
  const [showSubNav, setShowSubNav] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const diff = currentScrollY - lastScrollY.current;

          // Always visible when near top of page (0 - 50px)
          if (currentScrollY <= 50) {
            setShowSubNav(true);
          } else if (diff > 15 && currentScrollY > 90) {
            // Definite intentional scroll down (by at least 15px past 90px)
            setShowSubNav(false);
          } else if (diff < -15) {
            // Definite intentional scroll up (by at least 15px)
            setShowSubNav(true);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    setUserRole('public');
    showToast('Berhasil keluar dari akun. Sampai jumpa!');
    navigate('home');
  };

  // If in admin mode and user is viewing an admin page, admin layout has its own header.
  const isAdminView = userRole === 'admin' && currentPath.startsWith('admin');

  if (isAdminView) {
    return null; // Admin has its own enterprise navigation bar
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      setSearchQuery(navSearch.trim());
      if (searchScope === 'buying') {
        navigate('reverse-bid');
      } else {
        navigate('marketplace');
      }
    }
  };

  const handleQuickTagClick = (tag: string, targetPath: string = 'marketplace') => {
    setNavSearch(tag);
    setSearchQuery(tag);
    navigate(targetPath);
  };

  const pendingNegotiationsCount = negotiations.filter((n) => n.status === 'Countered' || n.status === 'Pending').length;
  const activeOrdersCount = orders.filter((o) => o.status !== 'COMPLETED').length;
  const openTendersCount = reverseBids.filter((r) => r.status === 'OPEN').length;

  const quickCategories = [
    { label: 'Besi & Baja (HMS 1/2)', query: 'Ferrous Metals' },
    { label: 'Tembaga & Kuningan', query: 'Copper' },
    { label: 'Aluminium & UBC', query: 'Aluminum' },
    { label: 'Plastik Daur Ulang', query: 'Plastics' },
    { label: 'Kertas & Kardus Corrugated', query: 'Paper & Cardboard' },
    { label: 'Mesin Industri & Lelang', query: 'Industrial Machinery' },
    { label: 'E-Waste & Aki Bekas', query: 'E-Waste' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs font-sans">
      {/* 1. TOP UTILITY STRIP (Slim & Clean) */}
      <div className="bg-slate-50 border-b border-slate-200/80 text-[11px] text-slate-500 py-0.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 hover:text-emerald-700 cursor-pointer">
              <Download className="w-3 h-3 text-emerald-600" />
              <span>{t('nav.app', 'Aplikasi Scrava')}</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1.5 hover:text-emerald-700 cursor-pointer" onClick={() => navigate('how-it-works')}>
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>{t('nav.escrow', 'Jaminan Escrow')}</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1.5 hover:text-emerald-700 cursor-pointer" onClick={() => navigate('procurement-hub')}>
              <Building className="w-3 h-3 text-emerald-600" />
              <span>{t('nav.tenders', 'Tender Pabrik')}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Lokasi Pengiriman */}
            <div className="flex items-center gap-1 text-slate-600 bg-white px-2 py-0.2 rounded border border-slate-200 text-[10px]">
              <MapPin className="w-2.5 h-2.5 text-emerald-600" />
              <span>{t('nav.shipping_to', 'Kirim:')} <strong className="text-slate-800">{t('nav.location_default', 'Jabodetabek & Karawang')}</strong></span>
            </div>

            <span className="text-slate-300">|</span>

            {/* Interactive Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLanguageDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px] cursor-pointer transition-colors shadow-2xs"
                title="Pilih Bahasa / Switch Language"
              >
                <span>{language === 'ID' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
                <span>{language === 'ID' ? 'Bahasa Indonesia' : 'English'}</span>
                <ChevronDown className={`w-2.5 h-2.5 text-slate-400 transition-transform ${languageDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
              </button>

              {languageDropdownOpen && (
                <div
                  className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 divide-y divide-slate-100"
                  onMouseLeave={() => setLanguageDropdownOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('ID');
                      setLanguageDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] text-left hover:bg-emerald-50 cursor-pointer ${
                      language === 'ID' ? 'text-emerald-700 font-bold bg-emerald-50/60' : 'text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>🇮🇩</span>
                      <span>Bahasa Indonesia</span>
                    </span>
                    {language === 'ID' && <Check className="w-3 h-3 text-emerald-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('EN');
                      setLanguageDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] text-left hover:bg-emerald-50 cursor-pointer ${
                      language === 'EN' ? 'text-emerald-700 font-bold bg-emerald-50/60' : 'text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>🇬🇧</span>
                      <span>English</span>
                    </span>
                    {language === 'EN' && <Check className="w-3 h-3 text-emerald-600" />}
                  </button>
                </div>
              )}
            </div>

            <span className="text-slate-300">|</span>

            {/* Currency Indicator (Strictly Rupiah IDR) */}
            <div className="flex items-center gap-1 font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px]">
              <span>🇮🇩</span>
              <span>IDR (Rupiah)</span>
            </div>

            <span className="text-slate-300">|</span>

            <span className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-800 cursor-pointer">
              <PhoneCall className="w-2.5 h-2.5 text-slate-400" />
              <span>021-5098-7700</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (Search Bar, Logo, Cart, Notifications, User) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between gap-3 lg:gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('home')}
              className="group text-left focus:outline-hidden cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-extrabold text-base shadow-xs group-hover:bg-emerald-700 transition-colors">
                  S
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-black tracking-tight text-slate-900">Scrava</span>
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 leading-none">
                    {t('nav.tagline', 'Bursa Bahan Baku & Scrap Industri')}
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Center: Search Bar (Controlled width so right actions never get pushed off) */}
          <div className="flex-1 max-w-lg lg:max-w-xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="flex items-center bg-slate-50 border border-emerald-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:bg-white transition-all">
                {/* Search Scope Filter */}
                <div className="relative border-r border-slate-200">
                  <select
                    value={searchScope}
                    onChange={(e) => setSearchScope(e.target.value as any)}
                    aria-label="Filter Scope Pencarian"
                    className="h-9 pl-2.5 pr-6 bg-slate-100/70 hover:bg-slate-200/60 text-xs font-semibold text-slate-700 appearance-none focus:outline-hidden cursor-pointer"
                  >
                    <option value="all">{t('nav.search_scope_all', 'Semua')}</option>
                    <option value="selling">{t('nav.search_scope_selling', 'Ready Stok')}</option>
                    <option value="buying">{t('nav.search_scope_buying', 'Dicari Pabrik')}</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-500 absolute right-1.5 top-3 pointer-events-none" />
                </div>

                {/* Input Text */}
                <input
                  type="text"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  placeholder={
                    searchScope === 'buying'
                      ? t('nav.search_placeholder_buying', 'Cari kebutuhan pabrik (e.g. 100 Ton Besi HMS)...')
                      : t('nav.search_placeholder_selling', 'Cari scrap besi, tembaga, plastik flakes, mesin...')
                  }
                  className="w-full h-9 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden bg-transparent"
                />

                {/* Submit Search Button */}
                <button
                  type="submit"
                  aria-label="Cari Produk atau Kebutuhan Pabrik"
                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Trending Keyword Chips */}
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 overflow-hidden whitespace-nowrap">
                <span className="font-semibold text-slate-400 text-[10px]">{t('nav.popular', 'Populer:')}</span>
                <button
                  type="button"
                  onClick={() => handleQuickTagClick('HMS 1')}
                  className="hover:text-emerald-700 transition-colors text-[10px] cursor-pointer"
                >
                  Besi HMS 1
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => handleQuickTagClick('Copper Wire')}
                  className="hover:text-emerald-700 transition-colors text-[10px] cursor-pointer"
                >
                  Tembaga
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => handleQuickTagClick('Aluminum')}
                  className="hover:text-emerald-700 transition-colors text-[10px] cursor-pointer"
                >
                  Aluminium
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => handleQuickTagClick('HDPE')}
                  className="hover:text-emerald-700 transition-colors text-[10px] cursor-pointer"
                >
                  Plastik HDPE
                </button>
              </div>
            </form>
          </div>

          {/* Right: Actions (Chat & Cart only when logged in; single 'Daftar' button before login) */}
          <div className="flex items-center gap-2 lg:gap-3 shrink-0">
            {/* Tampilkan Chat, Keranjang, dan Notifikasi HANYA setelah login */}
            {userRole !== 'public' && (
              <>
                {/* Chat Negosiasi Icon with Badge */}
                <button
                  onClick={() => navigate('dashboard-negotiations')}
                  className="relative p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                  title={t('nav.messages', 'Pesan & Negosiasi Pabrik')}
                >
                  <MessageSquare className="w-5 h-5" />
                  {pendingNegotiationsCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {pendingNegotiationsCount}
                    </span>
                  )}
                </button>

                {/* Cart / RFQ Orders with Badge */}
                <button
                  onClick={() => navigate('dashboard-orders')}
                  className="relative p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                  title={t('nav.orders', 'Pesanan & Kontrak Pengadaan')}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {activeOrdersCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {activeOrdersCount}
                    </span>
                  )}
                </button>

                {/* Notifications */}
                <button
                  onClick={() => navigate('reverse-bid')}
                  className="relative p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors hidden sm:inline-flex cursor-pointer"
                  title={t('nav.notifications', 'Tender Baru Masuk')}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
                </button>

                <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />
              </>
            )}

            {/* Auth / Dashboard: Sebelum login, tombol 'Daftar' */}
            {userRole === 'public' ? (
              <button
                onClick={() => navigate('register')}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-2xs whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('nav.register', 'Daftar')}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(userRole === 'admin' ? 'admin-overview' : 'dashboard-overview')}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{userRole === 'admin' ? t('nav.admin_ops', 'Admin Ops') : t('nav.dashboard', 'Dashboard')}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-300 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  title={t('nav.sign_out', 'Keluar dari Akun')}
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden sm:inline">{t('nav.sign_out', 'Keluar')}</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. SUB-HEADER NAVIGATION BAR (Horizontal categories & quick channels) */}
      <div
        className={`bg-white border-t border-slate-100 hidden md:block transition-[height,opacity] duration-200 ease-out ${
          showSubNav ? 'h-10 opacity-100 overflow-visible' : 'h-0 opacity-0 overflow-hidden border-t-0 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-10 text-xs font-medium text-slate-700">
          <div className="flex items-center gap-6">
            {/* Category Dropdown Trigger */}
            <div className="relative" ref={categoryMenuRef}>
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 font-bold text-slate-800 hover:text-emerald-700 transition-colors py-2 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('nav.categories', 'Kategori')}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${categoryDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
              </button>

              {categoryDropdownOpen && (
                <div
                  className="absolute left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50 divide-y divide-slate-100"
                  onMouseLeave={() => setCategoryDropdownOpen(false)}
                >
                  {quickCategories.map((c) => (
                    <button
                      key={c.query}
                      onClick={() => {
                        setSearchQuery(c.query);
                        navigate('marketplace');
                        setCategoryDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center justify-between"
                    >
                      <span>{c.label}</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      navigate('marketplace');
                      setCategoryDropdownOpen(false);
                    }}
                    className="w-full text-center py-2 text-xs font-bold text-emerald-700 hover:bg-slate-50 transition-colors"
                  >
                    {t('nav.view_all_categories', 'Lihat Semua Kategori →')}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Channel Links (Shortened to 1-2 words) */}
            <button
              onClick={() => navigate('register')}
              className={`flex items-center gap-1.5 transition-colors font-semibold ${
                currentPath === 'register' ? 'text-emerald-700 font-bold' : 'text-slate-700 hover:text-emerald-700'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Daftar</span>
              <span className="bg-emerald-100/80 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                HOT
              </span>
            </button>

            <button
              onClick={() => navigate('reverse-bid')}
              className={`flex items-center gap-1.5 transition-colors ${
                currentPath === 'reverse-bid' ? 'text-emerald-700 font-bold' : 'text-slate-700 hover:text-emerald-700'
              }`}
            >
              <span>{t('nav.factory_demands', 'Dicari Pabrik')}</span>
              <span className="bg-amber-100/80 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {openTendersCount}
              </span>
            </button>

            <button
              onClick={() => navigate('marketplace')}
              className={`transition-colors ${currentPath === 'marketplace' ? 'text-emerald-700 font-bold' : 'text-slate-700 hover:text-emerald-700'}`}
            >
              {t('nav.ready_stock', 'Ready Stok')}
            </button>

            <button
              onClick={() => navigate('auctions')}
              className={`flex items-center gap-1 transition-colors ${
                currentPath === 'auctions' ? 'text-emerald-700 font-bold' : 'text-slate-700 hover:text-emerald-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('nav.flash_auctions', 'Lelang Kilat')}</span>
            </button>

            <button
              onClick={() => navigate('project-auctions')}
              className={`flex items-center gap-1 transition-colors ${
                currentPath === 'project-auctions' ? 'text-emerald-700 font-bold' : 'text-slate-700 hover:text-emerald-700'
              }`}
            >
              <Gavel className="w-3.5 h-3.5 text-blue-600" />
              <span>Lelang Proyek</span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                Jaminan
              </span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => navigate('how-it-works')}
              className="flex items-center gap-1 text-slate-500 hover:text-emerald-700 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('nav.escrow', 'Jaminan Escrow')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. MOBILE SEARCH & MENU DROPDOWN */}
      <div className="p-2 border-t border-slate-100 md:hidden bg-white">
        <form onSubmit={handleSearchSubmit} className="flex items-center bg-slate-100 rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            placeholder={
              searchScope === 'buying'
                ? t('nav.search_placeholder_buying', 'Cari kebutuhan pabrik (e.g. 100 Ton Besi HMS)...')
                : t('nav.search_placeholder_selling', 'Cari scrap besi, tembaga, plastik flakes, mesin...')
            }
            className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-hidden"
          />
          <button type="submit" className="text-xs font-bold text-emerald-700 ml-1">
            Cari
          </button>
        </form>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          {/* Mobile Language Toggle */}
          <div className="pb-2 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">{language === 'ID' ? 'Pilihan Bahasa:' : 'Select Language:'}</span>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-md">
              <button
                onClick={() => setLanguage('ID')}
                className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                  language === 'ID' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
                }`}
              >
                🇮🇩 ID
              </button>
              <button
                onClick={() => setLanguage('EN')}
                className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                  language === 'EN' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              navigate('marketplace');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-semibold text-slate-800 hover:text-emerald-600 border-b border-slate-100"
          >
            {t('nav.ready_stock', 'Ready Stok')}
          </button>
          <button
            onClick={() => {
              navigate('register');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 border-b border-slate-100 flex items-center justify-between"
          >
            <span>*Daftar*</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              HOT
            </span>
          </button>
          <button
            onClick={() => {
              navigate('project-auctions');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-semibold text-blue-700 hover:text-blue-800 border-b border-slate-100 flex items-center justify-between"
          >
            <span>Lelang Proyek</span>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              Jaminan
            </span>
          </button>
          <button
            onClick={() => {
              navigate('reverse-bid');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-semibold text-slate-800 hover:text-emerald-600 border-b border-slate-100"
          >
            {t('nav.factory_demands', 'Dicari Pabrik')}
          </button>
          <button
            onClick={() => {
              navigate('auctions');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-semibold text-slate-800 hover:text-emerald-600 border-b border-slate-100"
          >
            {t('nav.flash_auctions', 'Lelang Kilat')}
          </button>
          <button
            onClick={() => {
              navigate('how-it-works');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-semibold text-slate-800 hover:text-emerald-600"
          >
            {t('nav.escrow', 'Jaminan Escrow')}
          </button>

          {userRole === 'public' ? (
            <div className="pt-3 mt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  navigate('register');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-sm font-bold transition-colors shadow-2xs cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>{t('nav.register', 'Daftar')}</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 mt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-sm font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>{t('nav.sign_out', 'Keluar dari Akun')}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
