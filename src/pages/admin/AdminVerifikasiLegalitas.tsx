import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Building2,
  ExternalLink,
  Search,
  Eye,
  Check,
  X,
  FileText,
  Clock,
  Landmark,
  Scale
} from 'lucide-react';

interface KycVerificationItem {
  id: string;
  companyName: string;
  businessType: string;
  city: string;
  submittedAt: string;
  nibNumber: string;
  npwpNumber: string;
  iuiNumber: string;
  kemenkumhamSk: string;
  bankAccount: string;
  weighbridgeCert: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  notes?: string;
}

const INITIAL_VERIFICATIONS: KycVerificationItem[] = [
  {
    id: 'VERIF-881',
    companyName: 'PT Mandiri Daur Aluminium',
    businessType: 'Peleburan Aluminium & Remelting',
    city: 'Semarang, Jawa Tengah',
    submittedAt: 'Hari ini, 09:20 WIB',
    nibNumber: '9120008819201 (13 Digit Terdaftar OSS)',
    npwpNumber: '02.441.992.4-503.000',
    iuiNumber: 'IUI-KEMENPERIN/503/4819/2022',
    kemenkumhamSk: 'AHU-0044910.AH.01.01.TAHUN 2020',
    bankAccount: 'Bank Central Asia (BCA) - 018-992-1200 a/n PT Mandiri Daur Aluminium',
    weighbridgeCert: 'Tera Metrologi Legal No. 441/ML/SMG/2026 (Kapasitas 80 Ton)',
    status: 'PENDING',
    notes: 'Menunggu review dokumen legalitas oleh Superadmin.',
  },
  {
    id: 'VERIF-880',
    companyName: 'PT Indo Pelletizer Plastik Gemilang',
    businessType: 'Daur Ulang Plastik Industri',
    city: 'Karawang, Jawa Barat',
    submittedAt: 'Kemarin, 15:40 WIB',
    nibNumber: '8129001128394 (13 Digit Terdaftar OSS)',
    npwpNumber: '01.992.883.1-432.000',
    iuiNumber: 'IUI-504/PLASTIK/KRW/2021',
    kemenkumhamSk: 'AHU-0019283.AH.01.01.TAHUN 2019',
    bankAccount: 'Bank Mandiri - 132-00-998811-2 a/n PT Indo Pelletizer Plastik',
    weighbridgeCert: 'Tera Metrologi Legal No. 219/ML/KRW/2025 (Kapasitas 60 Ton)',
    status: 'VERIFIED',
    notes: 'Legalitas telah dicek dan terverifikasi penuh.',
  },
  {
    id: 'VERIF-879',
    companyName: 'CV Tembaga Murni Sentosa',
    businessType: 'Peleburan Tembaga Scrap',
    city: 'Mojokerto, Jawa Timur',
    submittedAt: '25 Sep 2026',
    nibNumber: '0129003348192',
    npwpNumber: '03.882.112.5-601.000',
    iuiNumber: 'IUI-229/MOJOKERTO/2020',
    kemenkumhamSk: 'AHU-0099182.AH.01.01.TAHUN 2021',
    bankAccount: 'Bank BNI - 082-991-2291 a/n CV Tembaga Murni Sentosa',
    weighbridgeCert: 'Masa berlaku kalibrasi tera timbangan telah kadaluarsa',
    status: 'REJECTED',
    notes: 'Sertifikat tera jembatan timbang kadaluarsa. Mohon lampirkan hasil kalibrasi terbaru.',
  },
];

