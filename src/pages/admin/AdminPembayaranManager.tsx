import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  Landmark,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  ShieldCheck,
  AlertCircle,
  XCircle,
  FileText,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';

interface PaymentItem {
  id: string;
  type: 'TOPUP_PABRIK' | 'RELEASE_ESCROW' | 'REFUND_TIMBANGAN';
  companyName: string;
  bankName: string;
  accountNumber: string;
  amountIDR: number;
  method: 'RTGS_BANK' | 'BI_FAST' | 'VIRTUAL_ACCOUNT' | 'QRIS';
  refNumber: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  relatedOrder?: string;
}

const INITIAL_PAYMENTS: PaymentItem[] = [
  {
    id: 'PAY-901',
    type: 'TOPUP_PABRIK',
    companyName: 'PT Cilegon Precision Steel',
    bankName: 'Bank Mandiri (Corporate Escrow)',
    accountNumber: '142-00-889988-1',
    amountIDR: 250000000,
    method: 'RTGS_BANK',
    refNumber: 'RTGS-MDR-88192088',
    date: 'Hari ini, 09:30 WIB',
    status: 'PENDING',
    relatedOrder: 'TRZ-PO-882103',
  },
  {
    id: 'PAY-902',
    type: 'RELEASE_ESCROW',
    companyName: 'Depo Logam Metalindo Jaya (Penjual)',
    bankName: 'Bank Central Asia (BCA)',
    accountNumber: '018-992-1200',
    amountIDR: 160000000,
    method: 'BI_FAST',
    refNumber: 'PAYOUT-TRZ-77102',
    date: 'Hari ini, 11:00 WIB',
    status: 'PENDING',
    relatedOrder: 'TRZ-PO-882103',
  },
  {
    id: 'PAY-903',
    type: 'TOPUP_PABRIK',
    companyName: 'PT Surya Metal Tembaga Utama',
    bankName: 'BCA (Corporate Escrow)',
    accountNumber: '218-300-9988',
    amountIDR: 625000000,
    method: 'RTGS_BANK',
    refNumber: 'RTGS-BCA-5510291',
    date: 'Kemarin, 14:15 WIB',
    status: 'APPROVED',
    relatedOrder: 'TRZ-PO-771029',
  },
  {
    id: 'PAY-904',
    type: 'RELEASE_ESCROW',
    companyName: 'CV Tembaga Raya Abadi (Penjual)',
    bankName: 'Bank Central Asia (BCA)',
    accountNumber: '218-991-0022',
    amountIDR: 625000000,
    method: 'RTGS_BANK',
    refNumber: 'PAYOUT-TRZ-55102',
    date: 'Kemarin, 16:45 WIB',
    status: 'APPROVED',
    relatedOrder: 'TRZ-PO-771029',
  },
];

export const AdminPembayaranManager: React.FC = () => {
  const { showToast, formatPrice } = useApp();
  const [payments, setPayments] = useState<PaymentItem[]>(INITIAL_PAYMENTS);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (txt: string, key: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedKey(key);
    showToast(`Disalin: ${txt}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApprove = (id: string, item: PaymentItem) => {
    setPayments(
      payments.map((p) => (p.id === id ? { ...p, status: 'APPROVED' } : p))
    );
    const actionLabel =
      item.type === 'TOPUP_PABRIK'
        ? `Deposit masuk senilai ${formatPrice(item.amountIDR)} berhasil diverifikasi ke rekening escrow.`
        : `Dana escrow senilai ${formatPrice(item.amountIDR)} berhasil dicairkan ke rekening penjual.`;
    showToast(actionLabel);
  };

  const handleReject = (id: string, item: PaymentItem) => {
    setPayments(
      payments.map((p) => (p.id === id ? { ...p, status: 'REJECTED' } : p))
    );
    showToast(`Pembayaran ${item.refNumber} ditolak / butuh investigasi bank.`);
  };

  const filteredPayments = payments.filter((p) => {
    if (filterType === 'ALL') return true;
    return p.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Landmark className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Manage Pembayaran & Rekening Bersama (Escrow)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Validasi mutasi transfer bank masuk (RTGS / BI-FAST) dan persetujuan pencairan dana penjualan ke rekening pengepul
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'TOPUP_PABRIK', 'RELEASE_ESCROW'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                filterType === t
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {t === 'ALL'
                ? 'Semua Mutasi'
                : t === 'TOPUP_PABRIK'
                ? 'Deposit Masuk Pabrik'
                : 'Pencairan Dana Penjual'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Total Dana di Escrow</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {formatPrice(875000000)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Tersimpan aman di Bank Mandiri & BCA Escrow</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Menunggu Verifikasi Deposit</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-600 font-mono">
            {formatPrice(250000000)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">1 pengajuan top-up via RTGS Bank</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Menunggu Pencairan (Payout)</span>
            <ArrowUpRight className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-blue-700 font-mono">
            {formatPrice(160000000)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Siap release setelah timbangan gate tertera</div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3.5">ID & Tanggal</th>
                <th className="p-3.5">Jenis Pembayaran</th>
                <th className="p-3.5">Perusahaan & Rekening</th>
                <th className="p-3.5">Metode & No. Ref Bank</th>
                <th className="p-3.5 text-right">Nominal (Rp)</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Aksi Superadmin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPayments.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <div className="font-mono font-bold text-slate-900">{item.id}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.date}</div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.type === 'TOPUP_PABRIK'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {item.type === 'TOPUP_PABRIK' ? '↓ Deposit Masuk (Pabrik)' : '↑ Pencairan (Ke Penjual)'}
                    </span>
                    {item.relatedOrder && (
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        PO: {item.relatedOrder}
                      </div>
                    )}
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{item.companyName}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {item.bankName} · {item.accountNumber}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-800">
                      {item.method === 'RTGS_BANK'
                        ? 'RTGS Bank Indonesia'
                        : item.method === 'BI_FAST'
                        ? 'BI-FAST Real-time'
                        : 'Virtual Account'}
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500 mt-0.5">
                      <span>{item.refNumber}</span>
                      <button
                        onClick={() => copyText(item.refNumber, item.id)}
                        className="text-slate-400 hover:text-slate-600"
                        title="Salin No. Ref"
                      >
                        {copiedKey === item.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>
                  <td className="p-3.5 text-right font-mono font-black text-slate-900 text-sm">
                    {formatPrice(item.amountIDR)}
                  </td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : item.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {item.status === 'APPROVED' ? 'Disetujui' : item.status === 'PENDING' ? 'Perlu Validasi' : 'Ditolak'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    {item.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleReject(item.id, item)}
                          className="px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-300 rounded-lg transition-colors"
                        >
                          Tolak
                        </button>
                        <button
                          onClick={() => handleApprove(item.id, item)}
                          className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{item.type === 'TOPUP_PABRIK' ? 'Approve Deposit' : 'Release Dana'}</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Selesai diproses</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
