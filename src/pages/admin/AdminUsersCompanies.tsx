import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, ShieldCheck, UserCheck, Eye, Ban, Search, Filter, Phone, Mail } from 'lucide-react';

interface AdminUsersProps {
  navigate: (path: string, params?: any) => void;
}

export const AdminUsersCompanies: React.FC<AdminUsersProps> = ({ navigate }) => {
  const { companyProfiles, showToast, formatPrice } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const filtered = companyProfiles.filter((comp) => {
    const matchSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase()) || comp.businessType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Manage Pelanggan & Direktori Akun
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar lengkap akun perusahaan terdaftar (Pabrik Pembeli, Depo Scrap Penjual, dan Trader)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg">
            Total Pengguna: <strong>{companyProfiles.length} Akun Perusahaan</strong>
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama perusahaan, penanggung jawab, atau tipe bisnis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-600 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-600 shrink-0">Filter:</span>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-hidden focus:border-emerald-600"
          >
            <option value="all">Semua Tipe Akun</option>
            <option value="buyer">Pabrik Pembeli</option>
            <option value="seller">Depo Scrap Penjual</option>
          </select>
        </div>
      </div>

      {/* Users Table (Light Theme) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Nama Perusahaan / Akun</th>
                <th className="py-3 px-4">Lokasi & Kota</th>
                <th className="py-3 px-4">Klasifikasi Usaha</th>
                <th className="py-3 px-4 text-center">Transaksi Sukses</th>
                <th className="py-3 px-4 text-right">Volume (Tonase)</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Status KYC</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((comp) => (
                <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                    <span className="text-lg">{comp.logo}</span>
                    <div>
                      <div className="font-bold text-slate-900">{comp.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {comp.id}</div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{comp.country}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{comp.businessType}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                    {comp.completedTransactions}x
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                    {comp.totalTradeVolume}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-amber-600">
                    ★ {comp.rating}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {comp.kycStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => showToast(`Profil ${comp.name} telah diverifikasi aktif.`)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] transition-colors"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => showToast(`Status akun ${comp.name} ditinjau.`)}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded text-[11px] transition-colors"
                        title="Tangguhkan Akun"
                      >
                        <Ban className="w-3 h-3" />
                      </button>
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
