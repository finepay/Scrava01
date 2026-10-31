import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, CheckCircle2, ShieldAlert, FileText, ArrowRight } from 'lucide-react';

interface AdminDisputesProps {
  navigate: (path: string, params?: any) => void;
}

export const AdminDisputes: React.FC<AdminDisputesProps> = ({ navigate }) => {
  const { disputes, resolveDispute, showToast, formatPrice } = useApp();
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [resolutionNote, setResolutionNote] = useState('Rekonsiliasi tiket timbangan resmi WB-SUB-2026-9821 telah diverifikasi. Pengembalian selisih timbangan disetujui untuk dikembalikan ke pembeli.');

  const handleResolve = (disputeId: string) => {
    resolveDispute(disputeId, resolutionNote);
    setSelectedDispute(null);
    showToast('Mediasi sengketa platform selesai dan penyesuaian finansial telah dieksekusi.');
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Pusat Mediasi & Sengketa Dagang</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Audit klaim antar pihak mengenai selisih jembatan timbang, ketidaksesuaian kadar kemurnian, dan wanprestasi logistik
        </p>
      </div>

      <div className="space-y-4">
        {disputes.map((d) => (
          <div key={d.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {d.disputeNumber}
                </span>
                <span className="text-xs font-semibold text-slate-900">Pesanan: {d.orderNumber}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Prioritas: {d.priority === 'HIGH' ? 'Tinggi' : d.priority === 'MEDIUM' ? 'Sedang' : 'Rendah'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  {d.status === 'OPEN' ? 'TERBUKA' : d.status === 'UNDER_REVIEW' ? 'DALAM REVIEW' : 'SELESAI'}
                </span>
              </div>
              <div className="font-mono font-bold text-rose-700 text-sm">
                Nilai Klaim: {formatPrice(d.claimAmount)}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">{d.productTitle}</h3>
              <div className="text-xs text-slate-500 mt-1">
                Penggugat: <strong className="text-slate-800">{d.raisedByCompany}</strong> terhadap <strong className="text-slate-800">{d.againstCompany}</strong> · Masalah: <strong className="text-rose-700">{d.reason}</strong>
              </div>
              <p className="mt-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono">
                "{d.description}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <div>Bukti Terlampir: {d.evidenceFiles.join(', ')}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('dashboard-order-detail', { id: d.orderId })}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Lihat Berkas Kontrak
                </button>
                {d.status !== 'RESOLVED' && (
                  <button
                    onClick={() => setSelectedDispute(d)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 font-bold text-white rounded-lg text-xs shadow-2xs"
                  >
                    Putuskan Mediasi
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Adjudication Decision Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-xs text-slate-700 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Keputusan Mediasi Platform: {selectedDispute.disputeNumber}</h3>
            <p className="text-slate-500">
              Pilih putusan mengikat. Penyesuaian dana rekening escrow akan otomatis dieksekusi.
            </p>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Catatan Hasil Pemeriksaan & Temuan</label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span>Nilai Klaim:</span>
                <span className="text-slate-900 font-bold">{formatPrice(selectedDispute.claimAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tindakan Sistem:</span>
                <span className="text-emerald-700 font-bold">Rekonsiliasi & Pencairan Escrow Otomatis</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedDispute(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => handleResolve(selectedDispute.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 font-bold text-white rounded-lg shadow-xs"
              >
                Eksekusi Putusan Mengikat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
