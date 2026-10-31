import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  DollarSign,
  Scale,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  Building,
  CheckCircle2,
  Download,
  ExternalLink,
  ChevronRight,
  PlusCircle,
  FileText
} from 'lucide-react';

interface FinancePagesProps {
  view: 'payments' | 'settlements' | 'disputes';
  navigate: (path: string, params?: any) => void;
}

export const FinancePages: React.FC<FinancePagesProps> = ({ view, navigate }) => {
  const { orders, disputes, formatPrice, currentCompany, showToast } = useApp();

  if (view === 'payments') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Pembayaran Escrow & Pencairan Dana</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekening penampungan rekber escrow resmi untuk keamanan dana pembeli dan pencairan otomatis ke penjual
          </p>
        </div>

        {/* Escrow summary banner */}
        <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Rekber Escrow Terproteksi Resmi</h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              ID Escrow: EX-TRZ-2026-VAULT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-xs text-slate-400">Dana Sedang Ditahan di Escrow</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                {formatPrice(161500)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Menunggu verifikasi timbangan & QC</div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Total Dana Berhasil Dicairkan</div>
              <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                {formatPrice(196196)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Ditransfer langsung ke rekening bank rekanan</div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Rekonsiliasi Selisih Bobot</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
                -{formatPrice(526.5)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Pengembalian otomatis ke akun pembeli</div>
            </div>
          </div>
        </div>

        {/* Transaction History Table */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wider">
            Catatan Mutasi & Transaksi Escrow
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">ID Transaksi</th>
                <th className="py-3 px-3">Ref Pesanan</th>
                <th className="py-3 px-3">Jenis Transaksi</th>
                <th className="py-3 px-3 text-right">Nilai Tagihan</th>
                <th className="py-3 px-3 text-right">Biaya Platform</th>
                <th className="py-3 px-3">Status Escrow</th>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-semibold text-slate-900">TX-{o.id.slice(-4)}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{o.orderNumber}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800">Deposit Escrow</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatPrice(o.totalOriginalValue)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-500 tabular-nums">
                    {formatPrice(o.settlement.platformFee)}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={o.paymentStatus} />
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{o.createdAt.split(' ')[0]}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => navigate('dashboard-order-detail', { id: o.id })}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
                    >
                      Lihat Dokumen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (view === 'settlements') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Jembatan Timbang & Rekonsiliasi Final</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verifikasi bobot timbangan fisik dan riwayat penyesuaian nilai kontrak otomatis
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Nomor Pesanan</th>
                <th className="py-3 px-3">Lot Material</th>
                <th className="py-3 px-3 text-right">Bobot Kontrak</th>
                <th className="py-3 px-3 text-right">Bobot Bersih Aktual</th>
                <th className="py-3 px-3 text-right">Selisih Bobot</th>
                <th className="py-3 px-3 text-right">Nilai Disesuaikan</th>
                <th className="py-3 px-3">Tiket Timbang</th>
                <th className="py-3 px-3">Penyelesaian</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900 truncate max-w-xs">{o.productTitle}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">{o.quantity} {o.unit}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {o.weighbridge.actualNetWeight} {o.unit}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    <span className={o.weighbridge.difference < 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                      {o.weighbridge.difference > 0 ? '+' : ''}{o.weighbridge.difference} {o.unit}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatPrice(o.settlement.adjustedValue)}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                    {o.weighbridge.ticketNumber}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={o.settlement.status} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => navigate('dashboard-order-detail', { id: o.id })}
                      className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
                    >
                      Audit Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // view === 'disputes'
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Pusat Mediasi & Penyelesaian Sengketa</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kasus mediasi resmi terkait selisih timbangan, kontaminasi mutu logam, atau kendala logistik
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {disputes.map((d) => (
          <div key={d.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {d.disputeNumber}
                </span>
                <span className="text-xs font-semibold text-slate-900">Ref Pesanan: {d.orderNumber}</span>
                <StatusBadge status={d.status} type="dispute" />
                <span className="text-[11px] font-mono text-slate-400">· Diajukan: {d.createdAt}</span>
              </div>
              <div className="font-mono font-bold text-rose-700 text-sm">
                Nilai Klaim: {formatPrice(d.claimAmount)}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">{d.productTitle}</h3>
              <div className="text-xs text-slate-500 mt-0.5">
                Diajukan oleh: <strong>{d.raisedByCompany}</strong> ({d.raisedByRole === 'buyer' ? 'Pembeli' : 'Penjual'}) terhadap <strong>{d.againstCompany}</strong> · Alasan: <strong>{d.reason}</strong>
              </div>
              <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200 leading-relaxed font-mono">
                "{d.description}"
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Bukti Terlampir: {d.evidenceFiles.join(', ')}</span>
              </div>
              <button
                onClick={() => navigate('dashboard-order-detail', { id: d.orderId })}
                className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Periksa Kronologi Pesanan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
