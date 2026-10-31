import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Send,
  Building,
  CheckCircle2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { IncotermType } from '../../types';

interface RequirementDetailProps {
  id: string;
  navigate: (path: string, params?: any) => void;
}

export const RequirementDetailPage: React.FC<RequirementDetailProps> = ({ id, navigate }) => {
  const { reverseBids, submitRFQOffer, currentCompany, userRole, formatPrice, showToast } = useApp();

  const req = reverseBids.find((r) => r.id === id) || reverseBids[0];

  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quotePrice, setQuotePrice] = useState<number>(req.targetPrice || 7200000);
  const [quoteQty, setQuoteQty] = useState<number>(req.quantity);
  const [quoteIncoterm, setQuoteIncoterm] = useState<IncotermType>(req.incoterm);
  const [quoteTimeline, setQuoteTimeline] = useState('7 hari kerja dari penerbitan rekber escrow');
  const [quoteNotes, setQuoteNotes] = useState('Timbangan bersertifikasi jembatan timbang resmi depo.');

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    submitRFQOffer(req.id, {
      pricePerUnit: quotePrice,
      quantityOffered: quoteQty,
      incoterm: quoteIncoterm,
      deliveryTimeline: quoteTimeline,
      notes: quoteNotes,
    });
    setQuoteModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('reverse-bid')}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Semua Kebutuhan Pabrik</span>
        </button>
        <span className="text-xs font-mono text-slate-400">ID RFQ: {req.id}</span>
      </div>

      {/* Main Details Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {req.category}
              </span>
              <StatusBadge status={req.status} />
              <span className="text-xs text-slate-400">· Batas Waktu: {req.deadline}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {req.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Pabrik Pemohon: <strong>{req.buyerCompany}</strong> ({req.buyerCountry})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Lokasi Kirim: {req.deliveryLocation} ({req.incoterm})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Target Kedatangan: {req.requiredDate}</span>
              </span>
            </div>
          </div>

          <div className="text-left lg:text-right shrink-0">
            <div className="text-xs text-slate-400 uppercase font-medium">Target Budget Beli</div>
            <div className="text-2xl font-extrabold text-emerald-700 font-mono tabular-nums">
              {formatPrice(req.targetPrice, req.unit)}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Volume Kuota: <strong>{req.quantity} {req.unit}</strong>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="mt-6 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Spesifikasi Teknis Permintaan Pabrik
            </h3>
            <div className="p-4 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 leading-relaxed font-mono">
              {req.specifications}
            </div>
          </div>

          {/* Action to submit quote */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-50/60 border border-emerald-200 rounded p-4">
            <div>
              <h4 className="text-xs font-bold text-emerald-950">Apakah Anda depo scrap atau pemilik material terverifikasi?</h4>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Kirim penawaran pasokan resmi lengkap dengan harga, kuota tonase siap kirim, dan jadwal logistik.
              </p>
            </div>
            <button
              onClick={() => setQuoteModalOpen(true)}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs transition-colors whitespace-nowrap"
            >
              Ajukan Penawaran Pasokan (Respon RFQ)
            </button>
          </div>
        </div>
      </div>

      {/* Submitted Seller Responses Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Penawaran Depo yang Masuk ({req.responses.length})
            </h2>
            <p className="text-xs text-slate-500">
              Proposal pemasok terverifikasi yang bersaing untuk kontrak pengadaan pabrik ini
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Jaminan Rekber Escrow
          </span>
        </div>

        {req.responses.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500">
            Belum ada penawaran pemasok yang masuk. Jadilah pemasok terverifikasi pertama yang mengajukan penawaran!
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {req.responses.map((resp) => (
              <div
                key={resp.id}
                className="p-4 border border-slate-200 rounded hover:border-slate-300 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">{resp.sellerCompany}</span>
                    <span className="text-xs text-slate-500">({resp.sellerCountry})</span>
                    <StatusBadge status={resp.status} />
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Komitmen Tonase: <strong>{resp.quantityOffered} {resp.unit}</strong> · Waktu Kirim: {resp.deliveryTimeline}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    Catatan: "{resp.notes}"
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <div className="text-xs text-slate-400">Harga Ditawarkan</div>
                    <div className="text-base font-extrabold text-slate-900 font-mono tabular-nums">
                      {formatPrice(resp.pricePerUnit, resp.unit)}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono">{resp.incoterm}</div>
                  </div>

                  <button
                    onClick={() => {
                      showToast(`Penawaran dari ${resp.sellerCompany} diterima! Membuat draf Surat Pesanan (PO)...`);
                      navigate('dashboard-orders');
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors whitespace-nowrap shadow-xs"
                  >
                    Setujui Kontrak
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quote Submission Modal */}
      {quoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border border-slate-200 p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">
              Ajukan Penawaran Pasokan Resmi
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Merespon: {req.title.slice(0, 45)}...
            </p>

            <form onSubmit={handleSubmitQuote} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Harga Penawaran Anda per {req.unit} (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">Rp</span>
                  <input
                    type="number"
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded font-mono font-semibold"
                    required
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Target budget pabrik: {formatPrice(req.targetPrice, req.unit)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Volume Tonase Siap Pasok ({req.unit})
                </label>
                <input
                  type="number"
                  value={quoteQty}
                  onChange={(e) => setQuoteQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded font-mono font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Syarat Pengiriman (Incoterm)
                </label>
                <select
                  value={quoteIncoterm}
                  onChange={(e) => setQuoteIncoterm(e.target.value as IncotermType)}
                  className="w-full p-2 text-xs border border-slate-300 rounded font-mono"
                >
                  <option value="DDP">DDP - Diantar sampai pintu pabrik pembeli</option>
                  <option value="CIF">CIF - Biaya, Asuransi & Pengiriman ke Pelabuhan</option>
                  <option value="FOB">FOB - Franco Pelabuhan / Depo Muat</option>
                  <option value="EXW">EXW - Pembeli jemput sendiri di gudang depo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimasi Jadwal Pengiriman / Lead Time
                </label>
                <input
                  type="text"
                  value={quoteTimeline}
                  onChange={(e) => setQuoteTimeline(e.target.value)}
                  placeholder="Contoh: 7 hari kerja setelah escrow aktif"
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Spesifikasi & Catatan Hasil Uji Mutu
                </label>
                <textarea
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  rows={2}
                  placeholder="Jelaskan ketebalan, toleransi kadar, dan sertifikat timbangan..."
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuoteModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs"
                >
                  Kirim Penawaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
