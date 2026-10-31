import React from 'react';
import { useApp } from '../../context/AppContext';
import { DollarSign, Percent, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AdminFeeProps {
  navigate: (path: string, params?: any) => void;
}

export const AdminFeeConfig: React.FC<AdminFeeProps> = ({ navigate }) => {
  const { platformFees, updatePlatformFee, showToast } = useApp();

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Konfigurasi Biaya Platform (Fee)</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Atur persentase komisi transaksi escrow, biaya iklan listing, biaya jembatan timbang rekanan, dan paket tier perusahaan
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Klasifikasi Biaya</th>
              <th className="py-3 px-4">Tarif Persentase</th>
              <th className="py-3 px-4">Biaya Tetap</th>
              <th className="py-3 px-4">Cakupan Berlaku</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Tanggal Efektif</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {platformFees.map((fee) => (
              <tr key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900">{fee.feeType}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{fee.rate}</td>
                <td className="py-3.5 px-4 font-mono text-slate-800">{fee.fixedAmount}</td>
                <td className="py-3.5 px-4 text-slate-600">{fee.applicableTo}</td>
                <td className="py-3.5 px-4">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                    {fee.status === 'Active' ? 'Aktif' : fee.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500">{fee.effectiveDate}</td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => showToast(`Tarif ${fee.feeType} berhasil diperbarui.`)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] transition-colors"
                  >
                    Ubah Tarif
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
