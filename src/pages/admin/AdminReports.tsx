import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Download,
  Calendar,
  Search,
  Filter,
  Printer,
  Package,
  ArrowUpDown,
  Building2,
  Store,
  CheckCircle2,
  Clock,
  Landmark,
  Scale
} from 'lucide-react';

interface AdminReportsProps {
  navigate?: (path: string, params?: any) => void;
}

interface ReportTransaction {
  id: string;
  orderNumber: string;
  date: string; // YYYY-MM-DD
  time: string;
  sellerName: string;
  buyerName: string;
  commodity: string;
  quantityMT: number;
  pricePerKgIDR: number;
  totalAmountIDR: number;
  platformFeeIDR: number;
  status: string;
  paymentStatus: 'DIBAYAR_ESCROW' | 'MENUNGGU_PEMBAYARAN' | 'DANA_DICAIRKAN' | 'DIBATALKAN';
}

const REPORT_TRANSACTIONS: ReportTransaction[] = [
  {
    id: 'TX-1004',
    orderNumber: 'TRZ-PO-551029',
    date: '2026-09-29',
    time: '11:45 WIB',
    sellerName: 'Depo Daur Ulang Plastik Presisi',
    buyerName: 'PT Indo Pelletizer Plastik Gemilang',
    commodity: 'Baled PET Flakes Bening B2B',
    quantityMT: 30,
    pricePerKgIDR: 9500,
    totalAmountIDR: 285000000,
    platformFeeIDR: 3420000,
    status: 'Menunggu Escrow',
    paymentStatus: 'MENUNGGU_PEMBAYARAN',
  },
  {
    id: 'TX-1003',
    orderNumber: 'TRZ-PO-661920',
    date: '2026-09-29',
    time: '08:30 WIB',
    sellerName: 'Lapak Scrap Aluminium Nusantara',
    buyerName: 'PT Mandiri Daur Aluminium',
    commodity: 'Aluminium Profil 6063 Scrap',
    quantityMT: 15,
    pricePerKgIDR: 29000,
    totalAmountIDR: 435000000,
    platformFeeIDR: 5220000,
    status: 'Dana Terkunci di Escrow',
    paymentStatus: 'DIBAYAR_ESCROW',
  },
  {
    id: 'TX-1001',
    orderNumber: 'TRZ-PO-882103',
    date: '2026-09-28',
    time: '14:20 WIB',
    sellerName: 'Depo Logam Metalindo Jaya',
    buyerName: 'PT Cilegon Precision Steel',
    commodity: 'Scrap Besi Baja Berat HMS 1/2',
    quantityMT: 25,
    pricePerKgIDR: 6400,
    totalAmountIDR: 160000000,
    platformFeeIDR: 1920000,
    status: 'Timbang Terima di Pabrik',
    paymentStatus: 'DIBAYAR_ESCROW',
  },
  {
    id: 'TX-1002',
    orderNumber: 'TRZ-PO-771029',
    date: '2026-09-27',
    time: '16:00 WIB',
    sellerName: 'CV Tembaga Raya Abadi',
    buyerName: 'PT Surya Metal Tembaga Utama',
    commodity: 'Tembaga Millberry Scrap Kawat 99.9%',
    quantityMT: 5,
    pricePerKgIDR: 125000,
    totalAmountIDR: 625000000,
    platformFeeIDR: 7500000,
    status: 'Selesai (Dana Release)',
    paymentStatus: 'DANA_DICAIRKAN',
  },
  {
    id: 'TX-0998',
    orderNumber: 'TRZ-PO-770912',
    date: '2026-09-26',
    time: '10:15 WIB',
    sellerName: 'Depo Besi Tua Cilegon Jaya',
    buyerName: 'PT Krakatau Posco Smelting',
    commodity: 'Scrap Besi Plate & Structural',
    quantityMT: 40,
    pricePerKgIDR: 6500,
    totalAmountIDR: 260000000,
    platformFeeIDR: 3120000,
    status: 'Selesai (Dana Release)',
    paymentStatus: 'DANA_DICAIRKAN',
  },
  {
    id: 'TX-0995',
    orderNumber: 'TRZ-PO-660811',
    date: '2026-09-25',
    time: '13:40 WIB',
    sellerName: 'UD Sumber Logam Karawang',
    buyerName: 'PT Surya Metal Tembaga Utama',
    commodity: 'Tembaga Bare Bright / Kuningan',
    quantityMT: 8,
    pricePerKgIDR: 118000,
    totalAmountIDR: 944000000,
    platformFeeIDR: 11328000,
    status: 'Selesai (Dana Release)',
    paymentStatus: 'DANA_DICAIRKAN',
  },
  {
    id: 'TX-0992',
    orderNumber: 'TRZ-PO-550702',
    date: '2026-09-24',
    time: '09:00 WIB',
    sellerName: 'Depo Scrap Logam Maju Surabaya',
    buyerName: 'PT Cilegon Precision Steel',
    commodity: 'Besi Plat Tipis & Balpres',
    quantityMT: 50,
    pricePerKgIDR: 5800,
    totalAmountIDR: 290000000,
    platformFeeIDR: 3480000,
    status: 'Selesai (Dana Release)',
    paymentStatus: 'DANA_DICAIRKAN',
  },
];

