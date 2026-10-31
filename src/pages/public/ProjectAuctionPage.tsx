import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../api/client';
import { ProjectAuction, ProjectBid, AuctionDeposit } from '../../types';
import {
  Gavel,
  ShieldCheck,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Info,
  DollarSign,
  Building,
  RefreshCw,
  FileText
} from 'lucide-react';

interface ProjectAuctionPageProps {
  navigate: (path: string, params?: any) => void;
  selectedProjectId?: string;
}

export const ProjectAuctionPage: React.FC<ProjectAuctionPageProps> = ({ navigate, selectedProjectId }) => {
  const { userRole, currentUser, currentCompany, formatPrice, showToast } = useApp();

  const [projects, setProjects] = useState<ProjectAuction[]>([]);
  const [activeProject, setActiveProject] = useState<ProjectAuction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [bids, setBids] = useState<ProjectBid[]>([]);
  const [userDeposit, setUserDeposit] = useState<AuctionDeposit | null>(null);

  // Server time state
  const [serverTimeFormatted, setServerTimeFormatted] = useState<string>('Memuat waktu server...');

  // Deposit flow state
  const [depositModalOpen, setDepositModalOpen] = useState<boolean>(false);
  const [depositType, setDepositType] = useState<'free' | 'paid'>('free');
  const [selectedBank, setSelectedBank] = useState<string>('BCA');
  const [isDepositing, setIsDepositing] = useState<boolean>(false);

  // Bidding & OTP state
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [otpModalOpen, setOtpModalOpen] = useState<boolean>(false);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpCountdown, setOtpCountdown] = useState<number>(180);
  const [isSubmittingBid, setIsSubmittingBid] = useState<boolean>(false);

  // Settlement state for winner
  const [settleModalOpen, setSettleModalOpen] = useState<boolean>(false);
  const [isSettling, setIsSettling] = useState<boolean>(false);

  const fetchProjectData = async (targetId?: string) => {
    try {
      setLoading(true);
      const list = await apiClient.projectAuctions.getAll();
      setProjects(list);

      const target = targetId
        ? list.find((p) => p.id === targetId)
        : (activeProject ? list.find((p) => p.id === activeProject.id) : list[0]);

      if (target) {
        setActiveProject(target);
        setBidAmount((target.currentHighestBid || target.startingBid) + target.bidIncrement);
        await loadProjectDetails(target.id);
      }
    } catch (err) {
      console.warn('Failed to fetch project auctions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetails = async (projectId: string) => {
    try {
      const detail = await apiClient.projectAuctions.getById(projectId);
      if (detail) {
        setActiveProject(detail.project);
        setBids(detail.bids || []);

        // Find user deposit if logged in
        const userComp = currentUser?.companyName || currentCompany?.name;
        if (userComp) {
          const userDep = detail.deposits?.find(
            (d) => d.companyName.toLowerCase() === userComp.toLowerCase()
          );
          setUserDeposit(userDep || null);
        }
      }
    } catch (err) {
      console.warn('Failed to load project details:', err);
    }
  };

  useEffect(() => {
    fetchProjectData(selectedProjectId);
  }, [selectedProjectId]);

  // Synchronize with server time
  useEffect(() => {
    let timer: any;
    let baseServerMs = Date.now();
    let localStartMs = Date.now();

    apiClient.system
      .getServerTime()
      .then((res) => {
        baseServerMs = res.timestamp;
        localStartMs = Date.now();
        setServerTimeFormatted(res.formattedWIB);
      })
      .catch(() => {
        setServerTimeFormatted(new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB');
      });

    timer = setInterval(() => {
      const currentMs = baseServerMs + (Date.now() - localStartMs);
      const d = new Date(currentMs);
      const str =
        d.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) +
        ', ' +
        d.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) +
        ' WIB (Server)';
      setServerTimeFormatted(str);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Request OTP for Bidding
  const handleRequestOtp = async () => {
    if (!activeProject) return;
    if (userRole === 'public') {
      showToast('Silakan login terlebih dahulu untuk mengajukan penawaran lelang.');
      navigate('login');
      return;
    }

    if (!userDeposit || userDeposit.status !== 'VERIFIED') {
      showToast('Anda harus menyetor uang jaminan dan terverifikasi sebelum meminta kode OTP!');
      return;
    }

    try {
      const res = await apiClient.projectAuctions.requestOtp(
        activeProject.id,
        currentUser?.companyName || currentCompany.name
      );
      setGeneratedOtp(res.otpCode);
      setEnteredOtp(res.otpCode); // Pre-fill convenience for user testing
      setOtpCountdown(180);
      setOtpModalOpen(true);
      showToast(`Kode OTP rahasia telah diterbitkan: ${res.otpCode}`);
    } catch (err: any) {
      showToast(err.message || 'Gagal meminta kode OTP');
    }
  };

  // Submit Bid with OTP
  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;

    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      showToast('Masukkan 6 digit kode OTP yang valid.');
      return;
    }

    try {
      setIsSubmittingBid(true);
      await apiClient.projectAuctions.placeBid(
        activeProject.id,
        currentUser?.companyName || currentCompany.name,
        bidAmount,
        enteredOtp.trim()
      );
      showToast('Penawaran Anda sah dan berhasil masuk ke papan lelang!');
      setOtpModalOpen(false);
      setEnteredOtp('');
      await loadProjectDetails(activeProject.id);
    } catch (err: any) {
      showToast(err.message || 'Gagal mengirim penawaran lelang');
    } finally {
      setIsSubmittingBid(false);
    }
  };

  // Register Security Deposit (Free / Paid)
  const handleCreateDeposit = async () => {
    if (!activeProject) return;
    if (userRole === 'public') {
      showToast('Silakan login terlebih dahulu untuk menyetor uang jaminan lelang.');
      navigate('login');
      return;
    }

    try {
      setIsDepositing(true);
      if (depositType === 'free') {
        const res = await apiClient.projectAuctions.deposit(
          activeProject.id,
          currentUser?.companyName || currentCompany.name,
          true
        );
        setUserDeposit(res.deposit);
        setDepositModalOpen(false);
        showToast('Jaminan Bebas Biaya (Gratis) disetujui! Anda sekarang dapat mengajukan penawaran lelang.');
        await loadProjectDetails(activeProject.id);
        return;
      }

      const res = await apiClient.projectAuctions.registerDeposit(
        activeProject.id,
        currentUser?.companyName || currentCompany.name,
        selectedBank
      );
      setUserDeposit(res.deposit);
      setDepositModalOpen(false);
      showToast('Virtual Account Jaminan Lelang berhasil diterbitkan! Silakan lakukan pembayaran.');
      await loadProjectDetails(activeProject.id);
    } catch (err: any) {
      showToast(err.message || 'Gagal membuat tagihan jaminan');
    } finally {
      setIsDepositing(false);
    }
  };

  // Instant Simulate Payment for VA Deposit
  const handleSimulatePayment = async () => {
    if (!activeProject || !userDeposit) return;
    try {
      setIsDepositing(true);
      const res = await apiClient.projectAuctions.verifyDeposit(activeProject.id, userDeposit.id);
      if (res.deposit) {
        setUserDeposit(res.deposit);
      } else {
        setUserDeposit({ ...userDeposit, status: 'VERIFIED' });
      }
      showToast('Pembayaran Uang Jaminan Berhasil Diverifikasi! Anda sekarang berhak menawar.');
      await loadProjectDetails(activeProject.id);
    } catch (err: any) {
      showToast(err.message || 'Gagal verifikasi pembayaran jaminan');
    } finally {
      setIsDepositing(false);
    }
  };

  // Winner Settlement Execution
  const handleWinnerSettlement = async () => {
    if (!activeProject) return;
    try {
      setIsSettling(true);
      await apiClient.projectAuctions.settleWinner(activeProject.id);
      showToast('Pelunasan sisa kontrak lelang berhasil dikonfirmasi! Uang jaminan diproses.');
      setSettleModalOpen(false);
      await loadProjectDetails(activeProject.id);
    } catch (err: any) {
      showToast(err.message || 'Gagal konfirmasi pelunasan');
    } finally {
      setIsSettling(false);
    }
  };

  if (loading && !activeProject) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">Memuat data lelang proyek industri...</p>
      </div>
    );
  }

  const isUserWinner =
    activeProject?.winnerCompany &&
    currentUser?.companyName &&
    activeProject.winnerCompany.toLowerCase() === currentUser.companyName.toLowerCase();

  const isUserLoser =
    activeProject?.status === 'AWARDED' &&
    currentUser?.companyName &&
    userDeposit &&
    !isUserWinner;

  return (
    <div className="min-h-screen bg-slate-50 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Breadcrumbs & Title */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              <Gavel className="w-4 h-4 text-emerald-600" />
              <span>Bursa Lelang Bongkaran & Proyek Industri</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Lelang Proyek & Sistem Uang Jaminan (Escrow)
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Lelang scrap skala besar, pembongkaran pabrik, rel kereta, dan aset industri. Partisipasi penawaran sah menggunakan <strong>Uang Jaminan Terverifikasi</strong> dan otentikasi penawaran <strong>Kode OTP Proyek</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('dashboard-project-bids')}
              className="px-4 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Riwayat Bid Saya</span>
            </button>
          </div>
        </div>

        {/* Real-time Server Clock Strip */}
        <div className="bg-slate-900 text-white rounded-xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs border border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">Waktu Server Bursa Resmi:</span>
            <span className="font-mono font-bold text-emerald-400 tracking-wide">{serverTimeFormatted}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Sinkronisasi NTP Waktu Nyata
            </span>
            <span className="text-slate-700">|</span>
            <span>Semua penawaran & batas lelang divalidasi dengan jam server</span>
          </div>
        </div>

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Project Selector & Thumbnails (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Daftar Proyek Lelang Aktif</span>
                <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                  {projects.length} Proyek
                </span>
              </div>

              <div className="space-y-3">
                {projects.map((proj) => {
                  const isSelected = activeProject?.id === proj.id;
                  return (
                    <div
                      key={proj.id}
                      onClick={() => {
                        setActiveProject(proj);
                        setBidAmount((proj.currentHighestBid || proj.startingBid) + proj.bidIncrement);
                        loadProjectDetails(proj.id);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden mb-2.5 bg-slate-100">
                        <img
                          src={proj.photos?.[0] || proj.images?.[0] || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'}
                          alt={proj.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded shadow-xs ${
                              proj.status === 'BIDDING_OPEN' || proj.status === 'OPEN'
                                ? 'bg-emerald-600 text-white'
                                : proj.status === 'AWARDED'
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-800 text-white'
                            }`}
                          >
                            {proj.status === 'BIDDING_OPEN' || proj.status === 'OPEN' ? 'PENAWARAN BUKA' : proj.status}
                          </span>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-slate-950/80 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-xs font-bold">
                          {proj.estimatedVolume || 250} {proj.unit || 'MT'}
                        </div>
                      </div>

                      <div className="text-xs font-bold text-slate-900 line-clamp-1">
                        {proj.title}
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{proj.location}</span>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400">Tawaran Tertinggi:</div>
                          <div className="font-mono font-black text-emerald-800 tabular-nums">
                            {formatPrice(proj.currentHighestBid || proj.startingBid)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400">Uang Jaminan:</div>
                          <div className="font-mono font-bold text-blue-700 tabular-nums">
                            {formatPrice(proj.securityDeposit)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Project Details, Deposit Lifecycle & Live Bidding Room (8 Cols) */}
          {activeProject && (
            <div className="lg:col-span-8 space-y-6">
              {/* Project Hero Image & Specs Card */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="relative aspect-21/9 bg-slate-900">
                  <img
                    src={activeProject.photos?.[0] || activeProject.images?.[0] || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'}
                    alt={activeProject.title}
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-end p-6 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-500 text-white font-mono uppercase tracking-wider">
                        {activeProject.id}
                      </span>
                      <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-white/20 backdrop-blur-xs text-white">
                        {activeProject.category}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {activeProject.title}
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {activeProject.location}
                      </span>
                      <span>·</span>
                      <span>Owner: <strong>{activeProject.ownerCompany || activeProject.sellerCompany || 'PT Industri Pemilik Aset'}</strong></span>
                    </p>
                  </div>
                </div>

                {/* Key Numbers Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200 border-b border-slate-200 text-xs">
                  <div className="bg-white p-3.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Tawaran Tertinggi</span>
                    <div className="text-base font-black font-mono text-emerald-700 mt-0.5 tabular-nums">
                      {formatPrice(activeProject.currentHighestBid || activeProject.startingBid)}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Buka: {formatPrice(activeProject.startingBid)}
                    </span>
                  </div>

                  <div className="bg-white p-3.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Wajib Uang Jaminan</span>
                    <div className="text-base font-black font-mono text-blue-700 mt-0.5 tabular-nums">
                      {formatPrice(activeProject.securityDeposit)}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold">100% Escrow Aman</span>
                  </div>

                  <div className="bg-white p-3.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Estimasi Tonase</span>
                    <div className="text-base font-black font-mono text-slate-900 mt-0.5 tabular-nums">
                      {activeProject.estimatedVolume || 350} {activeProject.unit || 'MT'}
                    </div>
                    <span className="text-[10px] text-slate-400">Timbang Jembatan Resmi</span>
                  </div>

                  <div className="bg-white p-3.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Batas Waktu Bidding</span>
                    <div className="text-xs font-bold font-mono text-slate-900 mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{activeProject.bidClosingDate || activeProject.deadline || '2026-11-20'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Aanwijzing: {activeProject.aanwijzingDate}</span>
                  </div>
                </div>

                {/* Additional Images Strip */}
                {((activeProject.photos && activeProject.photos.length > 1) || (activeProject.images && activeProject.images.length > 1)) && (
                  <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-3 overflow-x-auto">
                    {(activeProject.photos || activeProject.images || []).map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-16 h-12 object-cover rounded-md border border-slate-200 shrink-0 cursor-pointer hover:opacity-80"
                      />
                    ))}
                  </div>
                )}

                {/* Description & Technical Specs */}
                <div className="p-6 space-y-4 text-xs text-slate-700">
                  <div>
                    <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5">
                      Lingkup Kerja & Spesifikasi Material
                    </h3>
                    <p className="leading-relaxed text-slate-600">
                      {activeProject.description}
                    </p>
                  </div>

                  {activeProject.specifications && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(activeProject.specifications).map(([key, val]) => (
                        <div key={key}>
                          <span className="text-[10px] text-slate-400">{key}:</span>
                          <div className="font-semibold text-slate-800">{String(val)}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ketentuan Pemotongan Uang Jaminan Sesuai Kesepakatan */}
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs space-y-2">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Ketentuan Pengembalian & Potongan Uang Jaminan (Sesuai Kesepakatan)</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800 leading-relaxed">
                      <li>
                        <strong>Jika Anda Menang Lelang:</strong> Anda diwajibkan melakukan pelunasan sisa kontrak. Uang jaminan akan dikreditkan sebagai pengurang nilai pelunasan atau dikembalikan penuh setelah pelunasan minus biaya administrasi platform ({formatPrice(activeProject.depositDeductionFee)}).
                      </li>
                      <li>
                        <strong>Jika Anda Kalah Lelang:</strong> Uang jaminan akan ditransfer kembali secara otomatis ke rekening kustodi/dompet perusahaan Anda minus biaya administrasi & kliring perbankan sesuai kesepakatan ({formatPrice(activeProject.depositDeductionFee)}).
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* POST-AUCTION OUTCOME CARD (WINNER / LOSER BANNER) */}
              {isUserWinner && (
                <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white rounded-xl p-6 shadow-md border border-emerald-600 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-emerald-400 text-slate-950 font-black text-xs">
                      SELAMAT! ANDA PEMENANG LELANG
                    </span>
                    <span className="text-xs text-emerald-200">
                      Penetapan Resmi Panitia Lelang
                    </span>
                  </div>

                  <div className="text-sm">
                    Perusahaan Anda <strong>{activeProject.winnerCompany}</strong> ditetapkan sebagai pemenang lelang proyek ini dengan nilai tawaran final:
                    <div className="text-2xl font-black font-mono text-emerald-300 mt-1">
                      {formatPrice(activeProject.currentHighestBid || activeProject.startingBid)}
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-3 text-xs space-y-1.5 border border-white/10">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Status Pelunasan Sisa Kontrak:</span>
                      <span className="font-bold text-white font-mono">
                        {activeProject.winnerSettlementStatus === 'SETTLED' ? 'LUNAS (TERVERIFIKASI)' : 'MENUNGGU PELUNASAN'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Uang Jaminan Tersimpan:</span>
                      <span className="font-bold text-white font-mono">{formatPrice(activeProject.securityDeposit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Biaya Administrasi Potongan Kesepakatan:</span>
                      <span className="font-bold text-rose-300 font-mono">- {formatPrice(activeProject.depositDeductionFee)}</span>
                    </div>
                  </div>

                  {activeProject.winnerSettlementStatus !== 'SETTLED' ? (
                    <button
                      onClick={() => setSettleModalOpen(true)}
                      className="w-full py-3 bg-emerald-400 text-slate-950 hover:bg-emerald-300 rounded-lg font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Lakukan Pelunasan Sisa Pembayaran Kontrak</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-emerald-950/80 rounded-lg text-center text-xs font-bold text-emerald-300 border border-emerald-500/40">
                      Pelunasan berhasil diverifikasi! Tim operasional Scrava sedang menyiapkan Surat Perintah Kerja (SPK) & izin bongkar lokasi.
                    </div>
                  )}
                </div>
              )}

              {isUserLoser && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-xs">
                      HASIL LELANG: PENAWARAN BELUM MENANG
                    </span>
                    <span className="text-xs text-slate-500">
                      Pemenang: <strong>{activeProject.winnerCompany}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Terima kasih atas partisipasi Anda dalam lelang proyek ini. Sesuai ketentuan kesepakatan jaminan lelang, uang jaminan Anda akan dikembalikan dengan rincian berikut:
                  </p>

                  <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1.5 border border-slate-200 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Uang Jaminan Awal:</span>
                      <span className="font-bold text-slate-900">{formatPrice(activeProject.securityDeposit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Potongan Biaya Admin Kesepakatan:</span>
                      <span className="font-bold text-rose-600">- {formatPrice(activeProject.depositDeductionFee)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200">
                      <span className="text-slate-800 font-bold font-sans">Net Dana Dikembalikan (Refund):</span>
                      <span className="font-bold text-emerald-700">
                        {formatPrice(activeProject.securityDeposit - activeProject.depositDeductionFee)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans pt-1">
                      Status: <strong>{userDeposit?.status === 'REFUNDED' ? 'DANA SUDAH DITRANSFER BALIK' : 'PROSES PENGEMBALIAN OLEH ADMIN ESCROW'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY DEPOSIT STATUS & ACTION CARD */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Status Uang Jaminan Lelang Anda
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Peserta wajib menyetorkan deposit jaminan resmi sebelum dapat mengajukan penawaran sah.
                      </p>
                    </div>
                  </div>

                  {userDeposit ? (
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                        userDeposit.status === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : userDeposit.status === 'PENDING_PAYMENT'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {userDeposit.status === 'VERIFIED'
                        ? 'JAMINAN TERVERIFIKASI'
                        : userDeposit.status === 'PENDING_PAYMENT'
                        ? 'MENUNGGU PEMBAYARAN JAMINAN'
                        : userDeposit.status}
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      BELUM MENYETOR JAMINAN
                    </span>
                  )}
                </div>

                {/* State A: User not registered deposit yet */}
                {!userDeposit && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {userRole === 'public'
                          ? 'Perlu Login Terlebih Dahulu Untuk Ikut Lelang'
                          : 'Belum Terdaftar Sebagai Penawar Resmi Proyek Ini'}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {userRole === 'public'
                          ? 'Silakan login terlebih dahulu untuk memilih skema jaminan (Tersedia Jaminan Gratis Rp 0 atau Setoran Tunai Escrow).'
                          : `Pilih skema jaminan lelang: Tersedia Jaminan Bebas Biaya (Gratis Rp 0 via KYC) atau Setoran Jaminan Kustodi Escrow (${formatPrice(activeProject.securityDeposit)}).`}
                      </p>
                    </div>
                    {userRole === 'public' ? (
                      <button
                        onClick={() => {
                          showToast('Silakan login terlebih dahulu untuk mendaftar dan menyetor jaminan lelang.');
                          navigate('login');
                        }}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer shadow-xs shrink-0"
                      >
                        Login untuk Ikut Lelang →
                      </button>
                    ) : (
                      <button
                        onClick={() => setDepositModalOpen(true)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors whitespace-nowrap cursor-pointer shadow-xs shrink-0"
                      >
                        Pilih Jaminan & Daftar Lelang →
                      </button>
                    )}
                  </div>
                )}

                {/* State B: Deposit status is PENDING_PAYMENT */}
                {userDeposit && userDeposit.status === 'PENDING_PAYMENT' && (
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Menunggu Pembayaran Uang Jaminan Lelang</span>
                      </div>
                      <span className="text-[11px] text-amber-800 font-mono">Batas: 24 Jam</span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-amber-200 text-xs space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Bank Tujuan:</span>
                        <span className="font-bold text-slate-900">Virtual Account {userDeposit.bank}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Nomor Virtual Account:</span>
                        <span className="font-bold text-emerald-800 text-sm tracking-wider">{userDeposit.vaNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Total Jaminan Wajib:</span>
                        <span className="font-black text-slate-900 text-sm">{formatPrice(userDeposit.amount)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <p className="text-[10px] text-amber-800">
                        Transfer sebelum aanwijzing atau batas penawaran. Sistem mendeteksi otomatis.
                      </p>
                      <button
                        onClick={handleSimulatePayment}
                        disabled={isDepositing}
                        className="px-3.5 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition-colors shrink-0 shadow-2xs cursor-pointer"
                      >
                        {isDepositing ? 'Memverifikasi...' : 'Simulasi Pembayaran Selesai ✓'}
                      </button>
                    </div>
                  </div>
                )}

                {/* State C: Deposit status is VERIFIED */}
                {userDeposit && userDeposit.status === 'VERIFIED' && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-950">
                          {userDeposit.amount === 0 ? 'Jaminan Bebas Biaya (Gratis) Terverifikasi Sah' : `Uang Jaminan ${formatPrice(userDeposit.amount)} Terverifikasi Sah`}
                        </div>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          Perusahaan Anda memiliki hak penuh untuk mengajukan penawaran lelang dengan verifikasi OTP.
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-emerald-700 font-mono">Status: Penawar Sah (Verified Bidder)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* LIVE BIDDING TERMINAL WITH OTP AUTHORIZATION */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-emerald-600" />
                      <span>Formulir Pengajuan Penawaran (Bidding dengan OTP)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Setiap tawaran lelang dilindungi kode OTP unik proyek untuk menjamin integritas hukum perusahaan.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Minimal Kenaikan Tawaran:</div>
                    <div className="font-mono font-bold text-slate-800">
                      + {formatPrice(activeProject.bidIncrement)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                  <div className="sm:col-span-7">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nominal Penawaran Proyek Anda (Rp) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        min={(activeProject.currentHighestBid || activeProject.startingBid) + activeProject.bidIncrement}
                        step={activeProject.bidIncrement}
                        className="w-full pl-9 pr-3 py-2 text-sm font-mono font-bold text-slate-900 border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden"
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Minimal penawaran:{' '}
                      <strong>
                        {formatPrice(
                          (activeProject.currentHighestBid || activeProject.startingBid) +
                            activeProject.bidIncrement
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="sm:col-span-5">
                    {userRole === 'public' ? (
                      <button
                        type="button"
                        onClick={() => {
                          showToast('Silakan login terlebih dahulu untuk mengajukan penawaran lelang.');
                          navigate('login');
                        }}
                        className="w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                      >
                        Login untuk Ajukan Bid →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={!userDeposit || userDeposit.status !== 'VERIFIED'}
                        className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs ${
                          userDeposit && userDeposit.status === 'VERIFIED'
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Ajukan Bid via OTP →</span>
                      </button>
                    )}
                  </div>
                </div>

                {userRole !== 'public' && (!userDeposit || userDeposit.status !== 'VERIFIED') && (
                  <div className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>Tombol penawaran terkunci. Setor dan verifikasi uang jaminan lelang terlebih dahulu (bisa pilih opsi jaminan gratis Rp 0).</span>
                  </div>
                )}
              </div>

              {/* PROJECT BID HISTORY LOG */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Riwayat Penawaran Proyek ({bids.length} Bid Masuk)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Catatan transparan penawaran terdaftar yang telah divalidasi dengan kode OTP
                    </p>
                  </div>
                  <button
                    onClick={() => loadProjectDetails(activeProject.id)}
                    className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Segarkan Papan</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Rank</th>
                        <th className="py-2.5 px-3">Nama Perusahaan Peserta</th>
                        <th className="py-2.5 px-3 text-right">Nilai Tawaran</th>
                        <th className="py-2.5 px-3">Waktu Tawaran</th>
                        <th className="py-2.5 px-3 text-center">Validasi OTP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bids.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400">
                            Belum ada penawaran masuk. Jadilah penawar pertama dengan menyetor jaminan!
                          </td>
                        </tr>
                      ) : (
                        bids.map((b, idx) => (
                          <tr
                            key={b.id}
                            className={`hover:bg-slate-50 transition-colors ${
                              idx === 0 ? 'bg-emerald-50/40 font-semibold' : ''
                            }`}
                          >
                            <td className="py-3 px-3 font-mono">
                              {idx === 0 ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                                  #1 HIGHEST
                                </span>
                              ) : (
                                `#${idx + 1}`
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-900">{b.bidderCompany}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{b.id}</div>
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-emerald-800 tabular-nums">
                              {formatPrice(b.amount)}
                            </td>
                            <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                              {b.timestamp}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {b.otpVerified ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  OTP Valid
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Standard</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: REGISTER SECURITY DEPOSIT */}
      {depositModalOpen && activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-xs text-slate-700 space-y-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pendaftaran Jaminan Lelang Proyek
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih opsi jaminan lelang: Jaminan Bebas Biaya (Gratis Rp 0) atau Setoran Tunai Virtual Account Kustodi Escrow.
              </p>
            </div>

            {/* Selector: Gratis vs Berbayar */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDepositType('free')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  depositType === 'free'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-emerald-900 text-xs">Jaminan Bebas Biaya</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Gratis</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Rp 0 (Verifikasi KYC Rekanan Mitra & Langsung Aktif)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDepositType('paid')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  depositType === 'paid'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-xs">Setor Tunai Escrow</span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">VA Bank</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {formatPrice(activeProject.securityDeposit)} (Kustodi bank, dikembalikan jika kalah)
                </div>
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Proyek:</span>
                <span className="font-bold text-slate-900 font-sans truncate max-w-xs">{activeProject.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Perusahaan Penawar:</span>
                <span className="font-bold text-slate-900 font-sans">{currentUser?.companyName || currentCompany.name}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-sans">Nominal Jaminan:</span>
                <span className="font-black text-emerald-800 text-sm">
                  {depositType === 'free' ? 'Rp 0 (Bebas Biaya / Gratis)' : formatPrice(activeProject.securityDeposit)}
                </span>
              </div>
            </div>

            {depositType === 'paid' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Pilih Bank Virtual Account Kustodi
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['BCA', 'Mandiri', 'BRI'].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold text-center transition-colors cursor-pointer ${
                          selectedBank === bank
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        VA {bank}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                  <strong>Ketentuan Kesepakatan:</strong> Jika Anda kalah lelang, uang jaminan dikembalikan utuh ke rekening perusahaan Anda minus potongan biaya administrasi {formatPrice(activeProject.depositDeductionFee)}.
                </div>
              </>
            ) : (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed">
                <strong>Fasilitas Jaminan Bebas Biaya (Gratis):</strong> Rekening perusahaan Anda mendapat plafon jaminan Rp 0 melalui verifikasi profil rekanan industri Scrava. Setelah aktivasi, hak penawaran lelang langsung aktif seketika tanpa perlu transfer uang jaminan tunai.
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDepositModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateDeposit}
                disabled={isDepositing}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                {isDepositing
                  ? 'Memproses...'
                  : depositType === 'free'
                  ? 'Aktivasi Jaminan Gratis (Rp 0) ✓'
                  : 'Terbitkan Virtual Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: OTP VERIFICATION FOR BIDDING */}
      {otpModalOpen && activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-xs text-slate-700 space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Verifikasi OTP Penawaran Proyek
                </h3>
                <p className="text-[11px] text-slate-500">
                  Otentikasi hukum penawaran resmi untuk {activeProject.id}
                </p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                Kode OTP Proyek Diterbitkan:
              </span>
              <div className="text-2xl font-black font-mono tracking-widest text-emerald-950">
                {generatedOtp}
              </div>
              <span className="text-[10px] text-emerald-700">
                Berlaku selama 3 menit untuk penawaran: <strong>{formatPrice(bidAmount)}</strong>
              </span>
            </div>

            <form onSubmit={handleSubmitBid} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Masukkan 6 Digit Kode OTP di Atas *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="cth. 123456"
                  className="w-full text-center text-xl font-mono font-black tracking-widest p-2.5 border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden bg-slate-50"
                  required
                />
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                Dengan menekan "Kirim Penawaran Sah", perusahaan Anda terikat secara hukum terhadap nilai tawaran dan ketentuan jaminan lelang Scrava.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOtpModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBid}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSubmittingBid ? 'Mengirim...' : 'Kirim Penawaran Sah'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: WINNER SETTLEMENT (PELUNASAN) */}
      {settleModalOpen && activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-xs text-slate-700 space-y-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Instruksi Pelunasan Sisa Kontrak Pemenang
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Konfirmasi pelunasan nilai kontrak lelang untuk penerbitan SPK
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Total Nilai Menang:</span>
                <span className="font-bold text-slate-900">
                  {formatPrice(activeProject.currentHighestBid || activeProject.startingBid)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Kredit Uang Jaminan:</span>
                <span className="font-bold text-emerald-700">- {formatPrice(activeProject.securityDeposit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Biaya Admin Platform:</span>
                <span className="font-bold text-rose-600">+ {formatPrice(activeProject.depositDeductionFee)}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-200 text-sm">
                <span className="text-slate-800 font-bold font-sans">Sisa Pelunasan Transfer:</span>
                <span className="font-black text-emerald-800">
                  {formatPrice(
                    (activeProject.currentHighestBid || activeProject.startingBid) -
                      activeProject.securityDeposit +
                      activeProject.depositDeductionFee
                  )}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-900 text-[11px] leading-relaxed">
              Setelah pelunasan dikonfirmasi, uang jaminan secara resmi diselesaikan dan tim legal menerbitkan Surat Izin Angkut serta Surat Perintah Kerja (SPK).
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSettleModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleWinnerSettlement}
                disabled={isSettling}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                {isSettling ? 'Memproses...' : 'Konfirmasi Pelunasan Sisa Kontrak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
