import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { COUNTRIES } from '../../data/mockData';
import {
  ShieldCheck,
  Building2,
  Store,
  Shield,
  CheckCircle2,
  UploadCloud,
  FileText,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Lock,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Sparkles,
  ChevronRight,
  User
} from 'lucide-react';

import { apiClient } from '../../api/client';

interface AuthPageProps {
  mode: 'login' | 'register' | 'verification';
  navigate: (path: string, params?: any) => void;
}

export const AuthPages: React.FC<AuthPageProps> = ({ mode: initialMode, navigate }) => {
  const { setUserRole, setCurrentUser, kycProgress, updateKycProgress, currentCompany, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    initialMode === 'register' ? 'register' : 'login'
  );

  // Login form state: ONLY 2 ROLES: 'customer' & 'admin'
  const [selectedLoginRole, setSelectedLoginRole] = useState<'customer' | 'admin'>('customer');
  const [loginEmail, setLoginEmail] = useState('hendra@scrava.id');
  const [loginPassword, setLoginPassword] = useState('••••••••••••');

  // Register form state: Customer Registration with Business Classification
  const [businessCategory, setBusinessCategory] = useState<'pabrik' | 'pengepul' | 'umum'>('pabrik');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('••••••••••••');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Quick Google Sign-In / Sign-Up Simulator
  const handleGoogleAuth = async () => {
    try {
      const res = await apiClient.auth.login({
        email: selectedLoginRole === 'admin' ? 'admin@scrava.id' : 'customer@scrava.id',
        role: selectedLoginRole,
      });
      if (res.user) {
        setCurrentUser(res.user);
      }
    } catch (err) {
      console.warn('API Google auth warning:', err);
    }
    setUserRole(selectedLoginRole);
    if (selectedLoginRole === 'admin') {
      showToast('Berhasil masuk dengan Google sebagai Admin Scrava.');
      navigate('admin-overview');
    } else {
      showToast('Berhasil masuk dengan Google sebagai Customer (Pabrik & Pengepul).');
      navigate('dashboard-overview');
    }
  };

  const handleRoleSelectChange = (role: 'customer' | 'admin') => {
    setSelectedLoginRole(role);
    if (role === 'admin') {
      setLoginEmail('admin@scrava.id');
    } else {
      setLoginEmail('hendra@scrava.id');
    }
  };

  const handleQuickDemoLogin = async (role: 'customer' | 'admin') => {
    const demoEmail = role === 'admin' ? 'admin@scrava.id' : 'hendra@scrava.id';
    try {
      const res = await apiClient.auth.login({
        email: demoEmail,
        password: 'password123',
        role,
      });
      if (res.user) {
        setCurrentUser(res.user);
      }
    } catch (err) {
      console.warn('API login error:', err);
    }

    setUserRole(role);
    if (role === 'admin') {
      showToast('Berhasil masuk sebagai Admin Operasional Scrava');
      navigate('admin-overview');
    } else {
      showToast('Berhasil masuk sebagai Customer (Pabrik & Pengepul Lengkap)');
      navigate('dashboard-overview');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.auth.login({
        email: loginEmail,
        password: loginPassword,
        role: selectedLoginRole,
      });
      if (res.user) {
        setCurrentUser(res.user);
      }
    } catch (err) {
      console.warn('API login error:', err);
    }

    setUserRole(selectedLoginRole);
    if (selectedLoginRole === 'admin') {
      showToast('Berhasil masuk sebagai Administrator Operasional Scrava');
      navigate('admin-overview');
    } else {
      showToast('Berhasil masuk sebagai Customer Scrava (Akun Jual & Beli Lengkap)');
      navigate('dashboard-overview');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      showToast('Harap setujui Syarat & Ketentuan serta Protokol Escrow.');
      return;
    }

    const businessTypeLabel =
      businessCategory === 'pabrik'
        ? 'Pabrik Industri / Smelter Peleburan'
        : businessCategory === 'pengepul'
        ? 'Pengepul / Depo Scrap Logam'
        : 'Penjual & Pembeli Biasa / Umum';

    try {
      const res = await apiClient.auth.register({
        name: fullName || 'Pengguna Customer Scrava',
        email: email || `customer_${Date.now()}@scrava.id`,
        phone: phone || '0812-3456-7890',
        companyName: companyName || (businessCategory === 'pabrik' ? 'PT Smelter Baja Nusantara' : 'Depo Logam Mandiri'),
        businessType: businessTypeLabel,
        role: 'customer',
      });
      if (res.user) {
        setCurrentUser(res.user);
      }
    } catch (err) {
      console.warn('API register error:', err);
    }

    setUserRole('customer');
    showToast(`Pendaftaran Customer berhasil! Selamat datang, ${fullName || 'Rekan Customer'}. Akun Anda siap untuk jual & beli.`);
    navigate('dashboard-overview');
  };

  // If in Verification (KYC) mode
  if (initialMode === 'verification') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 font-sans">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verifikasi Legalitas Bisnis (KYC)</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Status entitas perusahaan terverifikasi membuka akses penawaran tanpa batas, kontrak pembelian resmi, dan pencairan escrow otomatis.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Status: Terverifikasi Tier 1</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Dokumen Legalitas Perusahaan
              </h3>

              <div className="p-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-lg text-center cursor-pointer bg-slate-50 transition-colors">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-xs font-semibold text-slate-800">Unggah Nomor Induk Berusaha (NIB) / IUI / Izin Usaha</div>
                <div className="text-[10px] text-slate-500 mt-1">PDF, PNG, JPG maksimal 25MB</div>
              </div>

              <div className="p-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-lg text-center cursor-pointer bg-slate-50 transition-colors">
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-xs font-semibold text-slate-800">Unggah NPWP Perusahaan / SPKP / Bukti Pajak</div>
                <div className="text-[10px] text-slate-500 mt-1">Dokumen resmi tervalidasi Ditjen Pajak</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Kredensial Terverifikasi Saat Ini
              </h3>

              <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Nama Perusahaan:</span>
                  <span className="font-semibold text-slate-900">{currentCompany.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Negara:</span>
                  <span className="font-semibold text-slate-900">{currentCompany.country}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">NPWP / Tax ID:</span>
                  <span className="font-mono font-semibold text-slate-900">{currentCompany.taxId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Rekening Bank Escrow:</span>
                  <span className="font-semibold text-slate-900">{currentCompany.bankAccount}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Status Legalitas:</span>
                  <span className="font-semibold text-emerald-700">Level 6 Lengkap (Akses Penuh Escrow & Tonase Besar)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              onClick={() => showToast('Dokumen pembaruan berhasil dikirim ke petugas kepatuhan hukum.')}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs cursor-pointer"
            >
              Kirim Dokumen Terbaru
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-xs font-sans">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg mb-2.5 shadow-xs">
            S
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="text-xl font-black tracking-tight text-slate-900">Scrava</span>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Bursa Bahan Baku & Scrap Industri
          </p>
        </div>

        {/* Tab Switcher: Masuk vs Daftar */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Masuk ke Akun
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {/* Quick Google / Gmail 1-Click Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full py-2.5 px-4 mb-5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer group"
        >
          {/* Google 4-color G icon */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>
            {activeTab === 'login' ? 'Masuk dengan Google' : 'Daftar Cepat dengan Google'}
          </span>
        </button>

        <div className="relative flex py-1 items-center mb-5">
          <div className="grow border-t border-slate-200"></div>
          <span className="shrink mx-3 text-[11px] text-slate-400 font-medium">atau dengan email</span>
          <div className="grow border-t border-slate-200"></div>
        </div>

        {/* 1. LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* 2 Roles Selector Only */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Pilih Peran Akun (Hanya 2 Role):
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Customer */}
                <button
                  type="button"
                  onClick={() => handleRoleSelectChange('customer')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedLoginRole === 'customer'
                      ? 'bg-emerald-50/90 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">Customer</span>
                    <Store className={`w-4 h-4 ${selectedLoginRole === 'customer' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    Pabrik, Pengepul & Penjual/Pembeli (Lengkap)
                  </div>
                </button>

                {/* 2. Admin */}
                <button
                  type="button"
                  onClick={() => handleRoleSelectChange('admin')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedLoginRole === 'admin'
                      ? 'bg-slate-900 border-slate-900 text-white font-bold ring-2 ring-slate-800/30 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">Admin</span>
                    <Shield className={`w-4 h-4 ${selectedLoginRole === 'admin' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </div>
                  <div className={`text-[10px] leading-tight ${selectedLoginRole === 'admin' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Pengawas bursa, lelang & escrow
                  </div>
                </button>
              </div>

              {/* Quick 1-Click Demo Buttons */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('customer')}
                  className="flex-1 py-1.5 px-2 bg-emerald-100/70 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[11px] font-bold transition-colors text-center cursor-pointer flex items-center justify-center gap-1"
                >
                  <Building2 className="w-3 h-3 text-emerald-700" />
                  <span>Demo Customer</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin')}
                  className="flex-1 py-1.5 px-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg text-[11px] font-bold transition-colors text-center cursor-pointer flex items-center justify-center gap-1"
                >
                  <Shield className="w-3 h-3 text-slate-700" />
                  <span>Demo Admin</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden bg-slate-50/50"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Kata Sandi</label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast('Tautan atur ulang kata sandi telah dikirim ke email.');
                  }}
                  className="text-[11px] text-emerald-700 hover:underline"
                >
                  Lupa sandi?
                </a>
              </div>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden bg-slate-50/50"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{selectedLoginRole === 'admin' ? 'Masuk sebagai Admin' : 'Masuk sebagai Customer'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* 2. UNIFIED CUSTOMER REGISTER FORM (Pabrik, Pengepul, Penjual & Pembeli) */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Daftar Akun Customer
                </label>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                  Akun Lengkap Jual & Beli
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                Satu akun terpadu untuk Pabrik Industri, Depo/Pengepul, dan Penjual/Pembeli Bahan Baku.
              </p>

              {/* Profil Kategori Usaha */}
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Tipe Profil Bisnis:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBusinessCategory('pabrik')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    businessCategory === 'pabrik'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/20 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className={`w-4 h-4 mx-auto mb-1 ${businessCategory === 'pabrik' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div className="text-[11px] leading-tight">Pabrik / Smelter</div>
                </button>

                <button
                  type="button"
                  onClick={() => setBusinessCategory('pengepul')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    businessCategory === 'pengepul'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/20 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Store className={`w-4 h-4 mx-auto mb-1 ${businessCategory === 'pengepul' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div className="text-[11px] leading-tight">Pengepul / Depo</div>
                </button>

                <button
                  type="button"
                  onClick={() => setBusinessCategory('umum')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    businessCategory === 'umum'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/20 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <User className={`w-4 h-4 mx-auto mb-1 ${businessCategory === 'umum' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div className="text-[11px] leading-tight">Pedagang Umum</div>
                </button>
              </div>
            </div>

            {/* Nama Lengkap PIC */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap PIC / Penanggung Jawab *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="cth. Hendra Wijaya"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden bg-slate-50/50"
                required
              />
            </div>

            {/* Nama Perusahaan / Usaha */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Perusahaan / Usaha (PT / CV / Depo) *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={
                  businessCategory === 'pabrik'
                    ? 'cth. PT Cilegon Precision Steel'
                    : businessCategory === 'pengepul'
                    ? 'cth. Depo Scrap Berkah Mandiri'
                    : 'cth. Usaha Logam Lestari'
                }
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden bg-slate-50/50 font-medium"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.co.id"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden bg-slate-50/50"
                required
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor WhatsApp Aktif *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-3456-7890"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden bg-slate-50/50"
                required
              />
            </div>

            {/* Kata Sandi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden bg-slate-50/50"
                required
              />
            </div>

            {/* Terms checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2 text-[11px] text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 text-emerald-600 rounded cursor-pointer"
                />
                <span>
                  Saya menyetujui <strong>Syarat & Ketentuan</strong>, <strong>Jaminan Escrow</strong>, serta <strong>Kebijakan Privasi Scrava</strong>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Daftar Akun Customer Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-500">
          Dilindungi oleh Jaminan Rekber Escrow & Metrologi Legal Indonesia
        </div>
      </div>
    </div>
  );
};
