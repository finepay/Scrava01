import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { COUNTRIES, CURRENCIES } from '../../data/mockData';
import {
  TrendingUp,
  Calculator,
  Search,
  ArrowUpDown,
  Filter,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface PriceIndexPageProps {
  navigate: (path: string, params?: any) => void;
}

export const PriceIndexPage: React.FC<PriceIndexPageProps> = ({ navigate }) => {
  const { priceIndex, formatPrice, activeCurrency, setActiveCurrency } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  // Calculator State
  const [calcMaterial, setCalcMaterial] = useState<string>(priceIndex[0]?.material || 'Heavy Melting Steel (HMS 1)');
  const [calcQuantity, setCalcQuantity] = useState<number>(50);
  const [calcUnit, setCalcUnit] = useState<string>('MT');
  const [calcCountry, setCalcCountry] = useState<string>('Indonesia');

  // Filtered prices
  const filteredPrices = useMemo(() => {
    return priceIndex.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (selectedCountry !== 'All' && p.country !== selectedCountry) return false;
      if (search && !p.material.toLowerCase().includes(search.toLowerCase()) && !p.grade.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [priceIndex, selectedCategory, selectedCountry, search]);

  // Selected item for calculator
  const selectedCalcItem = priceIndex.find((p) => p.material === calcMaterial) || priceIndex[0];
  const unitFactor = calcUnit === 'MT' && selectedCalcItem.unit === 'KG' ? 1000 : calcUnit === 'KG' && selectedCalcItem.unit === 'MT' ? 0.001 : 1;
  const estimatedTotalUSD = selectedCalcItem.price * calcQuantity * unitFactor;

  const categories = Array.from(new Set(priceIndex.map((p) => p.category)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 font-sans">
      {/* Title & Header */}
      <div>
        <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
          <button onClick={() => navigate('home')} className="hover:text-slate-800">Beranda</button>
          <span>/</span>
          <span className="text-slate-800 font-medium">Indeks Harga Logam & Scrap</span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Indeks Harga Pasar Bahan Baku & Scrap Industri
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Benchmark harga fisik transaksi riil di berbagai terminal depo dan pabrik smelter nasional
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Mata Uang:</span>
            <div className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold font-mono">
              🇮🇩 Rupiah (IDR)
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Scrap Price Calculator */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 mb-6 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Kalkulator Valuasi & Estimasi Harga Scrap</h2>
              <p className="text-xs text-slate-400">
                Hitung perkiraan nilai transaksi berdasarkan harga benchmark pasar harian
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800 font-bold">
            Pembaruan Harian: Aktif
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Pilih Material / Komoditas</label>
            <select
              value={calcMaterial}
              onChange={(e) => setCalcMaterial(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-xs focus:outline-hidden"
            >
              {priceIndex.map((p) => (
                <option key={p.id} value={p.material}>
                  {p.material} ({p.grade})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Wilayah / Asal Gudang</label>
            <select
              value={calcCountry}
              onChange={(e) => setCalcCountry(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-xs focus:outline-hidden"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Tonase / Kuantitas</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={calcQuantity}
                min={1}
                onChange={(e) => setCalcQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-xs font-mono font-bold"
              />
              <select
                value={calcUnit}
                onChange={(e) => setCalcUnit(e.target.value)}
                className="w-24 bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-xs font-mono font-bold"
              >
                <option value="MT">MT</option>
                <option value="KG">KG</option>
              </select>
            </div>
          </div>

          {/* Calculator Output */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="text-[11px] text-slate-400 uppercase font-bold">Estimasi Total Valuasi Lot</div>
            <div className="text-xl font-black text-emerald-400 font-mono tabular-nums">
              {formatPrice(estimatedTotalUSD)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Benchmark: {formatPrice(selectedCalcItem.price)}/{selectedCalcItem.unit}</span>
              <button
                onClick={() => navigate('dashboard-create-listing')}
                className="text-emerald-400 hover:underline font-bold"
              >
                Jual Lot Ini →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar for Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari indeks material..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-semibold"
          >
            <option value="All">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-semibold"
          >
            <option value="All">Semua Wilayah</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Menampilkan {filteredPrices.length} grade komoditas terindeks
        </div>
      </div>

      {/* Main Price Index Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Material / Komoditas</th>
              <th className="py-3.5 px-4">Grade ISRI / Industri</th>
              <th className="py-3.5 px-4">Kategori</th>
              <th className="py-3.5 px-4 text-right">Harga Spot Patokan</th>
              <th className="py-3.5 px-4">Satuan</th>
              <th className="py-3.5 px-4">Depo Hub / Pelabuhan</th>
              <th className="py-3.5 px-4">Sumber Data Pasar</th>
              <th className="py-3.5 px-4 text-right">Perubahan 24 Jam</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPrices.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900">{item.material}</td>
                <td className="py-3.5 px-4 font-mono text-slate-600">{item.grade}</td>
                <td className="py-3.5 px-4 text-slate-500">{item.category}</td>
                <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 tabular-nums text-sm">
                  {formatPrice(item.price)}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500">/{item.unit}</td>
                <td className="py-3.5 px-4 text-slate-700">
                  {item.location}, {item.country}
                </td>
                <td className="py-3.5 px-4 text-slate-400 text-[11px] truncate max-w-[180px]">
                  {item.source}
                </td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold">
                  <span
                    className={
                      item.change24h > 0
                        ? 'text-emerald-600'
                        : item.change24h < 0
                        ? 'text-rose-600'
                        : 'text-slate-500'
                    }
                  >
                    {item.change24h > 0 ? '+' : ''}{item.change24h}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mandatory Regulatory / Platform Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Pemberitahuan Resmi Transparansi Pasar:</strong> Harga patokan yang ditampilkan pada bursa Scrava merupakan estimasi indikatif yang dikompilasi dari transaksi riil dan data terminal bursa terakreditasi. Harga riil transaksi dapat bervariasi bergantung pada hasil uji kemurnian kadar, kadar air, potongan kontaminasi, jarak logistik pengiriman, dan kesepakatan Incoterm antara pembeli dan penjual.
        </div>
      </div>
    </div>
  );
};
