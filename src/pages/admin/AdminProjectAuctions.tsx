import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../api/client';
import { ProjectAuction, ProjectBid, AuctionDeposit } from '../../types';
import {
  Gavel,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  Clock,
  DollarSign,
  TrendingUp,
  MapPin,
  Building,
  KeyRound,
  FileText
} from 'lucide-react';

export const AdminProjectAuctions: React.FC = () => {
  const { formatPrice, showToast } = useApp();

  const [projects, setProjects] = useState<ProjectAuction[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [activeProjectDetail, setActiveProjectDetail] = useState<{
    project: ProjectAuction;
    deposits: AuctionDeposit[];
    bids: ProjectBid[];
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'pending_approval' | 'deposits' | 'bids' | 'settlement' | 'create'>('deposits');

  // Create Project Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Pabrik & Demolition');
  const [newLocation, setNewLocation] = useState('Gresik, Jawa Timur');
  const [newOwner, setNewOwner] = useState('PT Petrokimia Industri');
  const [newVolume, setNewVolume] = useState<number>(350);
  const [newUnit, setNewUnit] = useState<string>('MT');
  const [newStartingBid, setNewStartingBid] = useState<number>(1800000000);
  const [newIncrement, setNewIncrement] = useState<number>(25000000);
  const [newDeposit, setNewDeposit] = useState<number>(50000000);
  const [newDeduction, setNewDeduction] = useState<number>(500000);
  const [newClosingDate, setNewClosingDate] = useState('2026-10-30');
  const [newAanwijzingDate, setNewAanwijzingDate] = useState('2026-10-22');
  const [newImageUrl, setNewImageUrl] = useState(
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
  );
  const [newDescription, setNewDescription] = useState(
    'Bongkaran struktur baja pabrik ex-pupuk & kimia. Besi WF, pipa seamless, dan tanki tebal.'
  );

  const loadProjects = async () => {
    try {
      setLoading(true);
      const list = await apiClient.projectAuctions.getAll({ includePending: true });
      setProjects(list);
      if (list.length > 0) {
        const targetId = selectedProjectId || list[0].id;
        setSelectedProjectId(targetId);
        await loadProjectDetail(targetId);
      }
    } catch (err) {
      console.warn('Admin loadProjects error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetail = async (id: string) => {
    try {
      const detail = await apiClient.projectAuctions.getById(id);
      setActiveProjectDetail(detail);
    } catch (err) {
      console.warn('Admin loadProjectDetail error:', err);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    loadProjectDetail(id);
  };

  // Approve Auction created by user
  const handleApproveAuction = async (projectId: string) => {
    try {
      await apiClient.projectAuctions.approve(projectId);
      showToast('Lelang berhasil disetujui (Approved)! Status kini tayang aktif di bursa & Home.');
      await loadProjects();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyetujui lelang');
    }
  };

  // Reject Auction
  const handleRejectAuction = async (projectId: string) => {
    try {
      await apiClient.projectAuctions.reject(projectId);
      showToast('Lelang telah ditolak oleh Admin.');
      await loadProjects();
    } catch (err: any) {
      showToast(err.message || 'Gagal menolak lelang');
    }
  };

  // Verify Deposit
  const handleVerifyDeposit = async (depositId: string) => {
    if (!selectedProjectId) return;
    try {
      await apiClient.projectAuctions.verifyDeposit(selectedProjectId, depositId);
      showToast('Uang jaminan berhasil diverifikasi! Peserta diotorisasi melakukan penawaran.');
      await loadProjectDetail(selectedProjectId);
    } catch (err: any) {
      showToast(err.message || 'Gagal verifikasi deposit');
    }
  };

  // Award Winner
  const handleAwardWinner = async (companyName: string, amount: number) => {
    if (!selectedProjectId) return;
    if (!window.confirm(`Tetapkan ${companyName} sebagai pemenang resmi lelang dengan penawaran Rp ${amount.toLocaleString('id-ID')}?`)) {
      return;
    }
    try {
      await apiClient.projectAuctions.awardWinner(selectedProjectId, companyName, amount);
      showToast(`Lelang berhasil dimenangkan oleh ${companyName}!`);
      await loadProjects();
    } catch (err: any) {
      showToast(err.message || 'Gagal menetapkan pemenang');
    }
  };

  // Settle Winner
  const handleSettleWinner = async () => {
    if (!selectedProjectId) return;
    try {
      await apiClient.projectAuctions.settleWinner(selectedProjectId);
      showToast('Pelunasan pemenang lelang berhasil dikonfirmasi lunas.');
      await loadProjectDetail(selectedProjectId);
    } catch (err: any) {
      showToast(err.message || 'Gagal settlement');
    }
  };

  // Refund Losers
  const handleRefundLoser = async (depositId: string, companyName: string) => {
    if (!selectedProjectId) return;
    try {
      await apiClient.projectAuctions.refundLoser(selectedProjectId, depositId);
      showToast(`Uang jaminan ${companyName} berhasil ditransfer balik minus potongan kesepakatan.`);
      await loadProjectDetail(selectedProjectId);
    } catch (err: any) {
      showToast(err.message || 'Gagal refund');
    }
  };

  // Create Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await apiClient.projectAuctions.create({
        title: newTitle,
        category: newCategory,
        location: newLocation,
        ownerCompany: newOwner,
        estimatedVolume: newVolume,
        unit: newUnit,
        startingBid: newStartingBid,
        bidIncrement: newIncrement,
        securityDeposit: newDeposit,
        depositDeductionFee: newDeduction,
        bidClosingDate: newClosingDate,
        aanwijzingDate: newAanwijzingDate,
        photos: [newImageUrl],
        description: newDescription,
        status: 'OPEN',
      });
      showToast('Lelang proyek industri baru berhasil diterbitkan!');
      setActiveTab('deposits');
      await loadProjects();
    } catch (err: any) {
      showToast(err.message || 'Gagal membuat proyek lelang');
    }
  };

  const currentProj = activeProjectDetail?.project;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <Gavel className="w-4 h-4 text-emerald-600" />
            <span>Administrator Console · Lelang Proyek & Jaminan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Manajemen Lelang Proyek & Rekening Kustodi Jaminan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verifikasi setoran uang jaminan peserta, pantau penawaran OTP, penetapan pemenang, pelunasan sisa kontrak, dan eksekusi refund potongan kesepakatan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Buat Lelang Proyek Baru</span>
          </button>
          <button
            onClick={loadProjects}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Project Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Pilih Proyek Lelang untuk Dikelola:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {projects.map((p) => {
            const isSelected = p.id === selectedProjectId;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectProject(p.id)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] font-bold text-slate-500">{p.id}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      p.status === 'BIDDING_OPEN' || p.status === 'OPEN'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'AWARDED'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {p.status === 'OPEN' || p.status === 'BIDDING_OPEN' ? 'PENAWARAN BUKA' : p.status}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 truncate">{p.title}</div>
                <div className="text-[11px] text-slate-500 mt-1 flex justify-between font-mono">
                  <span>Jaminan: {formatPrice(p.securityDeposit)}</span>
                  <span className="font-bold text-emerald-800">
                    {formatPrice(p.currentHighestBid || p.startingBid)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'pending_approval', label: 'Moderasi Lelang Masuk', count: projects.filter((p) => p.status === 'PENDING_APPROVAL').length },
          { id: 'deposits', label: '1. Verifikasi Uang Jaminan', count: activeProjectDetail?.deposits.length },
          { id: 'bids', label: '2. Papan Bidding & Penetapan Pemenang', count: activeProjectDetail?.bids.length },
          { id: 'settlement', label: '3. Pelunasan & Refund Jaminan', count: undefined },
          { id: 'create', label: '+ Buat Proyek Baru', count: undefined },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                tab.id === 'pending_approval' && tab.count > 0 ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-700 text-white'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB: MODERASI & PERSETUJUAN LELANG BARU DARI PEMILIK BARANG */}
      {activeTab === 'pending_approval' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Antrean Moderasi Lelang Baru (Dari User Pemilik Barang)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lelang yang dibuat oleh pemilik barang wajib diapprove oleh Admin sebelum tayang di bursa dan Home.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300">
                {projects.filter((p) => p.status === 'PENDING_APPROVAL').length} Menunggu Persetujuan
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {projects.filter((p) => p.status === 'PENDING_APPROVAL').length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-700">Semua Lelang Telah Dimoderasi</div>
                  <p className="text-[11px] text-slate-400 mt-1">Tidak ada lelang yang sedang menunggu persetujuan Admin saat ini.</p>
                </div>
              ) : (
                projects
                  .filter((p) => p.status === 'PENDING_APPROVAL')
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 transition-colors shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={p.photos?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'}
                          alt={p.title}
                          className="w-16 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                              MENUNGGU APPROVE
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">{p.category}</span>
                            <span className="text-[10px] text-slate-400">· {p.location}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">{p.title}</h4>
                          <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2.5 mt-1 font-mono">
                            <span>Pemilik: <strong className="font-sans text-slate-800">{p.sellerCompany || 'PT Pemilik Barang'}</strong></span>
                            <span>·</span>
                            <span>Harga Buka: <strong className="text-slate-900">{formatPrice(p.startingBid)}</strong></span>
                            <span>·</span>
                            <span>Beli Langsung: <strong className="text-emerald-700">{formatPrice(p.buyNowPrice || p.startingBid * 1.35)}</strong></span>
                            <span>·</span>
                            <span>Jaminan: <strong className="text-blue-700">{formatPrice(p.securityDeposit)}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => handleRejectAuction(p.id)}
                          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition-colors cursor-pointer border border-rose-200"
                        >
                          Tolak
                        </button>
                        <button
                          onClick={() => handleApproveAuction(p.id)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Setujui & Tayangkan Lelang (Approve) ✓</span>
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: VERIFIKASI UANG JAMINAN PESERTA */}
      {activeTab === 'deposits' && activeProjectDetail && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daftar Peserta & Status Setoran Uang Jaminan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Proyek: <strong>{currentProj?.title}</strong> · Wajib Jaminan: {formatPrice(currentProj?.securityDeposit || 0)}
              </p>
            </div>
            <div className="text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Escrow Jaminan Aman
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No. Deposit</th>
                  <th className="py-2.5 px-3">Nama Perusahaan Peserta</th>
                  <th className="py-2.5 px-3">Bank / Virtual Account</th>
                  <th className="py-2.5 px-3 text-right">Nominal Jaminan</th>
                  <th className="py-2.5 px-3 text-center">Status Jaminan</th>
                  <th className="py-2.5 px-3 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeProjectDetail.deposits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      Belum ada perusahaan yang mendaftar atau menyetor jaminan untuk proyek ini.
                    </td>
                  </tr>
                ) : (
                  activeProjectDetail.deposits.map((dep) => (
                    <tr key={dep.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{dep.id}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{dep.companyName}</td>
                      <td className="py-3 px-3 font-mono">
                        <span className="font-bold text-slate-800">{dep.bank}</span>: {dep.vaNumber}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-blue-700 tabular-nums">
                        {formatPrice(dep.amount)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            dep.status === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : dep.status === 'PENDING_PAYMENT'
                              ? 'bg-amber-100 text-amber-900 animate-pulse'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {dep.status === 'VERIFIED'
                            ? 'TERVERIFIKASI SAH'
                            : dep.status === 'PENDING_PAYMENT'
                            ? 'MENUNGGU BAYAR'
                            : dep.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {dep.status === 'PENDING_PAYMENT' ? (
                          <button
                            onClick={() => handleVerifyDeposit(dep.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs transition-colors shadow-2xs cursor-pointer"
                          >
                            Verifikasi Dana Masuk ✓
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Siap Bidding OTP</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PAPAN PENAWARAN & PENETAPAN PEMENANG (AWARD) */}
      {activeTab === 'bids' && activeProjectDetail && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Papan Penawaran Resmi (OTP Validated Bids)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih penawar tertinggi untuk ditetapkan sebagai pemenang lelang resmi.
              </p>
            </div>
            {currentProj?.winnerCompany && (
              <div className="text-xs bg-purple-50 text-purple-900 border border-purple-200 px-3 py-1 rounded-lg font-bold">
                Pemenang Ditetapkan: {currentProj.winnerCompany}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">ID Tawaran</th>
                  <th className="py-2.5 px-3">Perusahaan Peserta</th>
                  <th className="py-2.5 px-3 text-right">Nilai Tawaran</th>
                  <th className="py-2.5 px-3">Waktu Tawaran</th>
                  <th className="py-2.5 px-3 text-center">Status OTP</th>
                  <th className="py-2.5 px-3 text-right">Aksi Penetapan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeProjectDetail.bids.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">
                      Belum ada penawaran masuk dari peserta.
                    </td>
                  </tr>
                ) : (
                  activeProjectDetail.bids.map((b, idx) => {
                    const isWinner = currentProj?.winnerCompany === b.bidderCompany;
                    return (
                      <tr
                        key={b.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          idx === 0 ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold">
                          {idx === 0 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-bold">
                              #1 TERTINGGI
                            </span>
                          ) : (
                            `#${idx + 1}`
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700">{b.id}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{b.bidderCompany}</td>
                        <td className="py-3 px-3 text-right font-mono font-black text-emerald-800 tabular-nums">
                          {formatPrice(b.amount)}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">{b.timestamp}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Valid ✓
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {isWinner ? (
                            <span className="px-2.5 py-1 rounded text-xs font-bold bg-purple-600 text-white">
                              Pemenang Sah
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAwardWinner(b.bidderCompany, b.amount)}
                              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-xs transition-colors shadow-2xs cursor-pointer"
                            >
                              Tetapkan Pemenang →
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PELUNASAN PEMENANG & REFUND JAMINAN PESERTA KALAH */}
      {activeTab === 'settlement' && activeProjectDetail && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Winner Settlement Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold font-mono text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                Pemenang Lelang
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Pelunasan Sisa Kontrak Pemenang
              </h3>
            </div>

            {currentProj?.winnerCompany ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Perusahaan Pemenang:</span>
                    <span className="font-bold text-slate-900 font-sans">{currentProj.winnerCompany}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Total Tawaran Menang:</span>
                    <span className="font-bold text-emerald-800">{formatPrice(currentProj.currentHighestBid || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Uang Jaminan Tersimpan:</span>
                    <span className="font-bold text-blue-700">{formatPrice(currentProj.securityDeposit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Potongan Fee Admin Kesepakatan:</span>
                    <span className="font-bold text-rose-600">- {formatPrice(currentProj.depositDeductionFee)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-800 font-bold font-sans">Status Pelunasan:</span>
                    <span
                      className={`font-bold px-2 py-0.2 rounded text-[10px] ${
                        currentProj.winnerSettlementStatus === 'SETTLED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {currentProj.winnerSettlementStatus === 'SETTLED' ? 'LUNAS DIKONFIRMASI' : 'MENUNGGU PELUNASAN'}
                    </span>
                  </div>
                </div>

                {currentProj.winnerSettlementStatus !== 'SETTLED' ? (
                  <button
                    onClick={handleSettleWinner}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Pelunasan Pemenang Diterima</span>
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-50 rounded-lg text-center text-xs font-bold text-emerald-800 border border-emerald-200">
                    Pelunasan kontrak tuntas. SPK dan izin angkut dapat diterbitkan.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">
                Belum ada pemenang yang ditetapkan untuk proyek ini.
              </div>
            )}
          </div>

          {/* Loser Refund Execution Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold font-mono text-blue-800 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                Peserta Kalah
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Pengembalian Uang Jaminan (Minus Potongan Kesepakatan)
              </h3>
            </div>

            <div className="space-y-3">
              {activeProjectDetail.deposits
                .filter((d) => d.companyName !== currentProj?.winnerCompany)
                .map((dep) => (
                  <div
                    key={dep.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2 font-mono"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 font-sans">{dep.companyName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          dep.status === 'REFUNDED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {dep.status === 'REFUNDED' ? 'DANA SUDAH DIREFUND' : 'SIAP DIREFUND'}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Setoran Awal:</span>
                        <span>{formatPrice(dep.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Potongan Admin Sesuai Kesepakatan:</span>
                        <span className="text-rose-600 font-bold">- {formatPrice(dep.deductionAmount || currentProj?.depositDeductionFee || 500000)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-emerald-800">
                        <span className="font-sans">Net Dana Ditransfer Balik:</span>
                        <span>{formatPrice(dep.netRefundAmount || (dep.amount - (currentProj?.depositDeductionFee || 500000)))}</span>
                      </div>
                    </div>

                    {dep.status !== 'REFUNDED' && (
                      <button
                        onClick={() => handleRefundLoser(dep.id, dep.companyName)}
                        className="w-full mt-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition-colors shadow-2xs cursor-pointer"
                      >
                        Transfer Refund Uang Jaminan Selesai →
                      </button>
                    )}
                  </div>
                ))}

              {activeProjectDetail.deposits.filter((d) => d.companyName !== currentProj?.winnerCompany).length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Tidak ada peserta kalah lain yang memerlukan proses refund jaminan.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BUAT LELANG PROYEK BARU */}
      {activeTab === 'create' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl mx-auto space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Formulir Pembukaan Lelang Proyek Baru
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Input data lelang proyek industri, spesifikasi, dan ketentuan uang jaminan.
            </p>
          </div>

          <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Judul Lelang Proyek *</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="cth. Lelang Pembongkaran Tangki CPO & Struktur Baja"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Proyek</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Lokasi Proyek *</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Owner / Pemilik Aset</label>
                <input
                  type="text"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimasi Volume (Tonase)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newVolume}
                    onChange={(e) => setNewVolume(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-20 p-2 border border-slate-300 rounded-lg font-mono font-bold text-center"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nilai Pembukaan Bidding (Rp) *</label>
                <input
                  type="number"
                  value={newStartingBid}
                  onChange={(e) => setNewStartingBid(Number(e.target.value))}
                  step="5000000"
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kelipatan Tawaran (Increment Rp)</label>
                <input
                  type="number"
                  value={newIncrement}
                  onChange={(e) => setNewIncrement(Number(e.target.value))}
                  step="1000000"
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Uang Jaminan Wajib (Rp) *</label>
                <input
                  type="number"
                  value={newDeposit}
                  onChange={(e) => setNewDeposit(Number(e.target.value))}
                  step="5000000"
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-blue-700"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Potongan Kesepakatan (Rp)</label>
                <input
                  type="number"
                  value={newDeduction}
                  onChange={(e) => setNewDeduction(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-rose-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jadwal Cek Fisik (Aanwijzing)</label>
                <input
                  type="date"
                  value={newAanwijzingDate}
                  onChange={(e) => setNewAanwijzingDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Batas Akhir Bidding (Closing)</label>
                <input
                  type="date"
                  value={newClosingDate}
                  onChange={(e) => setNewClosingDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">URL Gambar Utama</label>
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Deskripsi Proyek & Spesifikasi</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('deposits')}
                className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                Terbitkan Lelang Proyek Baru
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
