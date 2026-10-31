import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  FileText,
  Eye,
  ShieldCheck
} from 'lucide-react';

interface AdminKycProps {
  navigate: (path: string, params?: any) => void;
}

export const AdminKycQueue: React.FC<AdminKycProps> = ({ navigate }) => {
  const { showToast } = useApp();

  const [queue, setQueue] = useState([
    {
      id: 'KYC-8812',
      company: 'PT Sumatra Aluminium Smelting Corp',
      country: 'Indonesia',
      docs: ['Izin NIB #9021', 'NPWP Pajak #01.892', 'Izin Lingkungan Depo'],
      submitted: '2026-09-28 09:15',
      risk: 'Rendah (Aman)',
      status: 'PENDING',
    },
    {
      id: 'KYC-8813',
      company: 'PT Nusantara Metal Shredders',
      country: 'Indonesia',
      docs: ['NIB Usaha Terpadu', 'Izin Pengelolaan Limbah Logam'],
      submitted: '2026-09-28 11:30',
      risk: 'Rendah (Aman)',
      status: 'PENDING',
    },
  ]);

  const [reviewModalItem, setReviewModalItem] = useState<any>(null);

  const handleApprove = (id: string) => {
    setQueue(queue.map((q) => (q.id === id ? { ...q, status: 'APPROVED' } : q)));
    setReviewModalItem(null);
    showToast('Legalitas KYC perusahaan disetujui untuk izin transaksi Tingkat 1.');
  };

  const handleReject = (id: string) => {
    setQueue(queue.map((q) => (q.id === id ? { ...q, status: 'REJECTED' } : q)));
    setReviewModalItem(null);
    showToast('Pengajuan KYC ditolak. Notifikasi permintaan perbaikan dokumen telah dikirim.');
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Antrean Verifikasi KYC & Legalitas Perusahaan</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Audit berkas perpajakan (NPWP), Nomor Induk Berusaha (NIB), izin lingkungan depo, dan sertifikat legalitas
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">ID Antrean</th>
              <th className="py-3 px-4">Entitas Hukum / Perusahaan</th>
              <th className="py-3 px-4">Negara</th>
              <th className="py-3 px-4">Dokumen yang Dilampirkan</th>
              <th className="py-3 px-4">Tanggal Pengajuan</th>
              <th className="py-3 px-4">Peringkat Risiko</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {queue.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">{item.id}</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">{item.company}</td>
                <td className="py-3.5 px-4 text-slate-600">{item.country}</td>
                <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{item.docs.join(' · ')}</td>
                <td className="py-3.5 px-4 text-slate-500 font-mono">{item.submitted}</td>
                <td className="py-3.5 px-4 text-emerald-700 font-bold">{item.risk}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {item.status === 'APPROVED' ? 'DISETUJUI' : item.status === 'REJECTED' ? 'DITOLAK' : 'MENUNGGU VERIFIKASI'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setReviewModalItem(item)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Periksa Berkas
                    </button>
                    {item.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                        >
                          Tolak
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Dossier Modal */}
      {reviewModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-xs text-slate-700 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Pemeriksaan Berkas Legalitas: {reviewModalItem.company}</h3>
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Asal:</span>
                <span className="font-semibold text-slate-900">{reviewModalItem.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Diajukan:</span>
                <span className="font-mono text-slate-900">{reviewModalItem.submitted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Penyaringan Risiko:</span>
                <span className="text-emerald-700 font-bold">Bebas Sanksi / Catatan Hitam Bersih</span>
              </div>
            </div>

            <div>
              <div className="font-bold text-slate-900 mb-1">Dokumen PDF Terlampir:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                {reviewModalItem.docs.map((d: string) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setReviewModalItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Tutup
              </button>
              <button
                onClick={() => handleReject(reviewModalItem.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-2xs"
              >
                Tolak
              </button>
              <button
                onClick={() => handleApprove(reviewModalItem.id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs"
              >
                Setujui Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
