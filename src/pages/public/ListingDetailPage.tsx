import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { UpgradeToFactoryModal } from '../../components/common/UpgradeToFactoryModal';
import {
  ShieldCheck,
  MapPin,
  FileText,
  Clock,
  ArrowLeft,
  DollarSign,
  Truck,
  Building,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Scale,
  Download,
  Share2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { IncotermType } from '../../types';

interface ListingDetailProps {
  id: string;
  navigate: (path: string, params?: any) => void;
}

export const ListingDetailPage: React.FC<ListingDetailProps> = ({ id, navigate }) => {
  const { listings, formatPrice, isBuyerVerified, sendNegotiationOffer, openOffPlatformWarning, showToast } = useApp();

  const listing = listings.find((l) => l.id === id) || listings[0];
  const [activePhoto, setActivePhoto] = useState<string>(listing.photos[0] || '');
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [showLegalityModal, setShowLegalityModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState<number>(listing.pricePerUnit);
  const [offerQty, setOfferQty] = useState<number>(listing.quantity);
  const [offerIncoterm, setOfferIncoterm] = useState<IncotermType>(listing.incoterm);
  const [offerNotes, setOfferNotes] = useState<string>('');

  const handleMakeOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOfferModalOpen(false);
    showToast(`Penawaran resmi sebesar ${formatPrice(offerPrice, listing.unit)} telah dikirim ke ${listing.seller.companyName}. Membuka ruang negosiasi...`);
    navigate('dashboard-negotiations');
  };

  const handleBuyNow = () => {
    if (!isBuyerVerified) {
      setShowLegalityModal(true);
      return;
    }
    navigate('checkout', { id: listing.id });
  };

  const handleOpenOfferModal = () => {
    if (!isBuyerVerified) {
      setShowLegalityModal(true);
      return;
    }
    setOfferModalOpen(true);
  };

  const similarListings = listings.filter((l) => l.id !== listing.id && l.category === listing.category).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('marketplace')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Marketplace</span>
        </button>

        <div className="text-xs text-slate-400 font-mono">
          Lot ID: {listing.id} · Incoterm: {listing.incoterm}
        </div>
      </div>

      {/* Main 2-Column Product Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-16/10 bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 relative shadow-xs">
            <img
              src={activePhoto || listing.photos[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <StatusBadge status={listing.listingType} />
              <StatusBadge status={listing.condition} />
            </div>
            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-mono px-2.5 py-1 rounded-lg border border-slate-700">
              {listing.incoterm}
            </div>
          </div>

          {/* Thumbnails */}
          {listing.photos.length > 1 && (
            <div className="flex gap-2">
              {listing.photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhoto(photo)}
                  className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    activePhoto === photo ? 'border-emerald-600 ring-2 ring-emerald-100' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Deskripsi Material */}
          {listing.description && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-6 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100 uppercase tracking-wider">
                Deskripsi & Catatan Penjual
              </h3>
              <p className="mt-3 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          )}

          {/* Detailed Specification Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-8 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 pb-3 border-b border-slate-100 uppercase tracking-wider">
              Spesifikasi Teknis Material & Hasil Uji
            </h3>
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs">
              {Object.entries(listing.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1.5 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">{key}:</dt>
                  <dd className="text-slate-900 font-bold font-mono text-right">{value}</dd>
                </div>
              ))}
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <dt className="text-slate-500 font-medium">Kondisi Material:</dt>
                <dd className="text-slate-900 font-bold">{listing.condition}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <dt className="text-slate-500 font-medium">Incoterm:</dt>
                <dd className="text-slate-900 font-bold font-mono">{listing.incoterm}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <dt className="text-slate-500 font-medium">Lokasi Pelabuhan / Depo:</dt>
                <dd className="text-slate-900 font-bold">{listing.location.port || 'Depo Asal'}</dd>
              </div>
            </dl>
          </div>

          {/* Documents & Verification Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 pb-3 border-b border-slate-100 uppercase tracking-wider">
              Dokumen Terverifikasi & Sertifikat Uji Lab
            </h3>
            <div className="mt-4 space-y-2">
              {listing.documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold text-slate-900">{doc}</div>
                      <div className="text-[10px] text-slate-500">Dokumen PDF tervalidasi tanda tangan digital</div>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast(`Mengunduh sertifikat tervalidasi: ${doc}`)}
                    className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Primary Trade CTAs, Seller Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-emerald-700">{listing.category}</span>
                {listing.isPaidPromotion && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Iklan Prioritas Bursa
                  </span>
                )}
              </div>
              <span className="text-slate-400 font-mono text-[11px]">Tayang: {listing.createdAt}</span>
            </div>

            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
              {listing.title}
            </h1>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-[11px] text-slate-400 uppercase font-bold">Harga Satuan</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                  {formatPrice(listing.pricePerUnit, listing.unit)}
                </span>
                <span className="text-xs text-slate-500">
                  (Total Lot: {formatPrice(listing.totalPrice)})
                </span>
              </div>
            </div>

            {/* Volume & Trade specs */}
            <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Tonase Siap Kirim:</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {listing.quantity} {listing.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lokasi Pengambilan:</span>
                <span className="font-bold text-slate-800 text-right">
                  {listing.location.address}, {listing.location.city}, {listing.location.country}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Syarat Pengiriman:</span>
                <span className="font-mono font-bold text-slate-900">{listing.incoterm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sistem Pembayaran:</span>
                <span className="font-bold text-emerald-700">100% Jaminan Rekber Escrow</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="mt-6 space-y-2.5">
              {!isBuyerVerified && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold">Akses Pembelian Perlu Verifikasi:</span>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                      Default akun Anda adalah Penjual (Depo). Untuk membeli material ini, lengkapi identitas legalitas (NIB & NPWP).
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowLegalityModal(true)}
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-2 py-0.5 rounded transition-colors"
                    >
                      <span>Lengkapi Legalitas Sekarang</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {listing.listingType === 'AUCTION' ? (
                <button
                  onClick={() => {
                    if (!isBuyerVerified) {
                      setShowLegalityModal(true);
                      return;
                    }
                    navigate('auction-detail', { id: listing.id });
                  }}
                  className="w-full py-3 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs text-center"
                >
                  Masuk Ruang Lelang Terbuka ({listing.bidCount} Tawaran)
                </button>
              ) : listing.listingType === 'FREE_PICKUP' ? (
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs text-center"
                >
                  Klaim Lot Gratis & Jadwalkan Angkutan
                </button>
              ) : (
                <>
                  <button
                    onClick={handleBuyNow}
                    className="w-full py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs text-center"
                  >
                    Beli Langsung ({formatPrice(listing.totalPrice)})
                  </button>
                  <button
                    onClick={handleOpenOfferModal}
                    className="w-full py-2.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors text-center"
                  >
                    Ajukan Penawaran Harga / Nego
                  </button>
                </>
              )}

              <button
                onClick={() => navigate('dashboard-negotiations')}
                className="w-full py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                <span>Kirim Pesan ke Penjual via Chat Resmi</span>
              </button>
            </div>

            {/* Anti off-platform disclaimer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Transaksi dilindungi oleh <strong>Jaminan Rekber Escrow Scrava</strong>. Jangan melakukan pembayaran langsung di luar sistem rekening bersama resmi.
              </span>
            </div>
          </div>

          {/* Seller Profile Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Profil Depo Penjual Terverifikasi
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg font-bold">
                🏭
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900">{listing.seller.companyName}</h4>
                  <span title="KYC Terverifikasi">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {listing.seller.country} · Anggota sejak 2021
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
              <div>
                <div className="text-xs font-bold text-slate-900 font-mono">{listing.seller.completedTx}</div>
                <div className="text-[10px] text-slate-500">Transaksi Sukses</div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 font-mono">★ {listing.seller.rating}</div>
                <div className="text-[10px] text-slate-500">Rating</div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 font-mono">{listing.seller.responseRate}</div>
                <div className="text-[10px] text-slate-500">Tingkat Respon</div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => navigate('dashboard-company')}
                className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-center"
              >
                Lihat Profil Lengkap
              </button>
              <button
                onClick={openOffPlatformWarning}
                className="py-2 px-3 text-xs font-bold text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg"
                title="Kontak langsung diawasi sistem keamanan platform"
              >
                Kontak PIC?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {offerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">
              Kirim Penawaran Harga Resmi (B2B Offer)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Material: {listing.title.slice(0, 45)}...
            </p>

            <form onSubmit={handleMakeOfferSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Harga Penawaran per {listing.unit} (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">Rp</span>
                  <input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-400">
                  Harga buka penjual: {formatPrice(listing.pricePerUnit, listing.unit)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jumlah Tonase Diperlukan ({listing.unit})
                </label>
                <input
                  type="number"
                  value={offerQty}
                  onChange={(e) => setOfferQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                  max={listing.quantity}
                  required
                />
                <span className="text-[10px] text-slate-400">
                  Total kuota lot tersedia: {listing.quantity} {listing.unit}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Syarat Pengiriman yang Diajukan (Incoterm)
                </label>
                <select
                  value={offerIncoterm}
                  onChange={(e) => setOfferIncoterm(e.target.value as IncotermType)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg font-mono"
                >
                  <option value="DDP">DDP - Diantar sampai gudang pabrik pembeli</option>
                  <option value="FOB">FOB - Franco Pabrik / Pelabuhan Muat</option>
                  <option value="EXW">EXW - Pembeli jemput armada sendiri di depo</option>
                  <option value="CIF">CIF - Biaya, Asuransi & Pengiriman</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan untuk Penjual
                </label>
                <textarea
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  placeholder="Contoh: Kami siap bayar pelunasan H+0 setelah jembatan timbang selesai diperiksa..."
                  rows={3}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Total Nilai Penawaran:</span>
                <span className="font-mono font-black text-slate-900 text-sm">
                  {formatPrice(offerPrice * offerQty)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOfferModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Kirim Penawaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Buyer Legality Verification Modal */}
      <UpgradeToFactoryModal
        isOpen={showLegalityModal}
        onClose={() => setShowLegalityModal(false)}
        onSuccess={() => navigate('checkout', { id: listing.id })}
        reasonMessage="Anda saat ini terdaftar sebagai Penjual (Depo Scrap). Untuk menyelesaikan pembelian lot material ini, silakan lengkapi nomor NIB & NPWP pabrik Anda di bawah ini."
      />
    </div>
  );
};
