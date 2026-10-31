import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/mockData';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  FileQuestion,
  PlusCircle,
  ShieldCheck,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Filter,
  Search,
  DollarSign,
  ChevronRight,
  CheckCircle2,
  X
} from 'lucide-react';
import { ReverseBidRequirement, IncotermType } from '../../types';
import { UpgradeToFactoryModal } from '../../components/common/UpgradeToFactoryModal';

interface ReverseBidPageProps {
  navigate: (path: string, params?: any) => void;
}

export const ReverseBidPage: React.FC<ReverseBidPageProps> = ({ navigate }) => {
  const { reverseBids, addReverseBid, formatPrice, currentCompany, isBuyerVerified, showToast } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [showLegalityModal, setShowLegalityModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [material, setMaterial] = useState('');
  const [grade, setGrade] = useState('');
  const [quantity, setQuantity] = useState<number>(50);
  const [unit, setUnit] = useState('MT');
  const [targetPrice, setTargetPrice] = useState<number>(390);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [requiredDate, setRequiredDate] = useState('2026-10-25');
  const [incoterm, setIncoterm] = useState<IncotermType>('DDP');
  const [specifications, setSpecifications] = useState('');
  const [deadline, setDeadline] = useState('2026-10-10');

  const handleCreateRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    addReverseBid({
      title,
      category,
      material,
      grade,
      quantity,
      unit,
      targetPrice,
      deliveryLocation,
      requiredDate,
      incoterm,
      specifications,
      deadline,
    });
    setModalOpen(false);
    // Reset form
    setTitle('');
    setMaterial('');
    setSpecifications('');
    showToast('Kebutuhan bahan pabrik (RFQ) berhasil diterbitkan!');
  };

  const filteredRequirements = reverseBids.filter((r) => {
    if (selectedCategory !== 'All' && r.category !== selectedCategory) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.material.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Header & Hero */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Pusat Pengadaan & Tender Bahan Pabrik (Dicari Pabrik)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Buka Kebutuhan Bahan. Depo Scrap Bersaing Memberi Penawaran.
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
              Pabrik peleburan dan manufaktur membuka kuota pasokan scrap secara transparan. Ratusan depo terverifikasi mengajukan harga terbaik secara langsung tanpa perantara.
            </p>
          </div>

          <button
            onClick={() => {
              if (!isBuyerVerified) {
                setShowLegalityModal(true);
              } else {
                setModalOpen(true);
              }
            }}
            className="px-5 py-3 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-xs transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Buat Kebutuhan Pabrik (RFQ)</span>
          </button>
        </div>

        {/* 3 Langkah Tender / Dicari Pabrik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-xs text-slate-300">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold font-mono shrink-0">
              1
            </div>
            <div>
              <div className="font-bold text-white">Pasang Spesifikasi Bahan</div>
              <div className="text-slate-400 text-[11px] mt-0.5">Tentukan jenis scrap, tonase target, budget beli, dan lokasi pabrik.</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold font-mono shrink-0">
              2
            </div>
            <div>
              <div className="font-bold text-white">Depo Mengajukan Pasokan</div>
              <div className="text-slate-400 text-[11px] mt-0.5">Depo memasok penuh atau bertahap (*Split Order*) dengan sertifikat uji.</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold font-mono shrink-0">
              3
            </div>
            <div>
              <div className="font-bold text-white">Kirim & Cairkan via Escrow</div>
              <div className="text-slate-400 text-[11px] mt-0.5">Barang ditimbang di jembatan pabrik, uang cair otomatis ke rekening depo.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kebutuhan material atau nama pabrik..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-semibold"
          >
            <option value="All">Semua Kategori Bahan</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Menampilkan {filteredRequirements.length} kebutuhan pengadaan aktif
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-4">
        {filteredRequirements.map((req) => (
          <div
            key={req.id}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-500 transition-all shadow-xs"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {req.id}
                  </span>
                  <span className="text-xs text-slate-500">· {req.category}</span>
                  <span className="text-xs text-slate-400">· Batas Tender: {req.deadline}</span>
                  <StatusBadge status={req.status} />
                </div>

                <h3
                  onClick={() => navigate('requirement-detail', { id: req.id })}
                  className="text-base font-bold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  {req.title}
                </h3>

                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {req.specifications}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pabrik: <strong>{req.buyerCompany}</strong> ({req.buyerCountry})</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tujuan Kirim: {req.deliveryLocation} ({req.incoterm})</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tgl Dibutuhkan: {req.requiredDate}</span>
                  </span>
                </div>
              </div>

              <div className="flex lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-4 pt-4 lg:pt-0 border-t lg:border-0 border-slate-100 shrink-0">
                <div className="text-left lg:text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Total Kuota Tonase</div>
                  <div className="text-base font-black text-slate-900 font-mono tabular-nums">
                    {req.quantity} {req.unit}
                  </div>
                  <div className="text-xs text-slate-500">
                    Target Budget: <strong className="text-emerald-700 font-mono">{formatPrice(req.targetPrice, req.unit)}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('requirement-detail', { id: req.id })}
                    className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>Lihat & Ajukan Penawaran</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Post Requirement Wizard Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Buka Kebutuhan Pengadaan Pabrik (Tender RFQ)
                </h3>
                <p className="text-xs text-slate-500">
                  Depo scrap terverifikasi akan meninjau dan mengirimkan penawaran harga terbaik
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequirement} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Judul Kebutuhan Bahan *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Butuh 150 MT Besi Tua HMS 1 untuk Smelter Induksi"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Kategori Bahan *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Spesifik Grade / Standar</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Contoh: ISRI 200 / Millberry / AISI 304"
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Jumlah Tonase *</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Satuan</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg font-mono"
                  >
                    <option value="MT">MT (Metrik Ton)</option>
                    <option value="KG">KG (Kilogram)</option>
                    <option value="Piece">Unit / Mesin</option>
                    <option value="Lot">Lot Borongan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Target Budget (Rp/unit)</label>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(Number(e.target.value))}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Tujuan Pengiriman Pabrik *</label>
                  <input
                    type="text"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    placeholder="Contoh: Depo Yard Smelter Cilegon / Karawang"
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Syarat Pengiriman (Incoterm)</label>
                  <select
                    value={incoterm}
                    onChange={(e) => setIncoterm(e.target.value as IncotermType)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg font-mono"
                  >
                    <option value="DDP">DDP - Diantar sampai gudang pabrik pembeli</option>
                    <option value="FOB">FOB - Franco Pabrik / Pelabuhan Muat</option>
                    <option value="EXW">EXW - Pabrik jemput langsung di depo penjual</option>
                    <option value="CIF">CIF - Biaya, Asuransi & Pengiriman pelabuhan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Tanggal Diperlukan Pabrik</label>
                  <input
                    type="date"
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Batas Akhir Penawaran Tender</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Spesifikasi Teknis & Toleransi Kadar</label>
                <textarea
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  placeholder="Jelaskan ketebalan potongan, toleransi karat/tanah, syarat uji spektrometri, dan ketentuan uji timbang..."
                  rows={3}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Publikasikan Kebutuhan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <UpgradeToFactoryModal
        isOpen={showLegalityModal}
        onClose={() => setShowLegalityModal(false)}
        onSuccess={() => setModalOpen(true)}
        reasonMessage="Default akun Customer adalah Penjual (Depo Scrap). Untuk menerbitkan kebutuhan pasokan pengadaan pabrik (RFQ), silakan lengkapi nomor NIB & NPWP perusahaan Anda."
      />
    </div>
  );
};
