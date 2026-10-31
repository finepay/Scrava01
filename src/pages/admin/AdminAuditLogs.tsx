import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Search, Shield, Filter } from 'lucide-react';

interface AdminAuditLogsProps {
  navigate: (path: string, params?: any) => void;
}

export const AdminAuditLogs: React.FC<AdminAuditLogsProps> = ({ navigate }) => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');

  const filtered = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Log Audit Sistem & Kepatuhan Kustodi</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Catatan riwayat transaksi tak terhapuskan mencakup persetujuan KYC, kalkulasi pencairan escrow, dan validasi jembatan timbang
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
        <div className="relative w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari tindakan atau nama pengguna..."
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-600"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Menampilkan {filtered.length} catatan audit tervalidasi
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 font-mono text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">ID Log</th>
              <th className="py-3 px-4">Waktu (WIB)</th>
              <th className="py-3 px-4">Pengguna / Agen</th>
              <th className="py-3 px-4">Tindakan</th>
              <th className="py-3 px-4">Entitas Terkait</th>
              <th className="py-3 px-4">IP Asal</th>
              <th className="py-3 px-4">Rincian Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 text-emerald-800 font-bold">{log.id}</td>
                <td className="py-3 px-4 text-slate-500">{log.timestamp}</td>
                <td className="py-3 px-4 text-slate-900 font-semibold">{log.user}</td>
                <td className="py-3 px-4 text-emerald-700 font-bold">{log.action}</td>
                <td className="py-3 px-4 text-slate-600">{log.entity} ({log.entityId})</td>
                <td className="py-3 px-4 text-slate-400">{log.ip}</td>
                <td className="py-3 px-4 text-slate-800 font-sans text-xs">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
