import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, COUNTRIES } from '../../data/mockData';
import { TrendingUp, PlusCircle, Edit, Trash2, Check, X } from 'lucide-react';
import { PriceIndexItem } from '../../types';

interface AdminPriceIndexProps {
  navigate: (path: string, params?: any) => void;
}

export const AdminPriceIndexManager: React.FC<AdminPriceIndexProps> = ({ navigate }) => {
  const { priceIndex, addPriceIndexItem, updatePriceIndexItem, deletePriceIndexItem, showToast, formatPrice } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [material, setMaterial] = useState('');
  const [grade, setGrade] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState<number>(390);
  const [unit, setUnit] = useState('MT');
  const [country, setCountry] = useState('Indonesia');
  const [location, setLocation] = useState('Pelabuhan Tanjung Perak Surabaya');
  const [source, setSource] = useState('Data Timbang Terminal Logam Terakreditasi');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addPriceIndexItem({
      material,
      grade,
      category,
      price,
      unit,
      country,
      location,
      source,
    });
    setModalOpen(false);
    setMaterial('');
    setGrade('');
    showToast('Benchmark harga referensi pasar berhasil ditambahkan.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Manajemen Indeks Harga Pasar</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi harga acuan pasar spot yang digunakan pada kalkulator valuasi dan benchmark transaksi
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Tambah Benchmark Acuan</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">ID Indeks</th>
              <th className="py-3 px-4">Material</th>
              <th className="py-3 px-4">Grade Komersial</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4 text-right">Harga Spot</th>
              <th className="py-3 px-4">Satuan</th>
              <th className="py-3 px-4">Hub Terminal</th>
              <th className="py-3 px-4">Sumber Data Terakreditasi</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {priceIndex.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">{p.id}</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">{p.material}</td>
                <td className="py-3.5 px-4 text-slate-600 font-mono">{p.grade}</td>
                <td className="py-3.5 px-4 text-slate-600">{p.category}</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 tabular-nums">
                  {formatPrice(p.price)}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500">/{p.unit}</td>
                <td className="py-3.5 px-4 text-slate-700">{p.location}, {p.country}</td>
                <td className="py-3.5 px-4 text-slate-500 text-[11px] truncate max-w-[180px]">{p.source}</td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => deletePriceIndexItem(p.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Hapus Benchmark"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-xs text-slate-700 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Tambah Benchmark Harga Acuan Baru</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Material *</label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="cth. Scrap Tembaga Millberry 99.99%"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Standar ISRI / Grade</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="cth. ISRI 200 (HMS 1)"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Harga Acuan (USD/Rp)</label>
                  <input
                    type="number"
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Satuan</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  >
                    <option value="MT">MT (Metrik Ton)</option>
                    <option value="KG">KG (Kilogram)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Simpan Benchmark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
