import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Scale, CheckCircle2, DollarSign, Package, FileText, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { OrderStatus } from '../../types';

interface AdminOrdersOpsProps {
  navigate: (path: string, params?: any) => void;
}

export const AdminOrdersOps: React.FC<AdminOrdersOpsProps> = ({ navigate }) => {
  const { orders, updateOrderStatus, confirmSettlement, formatPrice, showToast } = useApp();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Manage Transaction (Transaksi & Timbang Terima)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengawasan saldo rekening Escrow, validasi tiket jembatan timbang resmi, dan persetujuan pencairan dana penjual
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
            Total Transaksi: <strong>{orders.length} Kontrak PO</strong>
          </span>
        </div>
      </div>

      {/* Orders Table (Light Theme) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">No. Kontrak / Order</th>
                <th className="py-3 px-4">Pembeli (Pabrik)</th>
                <th className="py-3 px-4">Penjual (Depo)</th>
                <th className="py-3 px-4 text-right">Nilai Escrow (Rp)</th>
                <th className="py-3 px-4">Hasil Jembatan Timbang</th>
                <th className="py-3 px-4">Inspeksi Mutu (QC)</th>
                <th className="py-3 px-4">Status Transaksi</th>
                <th className="py-3 px-4 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    <div>{o.orderNumber}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{o.productTitle}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-900 font-semibold">{o.buyerCompany}</td>
                  <td className="py-3.5 px-4 text-slate-700">{o.sellerCompany}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                    {formatPrice(o.totalOriginalValue)}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    {o.weighbridge.actualNetWeight > 0 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Scale className="w-3 h-3 text-emerald-600" />
                        <span>{o.weighbridge.actualNetWeight} {o.unit} ({o.weighbridge.difference > 0 ? `+${o.weighbridge.difference}` : o.weighbridge.difference} MT)</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Sedang Diangkut Truk</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={o.qc.status === 'APPROVED' ? 'text-emerald-700 font-bold' : 'text-amber-700 font-semibold'}>
                      {o.qc.status === 'APPROVED' ? 'Lolos Uji' : 'Pemeriksaan'} ({o.qc.samplePurityPercentage}%)
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => navigate('dashboard-order-detail', { id: o.id })}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] transition-colors"
                      >
                        Detail
                      </button>
                      {o.status === 'SETTLEMENT' || (o.weighbridge.actualNetWeight > 0 && o.status !== 'COMPLETED') ? (
                        <button
                          onClick={() => confirmSettlement(o.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] flex items-center gap-1 transition-colors shadow-2xs"
                        >
                          <Check className="w-3 h-3" />
                          <span>Cairkan Payout</span>
                        </button>
                      ) : null}
                    </div>
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
