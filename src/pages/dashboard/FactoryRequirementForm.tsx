import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SAMPLE_IMAGES } from '../../data/mockData';
import { UpgradeToFactoryModal } from '../../components/common/UpgradeToFactoryModal';
import {
  Building2,
  Calendar,
  Scale,
  DollarSign,
  UploadCloud,
  CreditCard,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  AlertCircle
} from 'lucide-react';

interface FactoryRequirementFormProps {
  navigate: (path: string, params?: any) => void;
}

export const FactoryRequirementForm: React.FC<FactoryRequirementFormProps> = ({ navigate }) => {
  const { addReverseBid, currentCompany, isBuyerVerified, showToast, formatPrice } = useApp();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [title, setTitle] = useState('Dibutuhkan Pasokan Besi Scrap HMS 1 untuk Peleburan Induksi');
  const [category, setCategory] = useState('Ferrous Metals');
  const [material, setMaterial] = useState('Heavy Melting Steel (HMS 1)');
  const [grade, setGrade] = useState('ISRI 200 (Min. tebal 6mm)');
  const [quantity, setQuantity] = useState<number>(30); // 30 Ton as requested
  const [unit, setUnit] = useState('MT');
  const [requiredDate, setRequiredDate] = useState('2026-10-15');
  const [targetPricePerTon, setTargetPricePerTon] = useState<number>(7200000); // Rp 7.200.000 / MT
  const [paymentSystem, setPaymentSystem] = useState<'escrow' | 'skbdn' | 'dp_timbang' | 'top14'>('escrow');
  const [deliveryLocation, setDeliveryLocation] = useState('Kawasan Industri Krakatau Steel, Cilegon (Gate 2 Jembatan Timbang)');
  const [specifications, setSpecifications] = useState('Besi scrap tebal minimal 6mm, bebas kotoran tanah/semen < 1%, bebas tabung tertutup & bahan peledak. Uji spektrometri kadar Fe > 95%.');
  const [selectedPhoto, setSelectedPhoto] = useState<string>(SAMPLE_IMAGES.hmsScrap);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const photoOptions = [
    { label: 'Besi Scrap HMS 1', url: SAMPLE_IMAGES.hmsScrap },
    { label: 'Plat Besi Baja', url: SAMPLE_IMAGES.stainlessPlate },
    { label: 'Tembaga Millberry', url: SAMPLE_IMAGES.copperWire },
    { label: 'Aluminium Extrusion', url: SAMPLE_IMAGES.aluminumExtrusion },
  ];

  const totalBudget = quantity * targetPricePerTon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBuyerVerified) {
      setShowUpgradeModal(true);
      return;
    }
    setIsSubmitting(true);

    const newReq = {
      title,
      category,
      material,
      grade,
      quantity: Number(quantity),
      unit,
      targetPrice: targetPricePerTon,
      currency: 'IDR',
      deliveryLocation,
      requiredDate,
      incoterm: 'DDP' as const,
      specifications: `${specifications} | Sistem Pembayaran: ${paymentSystem.toUpperCase()}`,
      deadline: requiredDate,
    };

    addReverseBid(newReq);
    setIsSubmitting(false);
    showToast(`Kebutuhan pasokan ${quantity} ${unit} besi scrap berhasil diterbitkan ke bursa!`);
    navigate('dashboard-orders');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Form Pengadaan Pasokan Pabrik</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Buat Kebutuhan Pasokan Barang
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Terbitkan permintaan pasokan material pabrik (misal: 30 ton besi per tanggal tertentu) dengan spesifikasi, target harga, dan sistem pembayaran resmi.
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <div className="text-[11px] text-slate-400 font-semibold">Perusahaan Pemohon:</div>
          <div className="text-xs font-bold text-slate-900">{currentCompany.name}</div>
        </div>
      </div>

      {!isBuyerVerified && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 text-sm">Verifikasi Legalitas Diperlukan untuk Menerbitkan RFQ Pabrik</span>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                Default akun Customer adalah Penjual (Depo Scrap). Untuk menerbitkan kebutuhan pengadaan pabrik resmi, Anda wajib melengkapi data legalitas PT/CV (NIB & NPWP).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Lengkapi Legalitas Sekarang
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Informasi Kebutuhan & Tanggal */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>1. Detail Pasokan & Jadwal Kebutuhan</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Judul Pengadaan / Kebutuhan *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="cth. Butuh Pasokan Besi Scrap HMS 1 Pabrik Peleburan"
              required
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 bg-slate-50/50 font-semibold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori Material *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 bg-slate-50/50 font-medium"
              >
                <option value="Ferrous Metals">Besi & Baja (Ferrous)</option>
                <option value="Copper">Tembaga (Copper)</option>
                <option value="Aluminum">Aluminium (Aluminum)</option>
                <option value="Plastics">Plastik Daur Ulang</option>
                <option value="Industrial Machinery">Mesin Industri</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jumlah / Tonase Dibutuhkan *
              </label>
              <div className="flex">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="30"
                  required
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-l-lg focus:outline-hidden focus:border-emerald-600 bg-slate-50/50 font-bold text-slate-900"
                />
                <span className="p-2.5 bg-slate-100 border border-l-0 border-slate-300 rounded-r-lg text-xs font-bold text-slate-600">
                  {unit}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Pasokan Harus Sampai *
              </label>
              <input
                type="date"
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                required
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 bg-slate-50/50 font-semibold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Harga Beli Pabrik (Rp per Ton) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  step="50000"
                  value={targetPricePerTon}
                  onChange={(e) => setTargetPricePerTon(Number(e.target.value))}
                  placeholder="7200000"
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 bg-slate-50/50 font-mono font-bold text-emerald-800 text-base"
                />
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Setara: <strong>Rp {new Intl.NumberFormat('id-ID').format(targetPricePerTon / 1000)} / Kg</strong>
              </div>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3 flex flex-col justify-center">
              <div className="text-[11px] text-emerald-800 font-semibold">Total Estimasi Anggaran Pengadaan:</div>
              <div className="text-lg font-black font-mono text-emerald-900 mt-0.5">
                {formatPrice(totalBudget)}
              </div>
              <div className="text-[10px] text-emerald-700 mt-0.5">
                Untuk {quantity} Ton @ {formatPrice(targetPricePerTon)}/Ton
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Spesifikasi & Foto Contoh */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>2. Spesifikasi Teknis & Gambar Referensi</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Spesifikasi Teknis & Kualitas Mutu *
            </label>
            <textarea
              rows={3}
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
              placeholder="Jelaskan ketebalan, toleransi kotoran, kadar logam, standar ISRI, atau syarat potongan..."
              required
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 bg-slate-50/50 leading-relaxed text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Pilih Foto Referensi Material:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {photoOptions.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPhoto(opt.url)}
                  className={`p-2 rounded-xl border text-left transition-all overflow-hidden ${
                    selectedPhoto === opt.url
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/50'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                  }`}
                >
                  <img
                    src={opt.url}
                    alt={opt.label}
                    className="w-full h-20 object-cover rounded-lg mb-1.5"
                  />
                  <div className="text-[11px] font-bold text-slate-800 truncate">{opt.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Sistem Pembayaran & Lokasi Pabrik */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>3. Sistem Pembayaran & Lokasi Pengiriman</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Pilih Sistem Pembayaran Pabrik *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'escrow',
                  title: 'Escrow Scrava (Timbang Bayar)',
                  desc: 'Dana dititip di rekening escrow resmi, cair seketika setelah truk timbang di pabrik dan lolos QC.',
                  badge: 'Paling Diminati Penjual',
                },
                {
                  id: 'dp_timbang',
                  title: 'DP 20% + Pelunasan Setelah Timbang',
                  desc: 'Uang muka 20% saat truk muat dari gudang penjual, sisa 80% lunas H+1 setelah timbang terima.',
                  badge: 'Fleksibel',
                },
                {
                  id: 'skbdn',
                  title: 'SKBDN / L/C Bank Domestik',
                  desc: 'Surat Kredit Berdokumen Dalam Negeri dengan jaminan bank BUMN/Swasta nasional.',
                  badge: 'Kontrak Besar',
                },
                {
                  id: 'top14',
                  title: 'Term of Payment (TOP 14 Hari)',
                  desc: 'Pembayaran invoice tempo 14 hari kerja khusus pabrik yang telah lolos verifikasi kredit Scrava.',
                  badge: 'Khusus Pabrik Tier-1',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentSystem(opt.id as any)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    paymentSystem === opt.id
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">{opt.title}</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alamat Pabrik & Gate Timbangan *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                placeholder="cth. Kawasan Industri Krakatau Steel, Cilegon Gate 2"
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 bg-slate-50/50 font-medium text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('dashboard-orders')}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md flex items-center gap-2 transition-all hover:translate-y-[-1px]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Terbitkan Kebutuhan Barang ({quantity} Ton)</span>
          </button>
        </div>
      </form>

      <UpgradeToFactoryModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reasonMessage="Akun Anda terdaftar sebagai Penjual (Depo Scrap). Untuk menerbitkan kebutuhan pengadaan bahan baku pabrik (RFQ), silakan lengkapi legalitas PT/CV & NIB perusahaan Anda."
      />
    </div>
  );
};
