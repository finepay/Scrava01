import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  MapPin,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';

interface AdminBuyerManagerProps {
  navigate: (path: string, params?: any) => void;
}

export const AdminBuyerManager: React.FC<AdminBuyerManagerProps> = ({ navigate }) => {
  const { showToast, formatPrice } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [buyersList, setBuyersList] = useState([
    {
      id: 'BUYER-01',
      companyName: 'PT Cilegon Precision Steel',
      businessType: 'Smelter Peleburan Baja Induksi',
      nib: '9120003418902',
      npwp: '01.992.112.8-041.000',
      address: 'Kawasan Industri Krakatau Steel Kav. 12, Cilegon, Banten',
      pic: 'Ir. Hendra Wijaya',
      phone: '0812-9876-5432',
      email: 'procurement@cilegonsteel.co.id',
      verifiedStatus: 'VERIFIED',
      creditLimitIDR: 5000000000, // Rp 5 Miliar
      totalOrdersMT: 450,
      joinedDate: '12 Jan 2026',
    },
    {
      id: 'BUYER-02',
      companyName: 'PT Karawang Surya Foundry',
      businessType: 'Pengecoran Logam & Suku Cadang',
      nib: '8120009923141',
      npwp: '02.441.778.2-408.000',
      address: 'Kawasan Industri KIIC Lot C-4, Karawang Barat',
      pic: 'Rian Prasetyo, S.T.',
      phone: '0813-1122-3344',
      email: 'purchasing@suryafoundry.co.id',
      verifiedStatus: 'VERIFIED',
      creditLimitIDR: 3000000000, // Rp 3 Miliar
      totalOrdersMT: 280,
      joinedDate: '05 Feb 2026',
    },
    {
      id: 'BUYER-03',
      companyName: 'PT Surabaya Smelting Nusantara',
      businessType: 'Pabrik Peleburan Tembaga & Kuningan',
      nib: '7120001124589',
      npwp: '03.882.109.1-602.000',
      address: 'Kawasan Industri SIER Rungkut, Surabaya',
      pic: 'Budi Santoso',
      phone: '0811-3456-7890',
      email: 'rawmaterial@smeltingnusantara.com',
      verifiedStatus: 'PENDING_APPROVAL',
      creditLimitIDR: 1500000000, // Rp 1.5 Miliar
      totalOrdersMT: 0,
      joinedDate: '27 Sep 2026',
    },
    {
      id: 'BUYER-04',
      companyName: 'CV Duta Baja Makmur',
      businessType: 'Pengolahan Scrap & Billet',
      nib: '9120008812377',
      npwp: '01.554.891.4-013.000',
      address: 'Jl. Raya Industri Narogong KM 14, Bekasi',
      pic: 'Agus Salim',
      phone: '0817-6655-4433',
      email: 'admin@dutabajamakmur.co.id',
      verifiedStatus: 'PENDING_APPROVAL',
      creditLimitIDR: 500000000,
      totalOrdersMT: 0,
      joinedDate: '28 Sep 2026',
    },
  ]);

  const handleApprove = (id: string, name: string) => {
    setBuyersList((prev) =>
      prev.map((b) => (b.id === id ? { ...b, verifiedStatus: 'VERIFIED' } : b))
    );
    showToast(`Pabrik pembeli ${name} berhasil diverifikasi! Limit transaksi aktif.`);
  };

  const filteredBuyers = buyersList.filter((b) => {
    const matchSearch =
      b.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.pic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || b.verifiedStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Manage Buyer (Pabrik & Smelter Pembeli)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verifikasi legalitas pabrik, NIB, NPWP, kuota beli transaksi, dan kelayakan fasilitas jembatan timbang
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
            Total Buyer Terdaftar: <strong>{buyersList.length} Pabrik</strong>
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama pabrik, PIC pengadaan, atau kota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-600 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-600 shrink-0">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-hidden focus:border-emerald-600"
          >
            <option value="all">Semua Status</option>
            <option value="VERIFIED">Terverifikasi</option>
            <option value="PENDING_APPROVAL">Menunggu Persetujuan (Pending)</option>
          </select>
        </div>
      </div>

      {/* Buyer Cards / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBuyers.map((buyer) => (
          <div
            key={buyer.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{buyer.companyName}</span>
                      {buyer.verifiedStatus === 'VERIFIED' && (
                        <span title="Pabrik Terverifikasi">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-slate-500 font-medium">{buyer.businessType}</div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                    buyer.verifiedStatus === 'VERIFIED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                  }`}
                >
                  {buyer.verifiedStatus === 'VERIFIED' ? 'Terverifikasi' : 'Menunggu Approval'}
                </span>
              </div>

              {/* Legal & Contact Info */}
              <div className="space-y-1.5 py-3 border-y border-slate-100 text-xs text-slate-600">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-slate-400">NIB: </span>
                    <span className="font-mono font-semibold text-slate-800">{buyer.nib}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">NPWP: </span>
                    <span className="font-mono font-semibold text-slate-800">{buyer.npwp}</span>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-600 leading-snug">{buyer.address}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{buyer.pic} ({buyer.phone})</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{buyer.email}</span>
                  </div>
                </div>
              </div>

              {/* Commercial Stats */}
              <div className="mt-3 p-3 bg-slate-50 rounded-lg grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Batas Transaksi (Rupiah):</div>
                  <div className="font-bold text-emerald-700 font-mono mt-0.5">
                    {formatPrice(buyer.creditLimitIDR)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Total Pasokan Masuk:</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5">
                    {buyer.totalOrdersMT} MT (Metrik Ton)
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 flex items-center justify-between gap-2">
              <button
                onClick={() => showToast(`Dokumen NIB & SIUP ${buyer.companyName} terverifikasi resmi oleh Kemenperin.`)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Lihat Dokumen Legal</span>
              </button>

              {buyer.verifiedStatus === 'PENDING_APPROVAL' ? (
                <button
                  onClick={() => handleApprove(buyer.id, buyer.companyName)}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Setujui Pembeli</span>
                </button>
              ) : (
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Pabrik Aktif Beli</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
