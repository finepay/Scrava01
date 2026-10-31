import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  Building,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Download,
  PlusCircle,
  AlertCircle,
  Copy,
  QrCode,
  Landmark,
  FileText,
  X,
  Info,
  ExternalLink,
  Check
} from 'lucide-react';

interface WalletPageProps {
  navigate: (path: string, params?: any) => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({ navigate }) => {
  const { userRole, currentCompany, formatPrice, showToast } = useApp();

  // Saldo dalam Rupiah (stateful agar topup dan penarikan langsung tercermin secara real-time)
  const [availableBalanceIDR, setAvailableBalanceIDR] = useState<number>(175000000);
  const [escrowBalanceIDR, setEscrowBalanceIDR] = useState<number>(85000000);
  const [totalSettledIDR, setTotalSettledIDR] = useState<number>(1450000000);

  // Modal States
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('50000000');

  // Topup Modal State (Role Pembeli Pabrik)
  const [topupModalOpen, setTopupModalOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState<number>(250000000); // Default 250 Juta
  const [topupMethod, setTopupMethod] = useState<'escrow_transfer' | 'va' | 'qris'>('escrow_transfer');
  const [selectedBank, setSelectedBank] = useState<'mandiri' | 'bca' | 'bni' | 'bri'>('mandiri');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [transferProofRef, setTransferProofRef] = useState<string>('');

  const [transactionsHistory, setTransactionsHistory] = useState([
    {
      id: 'MUT-891',
      date: '28 Sep 2026, 14:30',
      desc: 'Pencairan Dana Escrow Penjualan - Pesanan SCR-882103 (Besi Scrap 25 MT)',
      type: 'credit',
      amount: 175000000,
      status: 'SUCCESS',
      ref: 'BCA-VIRTUAL-8829',
    },
    {
      id: 'MUT-890',
      date: '27 Sep 2026, 11:15',
      desc: 'Pengembalian / Refund Uang Jaminan Lelang Proyek (Lelang PRJ-SCR-01)',
      type: 'credit',
      amount: 25000000,
      status: 'SUCCESS',
      ref: 'REFUND-DEP-881',
    },
    {
      id: 'MUT-889',
      date: '25 Sep 2026, 09:40',
      desc: 'Deposit Escrow Pembelian Bahan Baku - Lot LIST-1001 (Besi HMS 1)',
      type: 'debit',
      amount: 98000000,
      status: 'SUCCESS',
      ref: 'MANDIRI-ESCROW-002',
    },
    {
      id: 'MUT-888',
      date: '22 Sep 2026, 16:20',
      desc: 'Penarikan Dana Hasil Penjualan ke Rekening Bank Perusahaan (BCA)',
      type: 'debit',
      amount: 50000000,
      status: 'SUCCESS',
      ref: 'WD-BCA-CORP-01',
    },
  ]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Berhasil disalin: ${text}`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(withdrawAmount);
    if (amountNum > availableBalanceIDR) {
      showToast('Nominal penarikan melebihi saldo tersedia.');
      return;
    }
    setAvailableBalanceIDR((prev) => prev - amountNum);
    const newTx = {
      id: `MUT-${900 + transactionsHistory.length + 1}`,
      date: 'Hari ini, Baru saja',
      desc: 'Penarikan Dana ke Rekening Resmi Perusahaan',
      type: 'debit',
      amount: amountNum,
      status: 'SUCCESS',
      ref: 'WD-BCA-CORP-991',
    };
    setTransactionsHistory([newTx, ...transactionsHistory]);
    setWithdrawModalOpen(false);
    showToast(`Permintaan penarikan dana ${formatPrice(amountNum)} berhasil diproses via BI-FAST.`);
  };

  const handleTopupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topupAmount <= 0) {
      showToast('Masukkan nominal top-up yang valid.');
      return;
    }

    setAvailableBalanceIDR((prev) => prev + topupAmount);
    const methodDesc =
      topupMethod === 'escrow_transfer'
        ? `Top-Up Deposit Escrow via Transfer Bank (${selectedBank.toUpperCase()} - RTGS/BI-FAST)`
        : topupMethod === 'va'
        ? `Top-Up Deposit Escrow via Virtual Account (${selectedBank.toUpperCase()})`
        : 'Top-Up Deposit Escrow via QRIS Dinamis';

    const newTx = {
      id: `MUT-${950 + transactionsHistory.length + 1}`,
      date: 'Hari ini, Baru saja',
      desc: methodDesc,
      type: 'credit',
      amount: topupAmount,
      status: 'SUCCESS',
      ref: transferProofRef.trim() || `TOPUP-SCRAVA-${Math.floor(100000 + Math.random() * 900000)}`,
    };
    setTransactionsHistory([newTx, ...transactionsHistory]);
    setTopupModalOpen(false);
    setTransferProofRef('');
    showToast(`Top-up saldo escrow sebesar ${formatPrice(topupAmount)} berhasil diverifikasi! Saldo dompet telah bertambah.`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Dompet Digital & Rekening Escrow Customer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola saldo transaksi aman dalam Rupiah, pencairan dana penjualan setelah timbang terima, dan deposit escrow pembelian
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setWithdrawModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tarik Saldo Penjualan</span>
          </button>
          <button
            onClick={() => setTopupModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Top-Up Deposit Escrow</span>
          </button>
        </div>
      </div>

      {/* Saldo Cards (All in Rupiah) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Saldo Tersedia */}
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white rounded-2xl p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <CreditCard className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between text-xs text-emerald-200 font-semibold mb-2">
              <span>Saldo Tersedia (Siap Pakai / Ditarik)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-100">
                Aktif
              </span>
            </div>
            <div className="text-2xl font-black font-mono tracking-tight text-white mt-1">
              {formatPrice(availableBalanceIDR)}
            </div>
            <div className="text-[11px] text-emerald-200/80 mt-1">
              Dapat dipakai untuk bayar jaminan lelang & pembelian, atau ditarik ke rekening bank.
            </div>
          </div>

          <div className="relative z-10 pt-4 mt-4 border-t border-emerald-700/60 flex items-center justify-between text-xs">
            <span className="text-emerald-300 font-medium">Rekening Bank Terdaftar:</span>
            <span className="font-mono text-emerald-100 font-bold">BCA Corporate **** 8821</span>
          </div>
        </div>

        {/* Card 2: Saldo Dalam Escrow */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Uang Jaminan Lelang & Dana Escrow</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black font-mono tracking-tight text-slate-900 mt-1">
              {formatPrice(escrowBalanceIDR)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 leading-snug">
              Uang jaminan bid lelang proyek & deposit kontrak berjalan yang aman tersimpan di bank kustodi.
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Terlindungi Jaminan Escrow & Kustodi Resmi</span>
          </div>
        </div>

        {/* Card 3: Total Akumulasi Transaksi */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-500 font-semibold mb-2">
              Total Nilai Transaksi Selesai
            </div>
            <div className="text-2xl font-black font-mono tracking-tight text-slate-900 mt-1">
              {formatPrice(totalSettledIDR)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Akumulasi perdagangan sejak verifikasi legalitas perusahaan
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500">
            Rekening Terverifikasi: <strong>{currentCompany.name}</strong>
          </div>
        </div>
      </div>

      {/* Mutasi Transaksi Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Riwayat Mutasi Saldo & Escrow</h2>
            <p className="text-[11px] text-slate-500">Seluruh pencairan dan deposit tercatat dalam Rupiah</p>
          </div>
          <button
            onClick={() => showToast('Mengunduh rekening koran mutasi (PDF)...')}
            className="text-xs font-semibold text-slate-700 hover:text-emerald-700 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Unduh Rekening Koran</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3.5">ID Mutasi</th>
                <th className="p-3.5">Tanggal & Waktu</th>
                <th className="p-3.5">Keterangan Transaksi</th>
                <th className="p-3.5">No. Referensi Bank</th>
                <th className="p-3.5 text-right">Nominal (Rp)</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {transactionsHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-900">{item.id}</td>
                  <td className="p-3.5 text-slate-500 font-mono text-[11px]">{item.date}</td>
                  <td className="p-3.5 font-medium text-slate-900">{item.desc}</td>
                  <td className="p-3.5 font-mono text-slate-500 text-[11px]">{item.ref}</td>
                  <td className="p-3.5 text-right font-mono font-bold">
                    <span className={item.type === 'credit' ? 'text-emerald-700' : 'text-slate-900'}>
                      {item.type === 'credit' ? '+' : '-'} {formatPrice(item.amount)}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Berhasil
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TOP-UP SALDO ESCROW (ROLE PEMBELI / PABRIK) */}
      {topupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Top-Up Saldo Escrow Pabrik
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rekening penampung resmi platform Scrava sesuai regulasi Bank Indonesia (BI)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTopupModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTopupSubmit} className="space-y-5">
              {/* Step 1: Nominal Top-Up */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  1. Pilih atau Masukkan Nominal Deposit (Rp) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(Number(e.target.value))}
                    step="1000000"
                    min="100000"
                    required
                    className="w-full pl-10 pr-3 py-2.5 text-base border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-600 font-mono font-black text-slate-900"
                  />
                </div>

                {/* Quick Chips (Termasuk Nominal Milyaran) */}
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <span className="text-[11px] text-slate-500 font-medium">Nominal Cepat:</span>
                  {[
                    { label: 'Rp 10 Jt', val: 10000000 },
                    { label: 'Rp 50 Jt', val: 50000000 },
                    { label: 'Rp 250 Jt (Limit BI-FAST)', val: 250000000 },
                    { label: 'Rp 1 Milyar (RTGS)', val: 1000000000 },
                    { label: 'Rp 2,5 Milyar (RTGS)', val: 2500000000 },
                  ].map((chip) => (
                    <button
                      key={chip.val}
                      type="button"
                      onClick={() => setTopupAmount(chip.val)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                        topupAmount === chip.val
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Indikator Regulasi Bank Indonesia untuk Transaksi Besar / Milyaran */}
                {topupAmount >= 100000000 && (
                  <div className="mt-2.5 p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-2 text-xs text-blue-900">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Regulasi Bank Indonesia (BI) untuk Transaksi $\ge$ Rp 100 Juta - Milyaran:</span>
                      <p className="text-[11px] text-blue-800/90 mt-0.5 leading-relaxed">
                        Sesuai ketentuan BI, nominal $\ge$ Rp 100.000.000 direkomendasikan ditransfer via <strong>RTGS (Real Time Gross Settlement)</strong> untuk penyelesaian seketika tanpa limit nominal harian, atau via <strong>BI-FAST</strong> (maks. Rp 250 Juta per transaksi).
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Pilih Metode Pembayaran */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  2. Pilih Metode Pembayaran
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Metode 1: Transfer Bank Escrow Scrava (Sesuai Aturan BI) */}
                  <button
                    type="button"
                    onClick={() => setTopupMethod('escrow_transfer')}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      topupMethod === 'escrow_transfer'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Landmark className="w-4 h-4 text-emerald-700" />
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        Pabrik / Milyaran
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">Transfer Bank Escrow</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">BI-FAST / SKN / RTGS Bank Indonesia</div>
                  </button>

                  {/* Metode 2: Virtual Account Bank */}
                  <button
                    type="button"
                    onClick={() => setTopupMethod('va')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      topupMethod === 'va'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <CreditCard className="w-4 h-4 text-slate-700" />
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        Otomatis 24/7
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">Virtual Account (VA)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">BCA, Mandiri, BNI, BRI</div>
                  </button>

                  {/* Metode 3: QRIS Dinamis */}
                  <button
                    type="button"
                    onClick={() => {
                      if (topupAmount > 10000000) {
                        showToast('Sesuai aturan BI, limit maksimal QRIS adalah Rp 10.000.000 per transaksi.');
                      }
                      setTopupMethod('qris');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      topupMethod === 'qris'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <QrCode className="w-4 h-4 text-slate-700" />
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        Maks Rp 10 Jt
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">QRIS Dinamis</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Scan BCA, Livin, GoPay, OVO</div>
                  </button>
                </div>
              </div>

              {/* Step 3: Detail Pembayaran Berdasarkan Pilihan */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                {/* PILIHAN 1: TRANSFER REKENING ESCROW RESMI (ATURAN BI / MILYARAN) */}
                {topupMethod === 'escrow_transfer' && (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Pilih Rekening Bank Escrow Scrava:</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedBank('mandiri')}
                          className={`text-xs px-2.5 py-1 rounded border font-bold transition-colors ${
                            selectedBank === 'mandiri'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          Bank Mandiri
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedBank('bca')}
                          className={`text-xs px-2.5 py-1 rounded border font-bold transition-colors ${
                            selectedBank === 'bca'
                              ? 'bg-blue-700 text-white border-blue-700'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          BCA Corporate
                        </button>
                      </div>
                    </div>

                    {/* Kotak Rekening */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div>
                          <div className="text-[11px] text-slate-500">Nama Bank:</div>
                          <div className="font-bold text-slate-900 text-xs">
                            {selectedBank === 'mandiri' ? 'PT Bank Mandiri (Persero) Tbk' : 'PT Bank Central Asia Tbk (BCA)'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] text-slate-500">Kode Bank:</div>
                          <div className="font-mono font-bold text-slate-900 text-xs">
                            {selectedBank === 'mandiri' ? '008' : '014'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <div>
                          <div className="text-[11px] text-slate-500">Nomor Rekening Escrow:</div>
                          <div className="font-mono text-base font-black text-emerald-800 tracking-wider">
                            {selectedBank === 'mandiri' ? '142-00-889988-1' : '218-300-9988'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              selectedBank === 'mandiri' ? '142008899881' : '2183009988',
                              'rekening'
                            )
                          }
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                        >
                          {copiedKey === 'rekening' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'rekening' ? 'Tersalin' : 'Salin Rek'}</span>
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <div className="text-[11px] text-slate-500">Atas Nama Rekening:</div>
                          <div className="font-bold text-slate-900">PT SCRAVA NIAGA INDONESIA (ESCROW)</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] text-slate-500">Cabang:</div>
                          <div className="font-semibold text-slate-700">KCU Sudirman, Jakarta</div>
                        </div>
                      </div>
                    </div>

                    {/* Berita Acara Transfer */}
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[11px] text-emerald-800 font-semibold">Berita Transfer Wajib (Cantumkan di keterangan transfer):</div>
                        <div className="font-mono font-bold text-emerald-950 text-xs mt-0.5">
                          TOPUP-{currentCompany.name.slice(0, 10).replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            `TOPUP-${currentCompany.name.slice(0, 10).replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}`,
                            'berita'
                          )
                        }
                        className="px-2.5 py-1 bg-white text-emerald-900 border border-emerald-300 rounded font-bold hover:bg-emerald-100 text-xs"
                      >
                        {copiedKey === 'berita' ? 'Tersalin' : 'Salin Berita'}
                      </button>
                    </div>

                    {/* Jalur Transfer Sesuai Aturan BI */}
                    <div className="text-[11px] text-slate-600 space-y-1">
                      <div className="font-bold text-slate-800">Petunjuk Transfer Bank Indonesia:</div>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
                        <li><strong>RTGS (Real Time Gross Settlement)</strong>: Masukkan nomor rekening di atas melalui teller bank atau internet banking corporate (Kopra Mandiri / KlikBCA Bisnis) dengan metode RTGS untuk nominal $\ge$ Rp 100 Jt s.d. Puluhan Milyar.</li>
                        <li><strong>BI-FAST</strong>: Gunakan untuk nominal s.d. Rp 250.000.000 per transaksi (instan 24 jam).</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* PILIHAN 2: VIRTUAL ACCOUNT */}
                {topupMethod === 'va' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Pilih Bank Virtual Account:</span>
                      <div className="flex gap-1.5">
                        {(['bca', 'mandiri', 'bni', 'bri'] as const).map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setSelectedBank(b)}
                            className={`text-xs px-2 py-0.5 rounded font-bold uppercase transition-colors ${
                              selectedBank === b
                                ? 'bg-slate-900 text-white'
                                : 'bg-white text-slate-600 border border-slate-200'
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <div className="text-[11px] text-slate-500">Nomor Virtual Account ({selectedBank.toUpperCase()}):</div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-lg font-black text-slate-900 tracking-wider">
                          {selectedBank === 'bca'
                            ? '8277 0812 3456 7890'
                            : selectedBank === 'mandiri'
                            ? '8888 1234 5678 9012'
                            : selectedBank === 'bni'
                            ? '9880 7712 3456 7890'
                            : '1280 0012 3456 7890'}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              selectedBank === 'bca'
                                ? '8277081234567890'
                                : selectedBank === 'mandiri'
                                ? '8888123456789012'
                                : selectedBank === 'bni'
                                ? '9880771234567890'
                                : '1280001234567890',
                              'va'
                            )
                          }
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                        >
                          {copiedKey === 'va' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'va' ? 'Tersalin' : 'Salin VA'}</span>
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                        Atas Nama: <strong>SCRAVA ESCROW - {currentCompany.name}</strong>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 leading-relaxed">
                      Virtual Account akan diverifikasi otomatis oleh sistem bursa secara instan setelah dana diterima.
                    </div>
                  </div>
                )}

                {/* PILIHAN 3: QRIS DINAMIS */}
                {topupMethod === 'qris' && (
                  <div className="space-y-3 text-center sm:text-left">
                    {topupAmount > 10000000 ? (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 text-amber-700" />
                          <span>Melebihi Limit QRIS Bank Indonesia</span>
                        </div>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          Sesuai ketentuan Bank Indonesia (BI), batas maksimal transaksi per kode QRIS adalah <strong>Rp 10.000.000</strong>.
                          Untuk deposit senilai <strong>{formatPrice(topupAmount)}</strong>, silakan pilih metode <strong>Transfer Bank Escrow (RTGS)</strong> atau <strong>Virtual Account</strong>.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                        <div className="p-3 bg-white border border-slate-300 rounded-xl shadow-xs shrink-0 flex flex-col items-center">
                          <QrCode className="w-32 h-32 text-slate-900" />
                          <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                            QRIS · GPN RESMI
                          </div>
                        </div>
                        <div className="space-y-1.5 text-xs text-slate-600">
                          <div className="font-bold text-slate-900 text-sm">
                            Scan Kode QRIS Dinamis
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Buka aplikasi mobile banking (BCA mobile, Livin Mandiri, BRImo, BNI Mobile) atau dompet digital (GoPay, OVO, ShopeePay), lalu arahkan kamera ke kode QR.
                          </p>
                          <div className="text-xs font-mono font-bold text-emerald-800 pt-1">
                            Total Bayar: {formatPrice(topupAmount)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* No. Referensi Transfer Opsional */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Referensi Bank / Catatan Pengirim (Opsional)
                  </label>
                  <input
                    type="text"
                    value={transferProofRef}
                    onChange={(e) => setTransferProofRef(e.target.value)}
                    placeholder="cth. RTGS-MDR-881920 atau lampirkan no. transaksi"
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="text-xs">
                  <span className="text-slate-500">Total Masuk ke Saldo: </span>
                  <span className="font-mono font-black text-slate-900 text-sm">
                    {formatPrice(topupAmount)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTopupModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Pembayaran Selesai</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tarik Saldo (Role Penjual / Depo) */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Tarik Saldo ke Rekening Perusahaan
            </h3>
            <p className="text-xs text-slate-500">
              Dana akan ditransfer secara real-time via BI-FAST / RTGS ke rekening resmi yang telah lolos verifikasi legalitas.
            </p>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nominal Penarikan (Rp) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    max={availableBalanceIDR}
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono font-bold text-slate-900 text-base"
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Maksimal saldo bisa ditarik: <strong>{formatPrice(availableBalanceIDR)}</strong>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <div className="text-[11px] text-slate-500 font-semibold">Rekening Tujuan:</div>
                <div className="font-bold text-slate-900">Bank Central Asia (BCA)</div>
                <div className="font-mono text-slate-600">No. Rek: 018-992-1200 a/n {currentCompany.name}</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  Konfirmasi Tarik Dana
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

