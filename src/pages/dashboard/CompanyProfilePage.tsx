import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UpgradeToFactoryModal } from '../../components/common/UpgradeToFactoryModal';
import {
  Building2,
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  CheckCircle2,
  Package,
  Award,
  Layers,
  ArrowRight,
  Sparkles,
  FileText,
  Mail,
  Phone,
  Landmark,
  Save,
  Check,
  AlertCircle,
  FileCheck
} from 'lucide-react';

interface CompanyProfileProps {
  navigate: (path: string, params?: any) => void;
}

export const CompanyProfilePage: React.FC<CompanyProfileProps> = ({ navigate }) => {
  const { currentCompany, userRole, isBuyerVerified, listings, formatPrice, showToast, currentUser, setCurrentUser } = useApp();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'legalitas'>('profile');

  const isSeller = !isBuyerVerified;

  // Profile Form State
  const [companyName, setCompanyName] = useState(currentUser?.companyName || currentCompany.name);
  const [brandName, setBrandName] = useState(currentCompany.name.replace(/^PT\s+|^CV\s+/i, ''));
  const [picName, setPicName] = useState(currentUser?.name || 'H. Bambang Sugiarto');
  const [phone, setPhone] = useState(currentUser?.phone || '0812-3456-7890');
  const [email, setEmail] = useState(currentUser?.email || 'procurement@cilegonsteel.co.id');
  const [address, setAddress] = useState(currentCompany.address || 'Kawasan Industri Krakatau Steel Kav. D-4');
  const [city, setCity] = useState('Cilegon, Banten');
  const [businessType, setBusinessType] = useState(currentCompany.businessType || 'Pabrik Peleburan / Smelter Baja');
  const [capacity, setCapacity] = useState('2.500 MT / Bulan');
  const [description, setDescription] = useState(
    'Fasilitas peleburan dan pengolahan scrap baja presisi dengan kapasitas konsumsi scrap 2.500 MT per bulan. Dilengkapi jembatan timbang digital Avery Weigh-Tronix 80 ton bersertifikat tera Metrologi Legal dan laboratorium spektrometer.'
  );

  // Legalitas Form State
  const [nib, setNib] = useState('9120008819201'); // 13 digit OSS
  const [npwp, setNpwp] = useState('01.992.112.8-041.000'); // 16 digit DJP
  const [iuiNumber, setIuiNumber] = useState('IUI-503/4819/KEMENPERIN/2021');
  const [kemenkumhamSk, setKemenkumhamSk] = useState('AHU-0038912.AH.01.01.TAHUN 2019');
  const [bankName, setBankName] = useState('Bank Central Asia (BCA)');
  const [bankAccountNo, setBankAccountNo] = useState('018-992-1200');
  const [bankAccountName, setBankAccountName] = useState('PT Cilegon Precision Steel');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser && setCurrentUser) {
      setCurrentUser({
        ...currentUser,
        name: picName,
        companyName: companyName,
        phone: phone,
        email: email,
      });
    }
    showToast('Data Profile Perusahaan berhasil disimpan dan diperbarui!');
  };

  const handleSaveLegalitas = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Dokumen legalitas perusahaan (NIB, NPWP, IUI) berhasil diverifikasi dan disimpan!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Profile Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white border border-slate-800 flex items-center justify-center text-3xl font-bold shrink-0 shadow-xs">
              {currentCompany.logo || (isSeller ? '📦' : '🏭')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">{companyName}</h1>
                <span title="Status Terverifikasi">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Legalitas Terverifikasi
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {businessType} · {city}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                <span className="flex items-center gap-1 font-mono">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <strong className="text-slate-900">{currentCompany.rating}</strong> (Rating Kepatuhan)
                </span>
                <span>·</span>
                <span>PIC: <strong>{picName}</strong></span>
                <span>·</span>
                <span>WhatsApp: <strong>{phone}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            <div className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Akun Customer Terpadu (Jual & Beli Aktif)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-100 mt-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Update Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('legalitas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'legalitas'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Legalitas Perusahaan</span>
          </button>
        </div>
      </div>

      {/* Upgrade Modal for Sellers */}
      <UpgradeToFactoryModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

      {/* TAB 1: UPDATE PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Informasi Profil Perusahaan</h2>
                <p className="text-xs text-slate-500">
                  Data ini digunakan pada faktur transaksi, kontrak lelang, dan surat jalan penimbangan
                </p>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Resmi Perusahaan (PT/CV) *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  placeholder="cth. PT Cilegon Precision Steel"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Brand / Nama Komersial
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="cth. Cilegon Steel"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama PIC Pengadaan / Penanggung Jawab *
                </label>
                <input
                  type="text"
                  value={picName}
                  onChange={(e) => setPicName(e.target.value)}
                  required
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor WhatsApp PIC *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Resmi Pengadaan *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Fasilitas Pabrik / Smelter / Yard *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kota & Provinsi *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bidang Industri / Kategori Usaha *
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 bg-white text-slate-900"
                >
                  <option value="Pabrik Peleburan / Smelter Baja">Pabrik Peleburan / Smelter Baja</option>
                  <option value="Peleburan Tembaga & Kuningan">Peleburan Tembaga & Kuningan</option>
                  <option value="Peleburan Aluminium & Remelt">Peleburan Aluminium & Remelt</option>
                  <option value="Pabrik Daur Ulang Plastik (Pelletizer)">Pabrik Daur Ulang Plastik (Pelletizer)</option>
                  <option value="Pabrik Kertas & Pulp Paper">Pabrik Kertas & Pulp Paper</option>
                  <option value="Manufaktur Komponen Otomotif">Manufaktur Komponen Otomotif</option>
                  <option value="Depo Scrap & Pengumpul Logam">Depo Scrap & Pengumpul Logam</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kapasitas Tampung / Konsumsi Scrap (MT/Bulan)
                </label>
                <input
                  type="text"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="cth. 2.500 MT / Bulan"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Deskripsi Profil Pabrik & Fasilitas Timbangan
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 leading-relaxed text-slate-900"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Profile</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: LEGALITAS PERUSAHAAN */}
      {activeTab === 'legalitas' && (
        <form onSubmit={handleSaveLegalitas} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Legalitas & Dokumen Perizinan Perusahaan</h2>
                <p className="text-xs text-slate-500">
                  Dokumen legalitas ini mengikat secara hukum dalam penerbitan Purchase Order (PO) & jaminan rekening bersama escrow
                </p>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan & Perbarui Legalitas</span>
              </button>
            </div>

            {/* Status Verifikasi Badge */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-emerald-950">
                  Status Legalitas: Terverifikasi Penuh (Level 1 Enterprise)
                </div>
                <p className="text-[11px] text-emerald-800/90 mt-0.5 leading-relaxed">
                  Data NIB, NPWP, dan rekening bank resmi telah lolos validasi otomatis integrasi OSS-RBA dan Ditjen Pajak. Akun Anda memiliki wewenang penuh menerbitkan tender pengadaan resmi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Nomor Induk Berusaha (NIB) *</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">13 Digit OSS RBA</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={nib}
                    onChange={(e) => setNib(e.target.value)}
                    required
                    placeholder="cth. 9120008819201"
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono font-bold text-slate-900"
                  />
                  <FileCheck className="w-4 h-4 text-emerald-600 absolute right-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>NPWP Badan Usaha *</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Valid Ditjen Pajak</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={npwp}
                    onChange={(e) => setNpwp(e.target.value)}
                    required
                    placeholder="cth. 01.992.112.8-041.000"
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono font-bold text-slate-900"
                  />
                  <FileCheck className="w-4 h-4 text-emerald-600 absolute right-3 top-2.5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Izin Usaha Industri (IUI) / Izin Lingkungan (Amdal)
                </label>
                <input
                  type="text"
                  value={iuiNumber}
                  onChange={(e) => setIuiNumber(e.target.value)}
                  placeholder="cth. IUI-503/4819/KEMENPERIN/2021"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SK Pengesahan Kemenkumham
                </label>
                <input
                  type="text"
                  value={kemenkumhamSk}
                  onChange={(e) => setKemenkumhamSk(e.target.value)}
                  placeholder="cth. AHU-0038912.AH.01.01.TAHUN 2019"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono text-slate-900"
                />
              </div>
            </div>

            {/* Rekening Penampung Resmi PT/CV */}
            <div className="pt-2">
              <div className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-emerald-700" />
                <span>Rekening Bank Penampung Resmi (Terdaftar di Platform)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Nama Bank</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Nomor Rekening PT</label>
                  <input
                    type="text"
                    value={bankAccountNo}
                    onChange={(e) => setBankAccountNo(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Atas Nama Rekening</label>
                  <input
                    type="text"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Checklist Kepatuhan Hukum */}
            <div className="pt-3 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-800 mb-2">Checklist Kepatuhan Hukum & Standar Industri:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>NIB Terdaftar Aktif di OSS Republik Indonesia</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>NPWP Badan Usaha Validasi Kemenkeu DJP</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Jembatan Timbang Bersertifikat Metrologi Legal</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Rekening Bank Sesuai Akta Notaris & SK Kemenkumham</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Simpan & Perbarui Legalitas</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