export const AdminReports: React.FC<AdminReportsProps> = () => {
  const { formatPrice, showToast } = useApp();

  // Default to today: '2026-09-29'
  const todayStr = useMemo(() => {
    const now = new Date();
    // Use ISO string YYYY-MM-DD
    const iso = now.toISOString().split('T')[0];
    return iso;
  }, []);

  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Quick Date Range Shortcuts
  const setQuickRange = (rangeType: 'today' | 'yesterday' | 'last7' | 'month' | 'all') => {
    const today = new Date(todayStr);

    if (rangeType === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (rangeType === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split('T')[0];
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (rangeType === 'last7') {
      const past7 = new Date(today);
      past7.setDate(past7.getDate() - 6);
      setStartDate(past7.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (rangeType === 'month') {
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      setStartDate(`${y}-${m}-01`);
      setEndDate(todayStr);
    } else if (rangeType === 'all') {
      setStartDate('2026-09-01');
      setEndDate(todayStr);
    }
  };

  // Filter transactions based on date range, search query, and status
  const filteredTransactions = useMemo(() => {
    return REPORT_TRANSACTIONS.filter((tx) => {
      // Date filter
      const matchesDate = tx.date >= startDate && tx.date <= endDate;
      if (!matchesDate) return false;

      // Status filter
      if (statusFilter !== 'ALL' && tx.paymentStatus !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          tx.orderNumber.toLowerCase().includes(q) ||
          tx.sellerName.toLowerCase().includes(q) ||
          tx.buyerName.toLowerCase().includes(q) ||
          tx.commodity.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [startDate, endDate, searchQuery, statusFilter]);

  // Aggregated KPIs
  const totalVolumeMT = filteredTransactions.reduce((acc, tx) => acc + tx.quantityMT, 0);
  const totalAmountIDR = filteredTransactions.reduce((acc, tx) => acc + tx.totalAmountIDR, 0);
  const totalFeeIDR = filteredTransactions.reduce((acc, tx) => acc + tx.platformFeeIDR, 0);
  const totalTxCount = filteredTransactions.length;

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Export to CSV function
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      showToast('Tidak ada transaksi pada rentang tanggal terpilih untuk diekspor.');
      return;
    }

    const headers = [
      'No',
      'No. PO',
      'Tanggal Transaksi',
      'Jam',
      'Penjual (Pengepul)',
      'Pembeli (Pabrik)',
      'Komoditas Bahan Baku',
      'Tonase (MT)',
      'Harga / Kg (Rp)',
      'Total Nilai Transaksi (Rp)',
      'Fee Platform (Rp)',
      'Status Transaksi',
      'Status Escrow'
    ];

    const rows = filteredTransactions.map((tx, idx) => [
      idx + 1,
      `"${tx.orderNumber}"`,
      `"${tx.date}"`,
      `"${tx.time}"`,
      `"${tx.sellerName}"`,
      `"${tx.buyerName}"`,
      `"${tx.commodity}"`,
      tx.quantityMT,
      tx.pricePerKgIDR,
      tx.totalAmountIDR,
      tx.platformFeeIDR,
      `"${tx.status}"`,
      `"${tx.paymentStatus}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Laporan_Transaksi_Scrava_${startDate}_sd_${endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Berhasil mengekspor Laporan Transaksi (${filteredTransactions.length} baris).`);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Laporan Transaksi Bursa
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi resmi transaksi jual-beli scrap, tonase pengiriman, dan perputaran dana antar pabrik dan depo
          </p>
        </div>

        <div className="flex items-center gap-2.5 print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Laporan</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Date Range & Filter Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Date Range Inputs */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Rentang Tanggal:</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-2 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-slate-50 focus:outline-hidden focus:border-purple-600"
              />
              <span className="text-slate-400 font-bold">s/d</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-2 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-slate-50 focus:outline-hidden focus:border-purple-600"
              />
            </div>

            {/* Quick Range Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setQuickRange('today')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  startDate === todayStr && endDate === todayStr
                    ? 'bg-purple-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hari Ini (Default)
              </button>
              <button
                type="button"
                onClick={() => setQuickRange('yesterday')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900"
              >
                Kemarin
              </button>
              <button
                type="button"
                onClick={() => setQuickRange('last7')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900"
              >
                7 Hari Terakhir
              </button>
              <button
                type="button"
                onClick={() => setQuickRange('month')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900"
              >
                Bulan Ini
              </button>
              <button
                type="button"
                onClick={() => setQuickRange('all')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900"
              >
                Semua
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No. PO, pabrik, depo, scrap..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-purple-600"
            />
          </div>
        </div>

        {/* Status Filter Pill Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap text-xs">
          <span className="text-slate-500 font-medium">Status Escrow:</span>
          {(['ALL', 'DIBAYAR_ESCROW', 'DANA_DICAIRKAN', 'MENUNGGU_PEMBAYARAN'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-purple-900 text-white border-purple-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL'
                ? 'Semua Status'
                : st === 'DIBAYAR_ESCROW'
                ? 'Dana di Escrow'
                : st === 'DANA_DICAIRKAN'
                ? 'Dana Selesai Release'
                : 'Menunggu Pembayaran'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>Jumlah Transaksi</span>
            <Package className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {totalTxCount} PO
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Periode: {startDate} s/d {endDate}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>Total Tonase Scrap</span>
            <Scale className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black font-mono text-blue-700 mt-1">
            {totalVolumeMT.toLocaleString('id-ID')} MT
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {totalVolumeMT * 1000} Kg terverifikasi jembatan
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>Total Nilai Transaksi</span>
            <Landmark className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
            {formatPrice(totalAmountIDR)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Perputaran bruto perdagangan
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>Estimasi Fee Platform</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black font-mono text-indigo-700 mt-1">
            {formatPrice(totalFeeIDR)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Fee kliring bursa (1.2%)
          </div>
        </div>
      </div>

      {/* Printable Report Header (Visible only when printed) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-slate-900">PT SCRAVA BURSA LOGAM INDONESIA</h1>
            <p className="text-xs text-slate-600">Laporan Rekapitulasi Transaksi Perdagangan Bahan Baku</p>
          </div>
          <div className="text-right text-xs text-slate-600 font-mono">
            <div>Periode: <strong>{startDate} s/d {endDate}</strong></div>
            <div>Dicetak: {new Date().toLocaleString('id-ID')}</div>
          </div>
        </div>
      </div>

      {/* Main Transactions Report Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Daftar Transaksi Periode: {startDate} s/d {endDate}
            </h2>
            <span className="text-[11px] font-mono text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full font-bold">
              {filteredTransactions.length} Record Ditemukan
            </span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Standar Akuntansi B2B Indonesia
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3.5">No. PO & Waktu</th>
                <th className="p-3.5">Penjual (Depo)</th>
                <th className="p-3.5">Pembeli (Pabrik)</th>
                <th className="p-3.5">Komoditas Scrap</th>
                <th className="p-3.5 text-center">Tonase (MT)</th>
                <th className="p-3.5 text-right">Harga / Kg</th>
                <th className="p-3.5 text-right">Nilai Total (Rp)</th>
                <th className="p-3.5 text-right">Fee Bursa</th>
                <th className="p-3.5 text-center">Status Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Tidak ada data transaksi yang sesuai dengan filter rentang tanggal <strong>{startDate}</strong> s/d <strong>{endDate}</strong>.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-slate-900">{tx.orderNumber}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {tx.date} · {tx.time}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{tx.sellerName}</div>
                      <div className="text-[10px] text-slate-400">Depo Scrap</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{tx.buyerName}</div>
                      <div className="text-[10px] text-emerald-700 font-medium">Pabrik Peleburan</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-900">{tx.commodity}</div>
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                      {tx.quantityMT} MT
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-600">
                      Rp {tx.pricePerKgIDR.toLocaleString('id-ID')}
                    </td>
                    <td className="p-3.5 text-right font-mono font-black text-slate-900">
                      {formatPrice(tx.totalAmountIDR)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-purple-700 text-[11px]">
                      {formatPrice(tx.platformFeeIDR)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          tx.paymentStatus === 'DANA_DICAIRKAN'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : tx.paymentStatus === 'DIBAYAR_ESCROW'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredTransactions.length > 0 && (
              <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200 text-slate-900 text-xs">
                <tr>
                  <td colSpan={4} className="p-3.5 font-bold uppercase tracking-wider">
                    TOTAL KESELURUHAN ({filteredTransactions.length} TRANSAKSI)
                  </td>
                  <td className="p-3.5 text-center font-mono font-black text-blue-800">
                    {totalVolumeMT.toLocaleString('id-ID')} MT
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-400">-</td>
                  <td className="p-3.5 text-right font-mono font-black text-emerald-800">
                    {formatPrice(totalAmountIDR)}
                  </td>
                  <td className="p-3.5 text-right font-mono font-black text-purple-900">
                    {formatPrice(totalFeeIDR)}
                  </td>
                  <td className="p-3.5 text-center text-slate-400">-</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Print Footer with Signatures */}
      <div className="hidden print:grid grid-cols-2 pt-12 text-center text-xs">
        <div>
          <div className="text-slate-500">Disiapkan Oleh:</div>
          <div className="mt-16 font-bold text-slate-900">Superadmin Operasional Bursa</div>
          <div className="text-slate-400 text-[10px]">PT SCRAVA BURSA LOGAM</div>
        </div>
        <div>
          <div className="text-slate-500">Mengetahui / Disetujui:</div>
          <div className="mt-16 font-bold text-slate-900">Direktur Keuangan & Kliring</div>
          <div className="text-slate-400 text-[10px]">PT SCRAVA BURSA LOGAM</div>
        </div>
      </div>
    </div>
  );
};
