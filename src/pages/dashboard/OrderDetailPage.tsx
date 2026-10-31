import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TimelineComponent } from '../../components/common/TimelineComponent';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DigitalDocketModal } from '../../components/procurement/DigitalDocketModal';
import {
  ArrowLeft,
  Truck,
  Scale,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Star,
  DollarSign,
  Download,
  Building,
  User,
  ShieldCheck,
  Clock,
  Check,
  X,
  QrCode
} from 'lucide-react';
import { OrderStatus } from '../../types';

interface OrderDetailProps {
  id?: string;
  navigate: (path: string, params?: any) => void;
}

export const OrderDetailPage: React.FC<OrderDetailProps> = ({ id, navigate }) => {
  const { orders, updateOrderStatus, confirmSettlement, openDispute, formatPrice, showToast, currentCompany } = useApp();

  const order = orders.find((o) => o.id === id) || orders[0];
  const isOrderSeller = order.sellerCompany === currentCompany.name;

  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [docketModalOpen, setDocketModalOpen] = useState(false);

  // Dispute form state
  const [disputeReason, setDisputeReason] = useState<any>('Weight discrepancy');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeClaim, setDisputeClaim] = useState<number>(order.settlement.adjustmentDelta < 0 ? Math.abs(order.settlement.adjustmentDelta) : 500);

  // Rating form state
  const [ratingVal, setRatingVal] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState('');

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openDispute({
      orderId: order.id,
      orderNumber: order.orderNumber,
      productTitle: order.productTitle,
      againstCompany: isOrderSeller ? order.buyerCompany : order.sellerCompany,
      reason: disputeReason,
      description: disputeDesc || 'Ditemukan selisih antara ketentuan kontrak jual beli dan hasil verifikasi jembatan timbang resmi.',
      claimAmount: disputeClaim,
    });
    setDisputeModalOpen(false);
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRatingModalOpen(false);
    showToast(`Ulasan transaksi bintang 5 berhasil dikirim untuk ${isOrderSeller ? order.buyerCompany : order.sellerCompany}!`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('dashboard-orders')}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Semua Pesanan</span>
        </button>

        <div className="flex items-center gap-2">
          {order.status === 'SETTLEMENT' && (
            <button
              onClick={() => confirmSettlement(order.id)}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Konfirmasi & Cairkan Dana Escrow</span>
            </button>
          )}

          {order.status !== 'DISPUTED' && order.status !== 'COMPLETED' && (
            <button
              onClick={() => setDisputeModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Ajukan Sengketa</span>
            </button>
          )}

          {order.status === 'COMPLETED' && (
            <button
              onClick={() => setRatingModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded transition-colors flex items-center gap-1.5"
            >
              <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>Beri Nilai Lawan Transaksi</span>
            </button>
          )}
        </div>
      </div>

      {/* Order Title Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-extrabold text-slate-900">{order.orderNumber}</span>
            <StatusBadge status={order.status} type="order" />
            <span className="text-xs text-slate-400 font-mono">Incoterm: {order.incoterm}</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900">{order.productTitle}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kontrak disepakati pada {order.createdAt} · Dilindungi Rekber Escrow Resmi
          </p>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <div className="text-xs text-slate-400 uppercase font-medium">Nilai Kontrak Awal</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            {formatPrice(order.totalOriginalValue)}
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {order.quantity} {order.unit} @ {formatPrice(order.agreedPricePerUnit)}/{order.unit}
          </div>
        </div>
      </div>

      {/* 13-Stage Reusable Pipeline Timeline */}
      <TimelineComponent currentStatus={order.status} />

      {/* 2-Column Grid: Left: Physical Transport & Inspection | Right: Financial Settlement & Parties */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Pickup & Vehicle Manifest */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Manifes Pengangkutan & Surat Jalan Logistik
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDocketModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded hover:bg-emerald-100 transition-colors shadow-2xs"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Surat Jalan Digital (QR Code)</span>
                </button>
                <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {order.pickupDetails.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500">Armada / Vendor Logistik:</span>
                <div className="font-semibold text-slate-800 mt-0.5">{order.pickupDetails.transporter}</div>
              </div>
              <div>
                <span className="text-slate-500">Nomor Polisi Kendaraan / Truk:</span>
                <div className="font-mono font-semibold text-slate-800 mt-0.5">{order.pickupDetails.vehiclePlate}</div>
              </div>
              <div>
                <span className="text-slate-500">Identitas Pengemudi (Driver):</span>
                <div className="font-semibold text-slate-800 mt-0.5">{order.pickupDetails.driverName}</div>
              </div>
              <div>
                <span className="text-slate-500">Jadwal Muat & Berangkat:</span>
                <div className="font-mono text-slate-800 mt-0.5">{order.pickupDetails.scheduledDate}</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Alamat Depo / Lokasi Pengambilan:</span>
              <div className="font-medium text-slate-800 mt-0.5">{order.pickupDetails.pickupAddress}</div>
            </div>
          </div>

          {/* Weighbridge UI */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Tiket Resmi Jembatan Timbang Tersertifikasi
                </h3>
              </div>
              {order.weighbridge.isVerified ? (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Disegel & Tervalidasi
                </span>
              ) : (
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Menunggu Penimbangan</span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded p-4 text-center">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Berat Kotor (Bruto)</div>
                <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                  {order.weighbridge.actualGrossWeight} {order.weighbridge.unit}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Berat Kendaraan (Tara)</div>
                <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                  {order.weighbridge.tareWeight} {order.weighbridge.unit}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Berat Bersih (Netto)</div>
                <div className="text-sm font-bold font-mono text-emerald-700 mt-0.5">
                  {order.weighbridge.actualNetWeight} {order.weighbridge.unit}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Selisih Bobot</div>
                <div
                  className={`text-sm font-bold font-mono mt-0.5 ${
                    order.weighbridge.difference < 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {order.weighbridge.difference > 0 ? '+' : ''}
                  {order.weighbridge.difference} {order.weighbridge.unit}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-600">
              <div>
                <span className="text-slate-400">Nomor Tiket Timbang:</span>
                <span className="font-mono font-bold text-slate-900 ml-2">{order.weighbridge.ticketNumber}</span>
              </div>
              <div>
                <span className="text-slate-400">Stasiun / Pos Timbang:</span>
                <span className="font-medium text-slate-800 ml-2">{order.weighbridge.stationName}</span>
              </div>
            </div>
          </div>

          {/* QC Inspection Report */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Uji Mutu Laboratorium (QC) & Uji Kadar
                </h3>
              </div>
              <StatusBadge status={order.qc.status} />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-mono bg-slate-50 p-3 rounded border border-slate-100">
              "{order.qc.notes}"
            </p>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Lembaga Inspeksi: <strong>{order.qc.inspector}</strong></span>
              <span className="font-mono">Kadar Kemurnian: <strong>{order.qc.samplePurityPercentage}%</strong></span>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Financial Settlement & Parties */}
        <div className="lg:col-span-5 space-y-6">
          {/* Settlement Reconciliation Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Rekonsiliasi Keuangan Rekber Escrow
                </h3>
              </div>
              <StatusBadge status={order.settlement.status} />
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Nilai Kontrak Awal:</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {formatPrice(order.settlement.originalValue)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Berat Bersih Aktual:</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {order.settlement.actualWeight} {order.unit}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Nilai Fisik Lot Disesuaikan:</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {formatPrice(order.settlement.adjustedValue)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Biaya Transaksi Platform (1,5%):</span>
                <span className="font-mono text-slate-600 tabular-nums">
                  -{formatPrice(order.settlement.platformFee)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Penyesuaian Selisih Bobot:</span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    order.settlement.adjustmentDelta < 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {order.settlement.adjustmentDelta < 0
                    ? `-${formatPrice(Math.abs(order.settlement.adjustmentDelta))} (Dikembalikan ke Pembeli)`
                    : `+${formatPrice(order.settlement.adjustmentDelta)}`}
                </span>
              </div>

              <div className="pt-2 flex justify-between items-baseline font-bold text-slate-900 text-sm">
                <span>Pencairan Akhir ke Rekening Penjual:</span>
                <span className="font-mono text-emerald-700 text-base tabular-nums">
                  {formatPrice(order.settlement.finalSellerPayout)}
                </span>
              </div>
            </div>

            {order.status === 'SETTLEMENT' && (
              <button
                onClick={() => confirmSettlement(order.id)}
                className="mt-5 w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-xs"
              >
                Tandatangani & Cairkan Dana Escrow
              </button>
            )}
          </div>

          {/* Counterparties Info */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Para Pihak dalam Kontrak
            </h3>

            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Pihak Penjual (Supplier Yard)</div>
              <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <span>{order.sellerCompany}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-slate-500 mt-0.5">{order.sellerCountry} · Depo Terverifikasi</div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Pihak Pembeli (Pabrik / Smelter)</div>
              <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <span>{order.buyerCompany}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-slate-500 mt-0.5">{order.buyerCountry} · Pabrik Terverifikasi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dispute Modal */}
      {disputeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Buka Sengketa Resmi Transaksi</span>
              </h3>
              <button onClick={() => setDisputeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDisputeSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan Sengketa *</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                >
                  <option value="Weight discrepancy">Selisih bobot timbangan (Melebihi batas toleransi yang disepakati)</option>
                  <option value="Quality issue">Ketidaksesuaian mutu / kadar (Kontaminasi gagal uji lab)</option>
                  <option value="Damaged goods">Barang rusak / tidak sesuai spesifikasi perjanjian</option>
                  <option value="Pickup issue">Kendala pengangkutan / gagal muat logistik</option>
                  <option value="Payment issue">Ketidaksesuaian nilai tagihan / pencairan escrow</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nilai Klaim Kompensasi</label>
                <input
                  type="number"
                  value={disputeClaim}
                  onChange={(e) => setDisputeClaim(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-mono font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kronologi & Penjelasan Detail</label>
                <textarea
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  placeholder="Jelaskan secara spesifik ketidaksesuaian yang ditemukan pada jembatan timbang atau uji lab..."
                  rows={3}
                  className="w-full p-2 border border-slate-300 rounded"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600">
                Pengajuan sengketa resmi akan otomatis menahan dana escrow hingga tim mediator Scrava mengaudit tiket jembatan timbang dan sertifikat uji laboratorium.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded shadow-xs"
                >
                  Kirim Pengajuan Sengketa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200 p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">
              Beri Ulasan Rekan Transaksi
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ulasan untuk {isOrderSeller ? order.buyerCompany : order.sellerCompany} atas Pesanan #{order.orderNumber}
            </p>

            <form onSubmit={handleRatingSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Penilaian Keseluruhan</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingVal(star)}
                      className="p-1 focus:outline-hidden"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= ratingVal
                            ? 'text-amber-500 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan & Testimoni</label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Bagikan ulasan terkait akurasi timbangan, ketepatan waktu armada, dan profesionalitas..."
                  rows={3}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs"
                >
                  Kirim Ulasan Resmi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Docket Modal */}
      {docketModalOpen && (
        <DigitalDocketModal order={order} onClose={() => setDocketModalOpen(false)} />
      )}
    </div>
  );
};
