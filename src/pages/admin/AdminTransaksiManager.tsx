import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Scale,
  DollarSign,
  AlertCircle,
  XCircle,
  FileText,
  Filter,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  X,
  ShieldAlert
} from 'lucide-react';

interface TransactionItem {
  id: string;
  orderNumber: string;
  sellerName: string;
  buyerName: string;
  commodity: string;
  quantityMT: number;
  totalAmountIDR: number;
  date: string;
  status:
    | 'MENUNGGU_ESCROW'
    | 'ESCROW_TERKUNCI'
    | 'JADWAL_PENGAMBILAN'
    | 'PROSES_TIMBANG_PABRIK'
    | 'DANA_DICAIRKAN'
    | 'DIBATALKAN';
  weighNettoMT?: number;
}

const INITIAL_TRANSACTIONS: TransactionItem[] = [
  {
    id: 'TX-1001',
    orderNumber: 'TRZ-PO-882103',
    sellerName: 'Depo Logam Metalindo Jaya',
    buyerName: 'PT Cilegon Precision Steel',
    commodity: 'Scrap Besi Baja Berat HMS 1/2',
    quantityMT: 25,
    totalAmountIDR: 160000000,
    date: '28 Sep 2026',
    status: 'PROSES_TIMBANG_PABRIK',
    weighNettoMT: 24.8,
  },
  {
    id: 'TX-1002',
    orderNumber: 'TRZ-PO-771029',
    sellerName: 'CV Tembaga Raya Abadi',
    buyerName: 'PT Surya Metal Tembaga Utama',
    commodity: 'Tembaga Millberry Scrap Kawat 99.9%',
    quantityMT: 5,
    totalAmountIDR: 625000000,
    date: '27 Sep 2026',
    status: 'DANA_DICAIRKAN',
    weighNettoMT: 5.0,
  },
  {
    id: 'TX-1003',
    orderNumber: 'TRZ-PO-661920',
    sellerName: 'Lapak Scrap Aluminium Nusantara',
    buyerName: 'PT Mandiri Daur Aluminium',
    commodity: 'Aluminium Profil 6063 Scrap',
    quantityMT: 15,
    totalAmountIDR: 435000000,
    date: '29 Sep 2026',
    status: 'ESCROW_TERKUNCI',
  },
  {
    id: 'TX-1004',
    orderNumber: 'TRZ-PO-551029',
    sellerName: 'Depo Daur Ulang Plastik Presisi',
    buyerName: 'PT Indo Pelletizer Plastik Gemilang',
    commodity: 'Baled PET Flakes Bening B2B',
    quantityMT: 30,
    totalAmountIDR: 285000000,
    date: '29 Sep 2026',
    status: 'MENUNGGU_ESCROW',
  },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  MENUNGGU_ESCROW: { label: 'Menunggu Pembayaran Escrow', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  ESCROW_TERKUNCI: { label: 'Dana Terkunci di Escrow', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  JADWAL_PENGAMBILAN: { label: 'Jadwal Muat Depo', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  PROSES_TIMBANG_PABRIK: { label: 'Timbang Terima di Pabrik', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  DANA_DICAIRKAN: { label: 'Selesai (Dana Release)', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  DIBATALKAN: { label: 'Transaksi Dibatalkan', color: 'bg-rose-50 text-rose-800 border-rose-200' },
};

export const AdminTransaksiManager: React.FC = () => {
  const { showToast, formatPrice } = useApp();
  const [transactions, setTransactions] = useState<TransactionItem[]>(INITIAL_TRANSACTIONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Confirmation Dialog & PIN Modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [targetStatus, setTargetStatus] = useState<TransactionItem['status'] | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPin, setShowPin] = useState(false);

  const filteredTransactions = transactions.filter((tx) => {
    const matchSearch =
      tx.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      tx.sellerName.toLowerCase().includes(search.toLowerCase()) ||
      tx.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      tx.commodity.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || tx.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const requestStatusChange = (tx: TransactionItem, newStatus: TransactionItem['status']) => {
    if (tx.status === newStatus) return;
    setSelectedTx(tx);
    setTargetStatus(newStatus);
    setPinInput('');
    setPinError('');
    setConfirmModalOpen(true);
  };

  const handleConfirmWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx || !targetStatus) return;

    // PIN check: Superadmin Master PIN
    if (pinInput !== '123456') {
      setPinError('PIN Superadmin salah! Gunakan PIN otorisasi (Default: 123456).');
      return;
    }

    setTransactions(
      transactions.map((tx) => {
        if (tx.id === selectedTx.id) {
          return { ...tx, status: targetStatus };
        }
        return tx;
      })
    );

    showToast(`Otorisasi Sukses! Status PO ${selectedTx.orderNumber} diubah ke ${STATUS_LABELS[targetStatus].label}`);
    setConfirmModalOpen(false);
    setSelectedTx(null);
    setTargetStatus(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Package className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Manage Status Transaksi B2B
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pantau dan ubah status siklus transaksi bursa: pembayaran escrow, timbang terima gate pabrik, dan pencairan dana
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari no. PO, penjual, pembeli, komoditas..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <span className="text-xs text-slate-500">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2 border border-slate-300 rounded-lg bg-white font-semibold focus:outline-hidden"
          >
            <option value="ALL">Semua Status</option>
            <option value="MENUNGGU_ESCROW">Menunggu Pembayaran Escrow</option>
            <option value="ESCROW_TERKUNCI">Dana Terkunci di Escrow</option>
            <option value="JADWAL_PENGAMBILAN">Jadwal Muat Depo</option>
            <option value="PROSES_TIMBANG_PABRIK">Timbang Terima Pabrik</option>
            <option value="DANA_DICAIRKAN">Selesai (Dana Release)</option>
            <option value="DIBATALKAN">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3.5">No. PO & Tanggal</th>
                <th className="p-3.5">Penjual (Pengepul)</th>
                <th className="p-3.5">Pembeli (Pabrik)</th>
                <th className="p-3.5">Komoditas & Tonase</th>
                <th className="p-3.5 text-right">Nilai Total (Rp)</th>
                <th className="p-3.5 text-center">Status Transaksi Saat Ini</th>
                <th className="p-3.5 text-center">Ubah Status (Superadmin)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <div className="font-mono font-bold text-slate-900">{tx.orderNumber}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{tx.date}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-900">{tx.sellerName}</div>
                    <div className="text-[10px] text-slate-500">Depo Pengepul</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-900">{tx.buyerName}</div>
                    <div className="text-[10px] text-emerald-700 font-medium">Pabrik Smelter</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-medium text-slate-900">{tx.commodity}</div>
                    <div className="text-[11px] text-slate-500 font-mono font-bold">
                      Kontrak: {tx.quantityMT} MT {tx.weighNettoMT ? `(Netto: ${tx.weighNettoMT} MT)` : ''}
                    </div>
                  </td>
                  <td className="p-3.5 text-right font-mono font-black text-slate-900 text-sm">
                    {formatPrice(tx.totalAmountIDR)}
                  </td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        STATUS_LABELS[tx.status].color
                      }`}
                    >
                      {STATUS_LABELS[tx.status].label}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <select
                      value={tx.status}
                      onChange={(e) => requestStatusChange(tx, e.target.value as any)}
                      className="text-xs p-1.5 border border-slate-300 rounded-lg bg-white font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600 shadow-2xs cursor-pointer hover:border-slate-400"
                    >
                      <option value="MENUNGGU_ESCROW">1. Menunggu Pembayaran Escrow</option>
                      <option value="ESCROW_TERKUNCI">2. Dana Terkunci di Escrow</option>
                      <option value="JADWAL_PENGAMBILAN">3. Jadwal Muat Depo</option>
                      <option value="PROSES_TIMBANG_PABRIK">4. Timbang Terima Pabrik</option>
                      <option value="DANA_DICAIRKAN">5. Selesai (Dana Release)</option>
                      <option value="DIBATALKAN">X. Dibatalkan</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation & Security PIN Dialog Modal */}
      {confirmModalOpen && selectedTx && targetStatus && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Konfirmasi Perubahan Status
                  </h3>
                  <p className="text-[11px] text-slate-500">Otorisasi Keamanan Superadmin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Transaction Detail Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Nomor PO:</span>
                <span className="font-mono font-bold text-slate-900">{selectedTx.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Pengepul (Penjual):</span>
                <span className="font-semibold text-slate-800">{selectedTx.sellerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Pabrik (Pembeli):</span>
                <span className="font-semibold text-slate-800">{selectedTx.buyerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Komoditas & Tonase:</span>
                <span className="font-semibold text-slate-900">{selectedTx.commodity} ({selectedTx.quantityMT} MT)</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold">
                <span className="text-slate-600">Nilai Kontrak:</span>
                <span className="text-emerald-700 font-mono">{formatPrice(selectedTx.totalAmountIDR)}</span>
              </div>
            </div>

            {/* Status Transition Visual */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <div className="text-[11px] font-bold text-amber-900">Perubahan Siklus Transaksi:</div>
              <div className="flex items-center justify-between text-xs gap-2">
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 font-medium flex-1 text-center">
                  <div className="text-[10px] text-slate-400">Dari:</div>
                  <div className="font-bold text-slate-800">{STATUS_LABELS[selectedTx.status].label}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="p-2 rounded-lg bg-emerald-600 text-white font-bold flex-1 text-center shadow-xs">
                  <div className="text-[10px] text-emerald-100">Menjadi:</div>
                  <div className="text-white">{STATUS_LABELS[targetStatus].label}</div>
                </div>
              </div>
              <p className="text-[10px] text-amber-800 leading-relaxed pt-1">
                ⚠️ Peringatan: Mengubah status transaksi akan memicu audit trail dan mempengaruhi status dana di rekening escrow.
              </p>
            </div>

            {/* Form Input PIN */}
            <form onSubmit={handleConfirmWithPin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                    <span>Masukkan PIN Keamanan Superadmin *</span>
                  </span>
                  <span className="text-[10px] font-normal text-slate-400 font-mono">Default: 123456</span>
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      if (pinError) setPinError('');
                    }}
                    maxLength={10}
                    placeholder="Masukkan 6 Digit PIN..."
                    autoFocus
                    required
                    className={`w-full p-2.5 pr-10 border rounded-xl text-center text-base tracking-widest font-mono font-bold focus:outline-hidden ${
                      pinError
                        ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:border-rose-600'
                        : 'border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-100'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pinError && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{pinError}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Verifikasi PIN & Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
