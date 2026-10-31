import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../api/client';
import { MOCK_BIDS } from '../../data/mockData';
import { StatusBadge } from '../../components/common/StatusBadge';
import { UpgradeToFactoryModal } from '../../components/common/UpgradeToFactoryModal';
import {
  Gavel,
  Clock,
  ArrowLeft,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  FileText,
  DollarSign,
  ChevronRight,
  Info,
  CheckCircle2,
  Lock,
  CreditCard,
  RefreshCw,
  Sparkles,
  Check,
  Zap,
  ShoppingBag,
  X
} from 'lucide-react';

interface AuctionDetailProps {
  id?: string;
  navigate: (path: string, params?: any) => void;
}

export const AuctionDetailPage: React.FC<AuctionDetailProps> = ({ id, navigate }) => {
  const { auctions, listings, formatPrice, placeBid, userRole, currentUser, currentCompany, isBuyerVerified, showToast } = useApp();

  const auction = auctions.find((a) => a.id === id) || auctions[0] || listings[1];

  const currentBidAmount = auction.currentBid || auction.minAskingPrice || 1000;
  const increment = auction.bidIncrement || 50;
  const minRequiredBid = currentBidAmount + increment;
  const buyNowPriceTotal = (auction as any).buyNowPrice || Math.round(currentBidAmount * (auction.quantity || 1) * 1.35);

  // Buy Now Modal State
  const [buyNowModalOpen, setBuyNowModalOpen] = useState<boolean>(false);
  const [isProcessingBuyNow, setIsProcessingBuyNow] = useState<boolean>(false);

  // Server Time State
  const [serverTimeFormatted, setServerTimeFormatted] = useState<string>('Memuat waktu server...');
  const [serverTimestamp, setServerTimestamp] = useState<number>(Date.now());
  const [syncStatus, setSyncStatus] = useState<boolean>(false);

  // Deposit Status: 'NONE' | 'PENDING_PAYMENT' | 'VERIFIED_FREE' | 'VERIFIED_PAID'
  const [depositStatus, setDepositStatus] = useState<'NONE' | 'PENDING_PAYMENT' | 'VERIFIED_FREE' | 'VERIFIED_PAID'>('NONE');
  const [depositType, setDepositType] = useState<'free' | 'paid'>('free');
  const [selectedBank, setSelectedBank] = useState<string>('BCA');
  const [vaNumber, setVaNumber] = useState<string>('880293817294819');
  const depositAmountPaid = 5000000; // Rp 5.000.000 untuk jaminan kilat

  // Bidding State
  const [bidInput, setBidInput] = useState<number>(minRequiredBid);
  const [bidsHistory, setBidsHistory] = useState(MOCK_BIDS.filter((b) => b.listingId === auction.id || true));
  const [showLegalityModal, setShowLegalityModal] = useState(false);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  // Handle Action 1: Beli Langsung (Buy Now)
  const handleConfirmBuyNow = async () => {
    if (userRole === 'public') {
      showToast('Silakan login terlebih dahulu untuk melakukan pembelian langsung.');
      navigate('login');
      return;
    }

    try {
      setIsProcessingBuyNow(true);
      const company = currentUser?.companyName || currentCompany?.name || 'Depo Scrap Berkah Mandiri';
      await apiClient.projectAuctions.buyNow(auction.id, company);
      showToast('Pembelian langsung lelang berhasil! Kontrak pesanan Escrow Scrava telah diterbitkan.');
      setBuyNowModalOpen(false);
      navigate('orders');
    } catch (err: any) {
      showToast(err.message || 'Gagal memproses pembelian langsung.');
    } finally {
      setIsProcessingBuyNow(false);
    }
  };

  // Handle Action 2: Bid Lelang (Ikuti Lelang -> Masuk ke Listing Bid)
  const handleBidLelangClick = async () => {
    if (userRole === 'public') {
      showToast('Silakan masuk ke akun Anda terlebih dahulu untuk mengikuti lelang.');
      navigate('login');
      return;
    }

    try {
      const company = currentUser?.companyName || currentCompany?.name || 'Depo Scrap Berkah Mandiri';
      await apiClient.projectAuctions.registerDeposit(auction.id, company, 'BCA');
      showToast('Pendaftaran lelang berhasil! Mengarahkan ke Listing Bid Saya untuk pembayaran jaminan & penawaran...');
      navigate('dashboard-project-bids');
    } catch (err) {
      showToast('Mengarahkan ke Listing Bid Saya...');
      navigate('dashboard-project-bids');
    }
  };

  // Sync with Server Time
  useEffect(() => {
    let interval: any = null;

    const fetchServerTime = async () => {
      try {
        const res = await apiClient.system.getServerTime();
        setServerTimestamp(res.timestamp);
        setServerTimeFormatted(res.formattedWIB);
        setSyncStatus(true);
      } catch (err) {
        const now = new Date();
        setServerTimestamp(now.getTime());
        setServerTimeFormatted(
          now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB (Lokal)'
        );
      }
    };

    fetchServerTime();

    // Clock ticker every second
    interval = setInterval(() => {
      setServerTimestamp((prev) => {
        const next = prev + 1000;
        const d = new Date(next);
        setServerTimeFormatted(
          d.toLocaleString('id-ID', {
            timeZone: 'Asia/Jakarta',
            hour12: false,
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }) + ' WIB'
        );
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle Flow Step 1: Login Check
  const handleInitiateBidding = () => {
    if (userRole === 'public') {
      showToast('Silakan masuk ke akun Anda terlebih dahulu untuk mengikuti lelang.');
      navigate('login');
      return;
    }
  };

  // Handle Flow Step 2: Confirm Deposit (Bisa Gratis atau Berbayar)
  const handleConfirmDeposit = () => {
    if (depositType === 'free') {
      setDepositStatus('VERIFIED_FREE');
      showToast('Uang Jaminan Bebas Biaya (Gratis) Berhasil Diaktifkan! Selamat datang di sesi penawaran.');
    } else {
      setDepositStatus('PENDING_PAYMENT');
      setVaNumber(`880${Math.floor(100000000000 + Math.random() * 900000000000)}`);
      showToast('Tagihan Virtual Account Jaminan Lelang berhasil diterbitkan. Silakan selesaikan pembayaran.');
    }
  };

  // Instant simulate payment for paid deposit
  const handleSimulateDepositPayment = () => {
    setDepositStatus('VERIFIED_PAID');
    showToast('Pembayaran Uang Jaminan Berhasil Diverifikasi! Hak penawaran lelang kini aktif.');
  };

  // Handle Flow Step 3: Place Bid
  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();

    if (userRole === 'public') {
      showToast('Silakan masuk untuk mengikuti lelang resmi.');
      navigate('login');
      return;
    }

    if (depositStatus === 'NONE' || depositStatus === 'PENDING_PAYMENT') {
      showToast('Anda harus menyelesaikan verifikasi uang jaminan lelang terlebih dahulu.');
      return;
    }

    if (!isBuyerVerified) {
      setShowLegalityModal(true);
      return;
    }

    if (bidInput < minRequiredBid) {
      showToast(`Tawaran minimal adalah ${formatPrice(minRequiredBid)}`);
      return;
    }

    setIsSubmittingBid(true);
    const res = placeBid(auction.id, bidInput);

    if (res.success) {
      const bidderName = currentUser?.companyName || currentCompany?.name || 'PT Cilegon Precision Steel';
      const newHistoryItem = {
        id: `BID-${Date.now().toString().slice(-4)}`,
        listingId: auction.id,
        bidderCompany: bidderName,
        bidderCountry: 'Indonesia',
        amount: bidInput,
        timestamp: `${serverTimeFormatted.split(',')[1]?.trim() || 'Baru saja'} (Waktu Server)`,
        status: 'WINNING' as const,
      };

      setBidsHistory([newHistoryItem, ...bidsHistory.map((b) => ({ ...b, status: 'OUTBID' as const }))]);
      setBidInput(bidInput + increment);
      showToast(`Tawaran lelang sah sebesar ${formatPrice(bidInput, auction.unit)} berhasil dipasang mengacu pada waktu server!`);
    } else {
      showToast(res.message);
    }
    setIsSubmittingBid(false);
  };

  const isDepositVerified = depositStatus === 'VERIFIED_FREE' || depositStatus === 'VERIFIED_PAID';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-6">
      {/* Server Time Bar (Presisi Waktu Server Bursa) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-2.5 rounded-xl border border-slate-700 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-300">Waktu Server Resmi Bursa:</span>
          <span className="font-mono font-black text-emerald-300 text-sm tracking-wider">
            {serverTimeFormatted}
          </span>
          {syncStatus && (
            <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-700 font-mono">
              NTP SYNC ✓
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span>Sinkronisasi Otomatis Seluruh Penawar</span>
        </div>
      </div>

      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('auctions')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Lelang Kilat</span>
        </button>
        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
          <span>Sesi Lelang Aktif Berlangsung</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Image, Lot Specs, Documents, Bids History */}
        <div className="lg:col-span-7 space-y-6">
          <div className="aspect-16/10 bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 relative shadow-xs">
            <img
              src={auction.photos[0]}
              alt={auction.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="px-2.5 py-1 text-xs font-black text-slate-950 bg-amber-400 rounded-lg flex items-center gap-1 shadow-xs">
                <Gavel className="w-3.5 h-3.5" />
                LELANG KILAT
              </span>
              <StatusBadge status={auction.condition} />
            </div>

            <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-xs text-white p-3.5 rounded-xl border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">
                    Hitung Mundur Waktu Server
                  </div>
                  <div className="text-sm font-bold font-mono text-amber-400">
                    {auction.closingCountdown || '01 Hari 05 Jam 23 Menit 14 Detik'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Total Tonase Lot</div>
                <div className="text-xs font-mono font-bold text-white">
                  {auction.quantity} {auction.unit}
                </div>
              </div>
            </div>
          </div>

          {/* Details & Specs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-snug">{auction.title}</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Lot lelang industri bersertifikat resmi. Setiap tawaran yang dipasang mengikat dan dijamin oleh sistem rekening bersama escrow Scrava. Pengiriman dilakukan sesuai ketentuan <strong>{auction.incoterm}</strong>.
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Spesifikasi Teknis Lot
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-500">Kategori Material:</span>
                  <span className="font-bold text-slate-800 ml-2">{auction.category}</span>
                </div>
                <div>
                  <span className="text-slate-500">Kondisi Fisik:</span>
                  <span className="font-bold text-slate-800 ml-2">{auction.condition}</span>
                </div>
                <div>
                  <span className="text-slate-500">Depo Asal:</span>
                  <span className="font-bold text-slate-800 ml-2">{auction.location.city}, {auction.location.country}</span>
                </div>
                <div>
                  <span className="text-slate-500">Syarat Pengiriman:</span>
                  <span className="font-mono font-bold text-slate-800 ml-2">{auction.incoterm}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bidding History Table (Audit Transparan) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Riwayat Penawaran Resmi ({bidsHistory.length} Bid Masuk)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Catatan transparan terverifikasi dengan stempel waktu server resmi
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Waktu Server WIB</span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Perusahaan Penawar</th>
                    <th className="py-2.5 px-3">Asal Kota</th>
                    <th className="py-2.5 px-3 text-right">Nilai Tawaran</th>
                    <th className="py-2.5 px-3">Waktu Stempel</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bidsHistory.map((b, idx) => (
                    <tr key={b.id} className={`hover:bg-slate-50 ${idx === 0 ? 'bg-emerald-50/40' : ''}`}>
                      <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{b.bidderCompany}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{b.bidderCountry}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 tabular-nums text-xs">
                        {formatPrice(b.amount, auction.unit)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px] font-mono">{b.timestamp}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.status === 'WINNING'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {b.status === 'WINNING' ? 'MEMIMPIN (#1)' : 'TERLAMPAUI'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): 3-Step Guided Auction Flow */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Interactive Flow Box */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-md space-y-5">
            {/* Current Price Summary */}
            <div className="pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tawaran Tertinggi Saat Ini
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  LIVE AUCTION
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-black text-slate-900 font-mono tabular-nums">
                    {formatPrice(currentBidAmount)}
                  </div>
                  <div className="text-[11px] text-slate-500">per {auction.unit} · Total Lot: {formatPrice(currentBidAmount * auction.quantity)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Kelipatan Minimal</div>
                  <div className="text-xs font-bold text-slate-700 font-mono tabular-nums">
                    +{formatPrice(increment)}
                  </div>
                </div>
              </div>
            </div>

            {/* DUA TOMBOL AKSI UTAMA: BELI LANGSUNG & BID LELANG */}
            <div className="space-y-3 pt-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Pilih Opsi Transaksi Lot:
              </div>

              {/* Tombol 1: Beli Langsung (Buy Now) */}
              <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Beli Langsung (Instan)
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800">Tanpa Tunggu Periode Lelang</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-2xl font-black font-mono text-emerald-950">
                      {formatPrice(buyNowPriceTotal)}
                    </div>
                    <div className="text-[11px] text-emerald-800">
                      Total lot ({auction.quantity} {auction.unit}) · Rekening Bersama Escrow
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (userRole === 'public') {
                      showToast('Silakan masuk ke akun Anda terlebih dahulu untuk membeli langsung.');
                      navigate('login');
                      return;
                    }
                    setBuyNowModalOpen(true);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer uppercase tracking-wider"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Beli Langsung Sekarang ({formatPrice(buyNowPriceTotal)})</span>
                </button>
              </div>

              {/* Tombol 2: Bid Lelang */}
              <div className="p-4 rounded-xl border-2 border-amber-400 bg-amber-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Gavel className="w-3 h-3" />
                    Ikuti Sesi Penawaran
                  </span>
                  <span className="text-[11px] font-bold text-amber-900">
                    Mulai {formatPrice(currentBidAmount)}/{auction.unit}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Daftarkan penawaran Anda ke listing bid, verifikasi jaminan lelang resmi, dan dapatkan PIN unik untuk menawar.
                </p>
                <button
                  type="button"
                  onClick={handleBidLelangClick}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer uppercase tracking-wider"
                >
                  <Gavel className="w-4 h-4 text-amber-400" />
                  <span>Bid Lelang (Masuk ke Listing Bid) →</span>
                </button>
              </div>
            </div>

            {/* STEP 1: JIKA BELUM LOGIN (Wajib Login Dulu) */}
            {userRole === 'public' && (
              <div className="p-5 rounded-xl bg-slate-900 text-white space-y-4">
                <div className="flex items-center gap-2.5 text-amber-400">
                  <Lock className="w-5 h-5 shrink-0" />
                  <h3 className="text-sm font-bold text-white">
                    Masuk ke Akun untuk Mengikuti Lelang
                  </h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Sesuai regulasi perdagangan bursa B2B dan kepatuhan kustodi rekening bersama, penawar lelang harus memiliki akun perusahaan yang terdaftar.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('login')}
                    className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md uppercase tracking-wider"
                  >
                    <span>Masuk ke Akun Sekarang →</span>
                  </button>
                  <p className="text-center text-[11px] text-slate-400 mt-2">
                    Belum punya akun?{' '}
                    <button
                      onClick={() => navigate('register')}
                      className="text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      Daftar Akun Mitra Baru
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: SUDAH LOGIN TAPI BELUM SELESAIKAN JAMINAN (Halaman/Tahap Bayar Jaminan - Bisa Gratis) */}
            {userRole !== 'public' && !isDepositVerified && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Opsi Cepat: Verifikasi Jaminan Langsung di Sini</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Untuk menjamin keaslian tawaran, pilih skema jaminan partisipasi di bawah ini. Anda dapat memilih opsi <strong>Bebas Jaminan (Gratis)</strong> atau <strong>Setor Jaminan Escrow</strong>.
                  </p>
                </div>

                {depositStatus === 'NONE' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-800">
                      Pilih Skema Jaminan Lelang:
                    </label>

                    {/* Option A: Free Deposit */}
                    <div
                      onClick={() => setDepositType('free')}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        depositType === 'free'
                          ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Jaminan Bebas Biaya (Gratis)</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Rp 0 (Bebas Biaya)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight">
                        Akses instan tanpa setoran uang muka untuk akun terdaftar. Hak tawar langsung aktif segera.
                      </p>
                    </div>

                    {/* Option B: Paid Deposit */}
                    <div
                      onClick={() => setDepositType('paid')}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        depositType === 'paid'
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                          <span>Setoran Jaminan Tunai (Escrow Kustodi)</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 font-mono">
                          {formatPrice(depositAmountPaid)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight">
                        Setoran via Virtual Account BCA/Mandiri/BRI. Dana aman di rekening bersama dan otomatis dikembalikan jika kalah lelang minus biaya administrasi kesepakatan.
                      </p>
                    </div>

                    <button
                      onClick={handleConfirmDeposit}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>Konfirmasi Jaminan & Lanjut ke Penawaran →</span>
                    </button>
                  </div>
                )}

                {/* Sub-State: Pending Payment for Paid Deposit */}
                {depositStatus === 'PENDING_PAYMENT' && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center text-slate-700 font-sans font-bold pb-2 border-b border-slate-200">
                      <span>Tagihan Virtual Account Jaminan</span>
                      <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                        MENUNGGU PEMBAYARAN
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Bank Tujuan:</span>
                      <span className="font-bold text-slate-900">Virtual Account {selectedBank}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-sans">Nomor VA:</span>
                      <span className="font-bold text-emerald-800 text-sm tracking-wider">{vaNumber}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Total Jaminan:</span>
                      <span className="font-black text-slate-900 text-sm">{formatPrice(depositAmountPaid)}</span>
                    </div>

                    <button
                      onClick={handleSimulateDepositPayment}
                      className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 font-sans cursor-pointer shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Simulasi Pembayaran Jaminan Selesai ✓</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: SUDAH BAYAR / VERIFIKASI JAMINAN -> MASUK KE HALAMAN PENAWARAN */}
            {userRole !== 'public' && isDepositVerified && (
              <div className="space-y-4">
                {/* Active Deposit Pill */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Hak Penawaran Aktif</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-950 font-bold">
                    {depositStatus === 'VERIFIED_FREE' ? 'JAMINAN GRATIS AKTIF' : 'JAMINAN ESCROW TERBAYAR'}
                  </span>
                </div>

                {/* Bidding Form */}
                <form onSubmit={handlePlaceBid} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Masukkan Nilai Tawaran Baru ({auction.unit}) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">Rp</span>
                      <input
                        type="number"
                        value={bidInput}
                        min={minRequiredBid}
                        step={increment}
                        onChange={(e) => setBidInput(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border-2 border-slate-300 focus:border-amber-500 rounded-lg font-mono font-bold text-slate-900 bg-white"
                        required
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Tawaran minimal berikutnya: <strong>{formatPrice(minRequiredBid)}</strong></span>
                      <button
                        type="button"
                        onClick={() => setBidInput(minRequiredBid)}
                        className="text-amber-700 font-bold hover:underline cursor-pointer"
                      >
                        Set Minimal
                      </button>
                    </div>
                  </div>

                  {/* Quick Increment Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {[minRequiredBid, minRequiredBid + increment * 2, minRequiredBid + increment * 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setBidInput(val)}
                        className="py-1.5 text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-800 transition-colors cursor-pointer"
                      >
                        +{formatPrice(val - currentBidAmount)}
                      </button>
                    ))}
                  </div>

                  {!isBuyerVerified && (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Akses Penjual (Default):</span>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          Lengkapi legalitas NIB & NPWP pabrik Anda untuk verifikasi pemenang lelang resmi.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowLegalityModal(true)}
                          className="mt-1 text-xs font-bold text-amber-900 underline hover:text-amber-950 cursor-pointer"
                        >
                          Lengkapi Legalitas &rarr;
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingBid}
                    className="w-full py-3.5 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Gavel className="w-4 h-4" />
                    <span>{isSubmittingBid ? 'Mengirim Tawaran...' : 'Pasang Tawaran Lelang (Stempel Waktu Server)'}</span>
                  </button>
                </form>

                <div className="pt-2 text-center">
                  <span className="text-[11px] text-slate-400">
                    Stempel waktu dicatat resmi menurut jam server bursa Scrava
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Seller Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Penyelenggara Lelang (Depo Penjual)
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                🏭
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{auction.seller.companyName}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </h4>
                <div className="text-xs text-slate-500">{auction.seller.country} · {auction.seller.completedTx} transaksi sukses</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL KONFIRMASI BELI LANGSUNG (BUY NOW) */}
      {buyNowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-xs text-slate-700 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Konfirmasi Pembelian Langsung (Buy Now)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Sistem Kontrak Bersama Escrow Resmi Scrava
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBuyNowModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-900 leading-snug">
                  {auction.title}
                </div>
                <div className="text-[11px] text-slate-600 grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400">Total Volume:</span>
                    <span className="font-bold text-slate-800 ml-1">
                      {auction.quantity} {auction.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Incoterm:</span>
                    <span className="font-bold text-slate-800 ml-1">{auction.incoterm}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Lokasi Depo:</span>
                    <span className="font-bold text-slate-800 ml-1">{auction.location.city}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Penjual:</span>
                    <span className="font-bold text-slate-800 ml-1">{auction.seller.companyName}</span>
                  </div>
                </div>
              </div>

              {/* Rincian Harga */}
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-2 font-mono">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-sans">Harga Beli Langsung Unit:</span>
                  <span className="font-bold text-slate-900">
                    {formatPrice(Math.round(buyNowPriceTotal / (auction.quantity || 1)))}/{auction.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-sans">Total Nilai Transaksi:</span>
                  <span className="text-base font-black text-emerald-950 font-mono">
                    {formatPrice(buyNowPriceTotal)}
                  </span>
                </div>
              </div>

              {/* Ketentuan Escrow Rekening Bersama */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-start gap-2 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <span>
                  Dengan membeli langsung, Anda menyetujui penerbitan Kontrak Escrow resmi. Dana Anda disimpan aman di Rekening Bersama Scrava dan baru diteruskan ke penjual setelah barang lolos inspeksi serah terima.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBuyNowModalOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBuyNow}
                disabled={isProcessingBuyNow}
                className="px-5 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-md cursor-pointer flex items-center gap-2"
              >
                {isProcessingBuyNow ? (
                  <span>Menerbitkan Kontrak Escrow...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Konfirmasi Beli Langsung Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <UpgradeToFactoryModal
        isOpen={showLegalityModal}
        onClose={() => setShowLegalityModal(false)}
        reasonMessage="Default akun Customer adalah Penjual (Depo Scrap). Untuk memasang tawaran di lelang resmi ini, silakan lengkapi nomor NIB & NPWP pabrik/perusahaan Anda."
      />
    </div>
  );
};