export const AdminVerifikasiLegalitas: React.FC = () => {
  const { showToast, toggleBuyerVerification } = useApp();
  const [items, setItems] = useState<KycVerificationItem[]>(INITIAL_VERIFICATIONS);
  const [selectedItem, setSelectedItem] = useState<KycVerificationItem | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');

  // Checklist state for modal review
  const [checkNib, setCheckNib] = useState(true);
  const [checkNpwp, setCheckNpwp] = useState(true);
  const [checkIui, setCheckIui] = useState(true);
  const [checkSk, setCheckSk] = useState(true);
  const [checkScale, setCheckScale] = useState(true);
  const [checkBank, setCheckBank] = useState(true);
  const [rejectReason, setRejectReason] = useState('');

  const filteredItems = items.filter((item) => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  const handleOpenReview = (item: KycVerificationItem) => {
    setSelectedItem(item);
    setCheckNib(true);
    setCheckNpwp(true);
    setCheckIui(true);
    setCheckSk(true);
    setCheckScale(item.status !== 'REJECTED');
    setCheckBank(true);
    setRejectReason(item.notes || '');
  };

  const handleApprove = (id: string) => {
    setItems(
      items.map((i) =>
        i.id === id
          ? {
              ...i,
              status: 'VERIFIED',
              notes: 'Legalitas perusahaan telah dicek dan dinyatakan sah oleh Superadmin.',
            }
          : i
      )
    );
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
    toggleBuyerVerification(true);
    showToast(`Akun pabrik ${selectedItem?.companyName || ''} berhasil diverifikasi dan disetujui sebagai Pembeli Aktif!`);
  };

  const handleReject = (id: string) => {
    setItems(
      items.map((i) =>
        i.id === id
          ? {
              ...i,
              status: 'REJECTED',
              notes: rejectReason || 'Dokumen belum memenuhi syarat verifikasi bursa.',
            }
          : i
      )
    );
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
    showToast(`Pengajuan verifikasi ${selectedItem?.companyName || ''} ditolak / diminta revisi.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Verifikasi Akun Pabrik & Pembeli (Legalitas)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Validasi NIB 13 digit OSS, NPWP Ditjen Pajak, izin industri (IUI), SK Kemenkumham, dan jembatan timbang pabrik
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                filter === st
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL'
                ? 'Semua'
                : st === 'PENDING'
                ? 'Menunggu Review'
                : st === 'VERIFIED'
                ? 'Terverifikasi'
                : 'Ditolak'}
            </button>
          ))}
        </div>
      </div>

      {/* List Verification Items */}
      <div className="grid grid-cols-1 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {item.id}
                </span>
                <h3 className="text-base font-bold text-slate-900">{item.companyName}</h3>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    item.status === 'VERIFIED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : item.status === 'PENDING'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {item.status === 'VERIFIED'
                    ? 'Terverifikasi Resmi'
                    : item.status === 'PENDING'
                    ? 'Menunggu Pengecekan'
                    : 'Ditolak / Butuh Revisi'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                <div>
                  <span className="text-slate-400 font-medium">NIB OSS: </span>
                  <span className="font-mono font-semibold text-slate-900">{item.nibNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">NPWP: </span>
                  <span className="font-mono font-semibold text-slate-900">{item.npwpNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Fasilitas / Kota: </span>
                  <span className="font-semibold text-slate-900">{item.city}</span>
                </div>
              </div>

              {item.notes && (
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{item.notes}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0">
              <button
                onClick={() => handleOpenReview(item)}
                className="px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Cek Detail Legalitas</span>
              </button>

              {item.status === 'PENDING' && (
                <button
                  onClick={() => handleApprove(item.id)}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Verifikasi (OK)</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Review Detail Legalitas */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Audit & Verifikasi Dokumen Legalitas Pabrik
                  </h3>
                  <p className="text-xs text-slate-500">{selectedItem.companyName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 pb-2 border-b border-slate-200 flex items-center justify-between">
                  <span>Hasil Pengecekan Dokumen Hukum:</span>
                  <span className="text-[11px] text-slate-500 font-normal">Ceklis dokumen valid</span>
                </div>

                {/* 1. NIB */}
                <label className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={checkNib}
                    onChange={(e) => setCheckNib(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">1. Nomor Induk Berusaha (NIB OSS 13 Digit)</div>
                    <div className="font-mono text-slate-600 mt-0.5">{selectedItem.nibNumber}</div>
                  </div>
                </label>

                {/* 2. NPWP */}
                <label className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={checkNpwp}
                    onChange={(e) => setCheckNpwp(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">2. NPWP Badan Usaha (Valid Ditjen Pajak)</div>
                    <div className="font-mono text-slate-600 mt-0.5">{selectedItem.npwpNumber}</div>
                  </div>
                </label>

                {/* 3. Izin Usaha Industri */}
                <label className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={checkIui}
                    onChange={(e) => setCheckIui(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">3. Izin Usaha Industri (IUI) / Amdal Lingkungan</div>
                    <div className="font-mono text-slate-600 mt-0.5">{selectedItem.iuiNumber}</div>
                  </div>
                </label>

                {/* 4. SK Kemenkumham */}
                <label className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={checkSk}
                    onChange={(e) => setCheckSk(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">4. SK Pengesahan Kemenkumham Akta Pendirian</div>
                    <div className="font-mono text-slate-600 mt-0.5">{selectedItem.kemenkumhamSk}</div>
                  </div>
                </label>

                {/* 5. Jembatan Timbang */}
                <label className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={checkScale}
                    onChange={(e) => setCheckScale(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">5. Sertifikasi Jembatan Timbang (Metrologi Legal)</div>
                    <div className="font-mono text-slate-600 mt-0.5">{selectedItem.weighbridgeCert}</div>
                  </div>
                </label>

                {/* 6. Rekening Bank */}
                <label className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={checkBank}
                    onChange={(e) => setCheckBank(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">6. Rekening Bank Penampung Resmi PT</div>
                    <div className="font-mono text-slate-600 mt-0.5">{selectedItem.bankAccount}</div>
                  </div>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Auditor / Alasan Penolakan (Jika ditolak/revisi)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={2}
                  placeholder="Lampirkan dokumen tera timbangan terbaru atau lengkapi NPWP..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleReject(selectedItem.id)}
                  className="px-4 py-2 font-bold text-rose-700 hover:bg-rose-50 border border-rose-300 rounded-lg flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Tolak / Minta Revisi Dokumen</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedItem.id)}
                    className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Setujui & Verifikasi Akun Pabrik</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
