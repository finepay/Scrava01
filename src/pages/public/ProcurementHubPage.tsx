import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SplitOrderModal } from '../../components/procurement/SplitOrderModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building,
  Scale,
  Truck,
  MapPin,
  Calendar,
  CheckCircle2,
  DollarSign,
  Search,
  PlusCircle,
  HelpCircle,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Box,
  Compass,
  FileText
} from 'lucide-react';
import { ReverseBidRequirement, MaterialMatchSupply } from '../../types';

interface ProcurementHubProps {
  navigate: (path: string, params?: any) => void;
}

export const ProcurementHubPage: React.FC<ProcurementHubProps> = ({ navigate }) => {
  const {
    reverseBids,
    procurementProjects,
    supplyPool,
    allocateSupplyPool,
    nearbySupplies,
    actualTransactions,
    factoryClearances,
    parseNaturalLanguageToRFQ,
    calculateLandedCost,
    addReverseBid,
    formatPrice,
    showToast
  } = useApp();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'ai_rfq' | 'split_order' | 'matching' | 'supply_pool' | 'landed_cost' | 'clearance' | 'actual_prices'>('split_order');

  // AI RFQ Prompt State
  const [naturalText, setNaturalText] = useState('Saya butuh 100 ton besi tua HMS 1 untuk peleburan induksi, kirim ke Karawang sebelum tanggal 20.');
  const [parsedData, setParsedData] = useState(() => parseNaturalLanguageToRFQ(naturalText));

  // Split Order Modal State
  const [splitModalReq, setSplitModalReq] = useState<ReverseBidRequirement | null>(null);

  // Landed Cost state
  const [calcBasePrice, setCalcBasePrice] = useState<number>(385);
  const [calcDistance, setCalcDistance] = useState<number>(65);

  // Nearby supply distance filter
  const [maxDistance, setMaxDistance] = useState<number>(100);

  const handleRunAIParser = (text: string) => {
    setNaturalText(text);
    const result = parseNaturalLanguageToRFQ(text);
    setParsedData(result);
  };

  const handleCreateFromAI = () => {
    addReverseBid({
      title: `${parsedData.material} (${parsedData.quantity} ${parsedData.unit}) - ${parsedData.purpose}`,
      category: parsedData.category,
      material: parsedData.material,
      quantity: parsedData.quantity,
      unit: parsedData.unit,
      targetPrice: Math.round(parsedData.suggestedPriceIDR / 15.85),
      currency: 'USD',
      deliveryLocation: parsedData.destination,
      requiredDate: parsedData.requiredDate,
      incoterm: 'DDP',
      specifications: `${parsedData.condition} untuk keperluan ${parsedData.purpose}. Diantar langsung ke pintu pabrik.`,
      deadline: '2026-10-10',
    });
    showToast('Kebutuhan bahan pabrik (RFQ) berhasil dibuat dan diterbitkan ke depo terverifikasi!');
    setActiveTab('split_order');
  };

  const landedCostResult = calculateLandedCost(calcBasePrice, calcDistance);
  const ptAbcRequirement = reverseBids.find((r) => r.id === 'RFQ-TRZ-100') || reverseBids[0];

  const filteredNearby = nearbySupplies.filter((s) => s.distanceKm <= maxDistance);
  const totalImmediateQty = filteredNearby.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Scrava · Arsitektur Pengadaan & Pasokan Pabrik</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Orkestrasi Kebutuhan Pabrik & Pasokan Scrap (Split Order)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Solusi pengadaan bahan baku modern: Dari publikasi kebutuhan pabrik, penggabungan kuota multi-depo (*Split Order*), radius logistik terdekat, hingga pencairan otomatis via jembatan timbang.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ai_rfq')}
              className="px-4 py-2.5 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Pembuat RFQ Otomatis</span>
            </button>
            <button
              onClick={() => setSplitModalReq(ptAbcRequirement)}
              className="px-4 py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              Simulasi Split Order
            </button>
          </div>
        </div>

        {/* Feature Segmented Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-6">
          {[
            { id: 'split_order', label: '1. Alokasi Split Order (Multi-Depo)' },
            { id: 'ai_rfq', label: '2. Konversi Bahasa Alami ke RFQ' },
            { id: 'matching', label: '3. Pasokan Terdekat (Radius km)' },
            { id: 'supply_pool', label: '4. Pengumpulan Pasokan Depo' },
            { id: 'landed_cost', label: '5. Kalkulator Biaya Tiba (Landed Cost)' },
            { id: 'clearance', label: '6. Lelang Bongkaran & Surplus Pabrik' },
            { id: 'actual_prices', label: '7. Harga Transaksi Riil Tervalidasi' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. MULTI-SUPPLIER SPLIT ORDER SECTION */}
      {activeTab === 'split_order' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="text-xs font-bold font-mono text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Kasus Nyata Kebutuhan Pabrik</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  PT Cilegon Steel: Membutuhkan 100 MT Besi Tua HMS 1
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span>Tujuan Pengiriman: <strong>Bandung, Jawa Barat</strong></span>
                  <span>Tgl Diperlukan: <strong>15 Oktober 2026</strong></span>
                  <span>Target Budget: <strong className="text-emerald-700 font-mono">Rp7.500/kg ($473/MT)</strong></span>
                  <span>Batas Waktu Depo: <strong>5 Oktober 2026</strong></span>
                </div>
              </div>

              <button
                onClick={() => setSplitModalReq(ptAbcRequirement)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4" />
                <span>Atur Alokasi Split Order</span>
              </button>
            </div>

            {/* Explanatory banner */}
            <div className="mt-4 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Arsitektur Multi-Depo Scrava:</strong> Kebutuhan pabrik tidak harus dipenuhi oleh satu supplier saja. Scrava mengorkestrasi beberapa supplier sekaligus untuk memenuhi target volume (misal: <strong>Depo A 40 MT + Depo B 60 MT = 100 MT</strong>), lalu menyatukannya ke dalam 1 digital contract terintegrasi.
              </div>
            </div>

            {/* Competitive Supplier Bid Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Depo / Pemasok</th>
                    <th className="py-3 px-4 text-center">Kapasitas Stok</th>
                    <th className="py-3 px-4 text-right">Harga Tawaran</th>
                    <th className="py-3 px-4">Syarat Muat & Kirim</th>
                    <th className="py-3 px-4 text-center">Uji Spektro QC</th>
                    <th className="py-3 px-4 text-center">Skor Akreditasi</th>
                    <th className="py-3 px-4 text-right">Alokasi Kuota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ptAbcRequirement.responses.map((resp, idx) => (
                    <tr key={resp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>{resp.sellerCompany}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        {resp.quantityOffered} {resp.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 text-sm">
                        {idx === 0 ? 'Rp7.400 /kg' : idx === 1 ? 'Rp7.350 /kg' : 'Rp7.550 /kg'}
                        <div className="text-[10px] text-slate-400 font-normal">(${resp.pricePerUnit}/MT)</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {resp.pickupOption} ({resp.incoterm})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Lolos (SGS)</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {resp.scravaScore?.overall}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">
                        {idx === 0 ? (
                          <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            Alokasi 40 MT
                          </span>
                        ) : idx === 1 ? (
                          <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            Alokasi 60 MT
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Cadangan / Standby</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Split Order Summary Card */}
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    Status Split Order: 100 MT Terpenuhi 100%
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Depo A (40 MT @ Rp7.400) + Depo B (60 MT @ Rp7.350) · Rata-rata Tertimbang: <strong>Rp7.370/kg</strong> (Hemat Rp130/kg dibanding target budget!)
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSplitModalReq(ptAbcRequirement)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-xs"
              >
                Ubah Alokasi Kuota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. AI NATURAL LANGUAGE RFQ GENERATOR */}
      {activeTab === 'ai_rfq' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="pb-4 border-b border-slate-100">
              <div className="text-xs font-bold font-mono text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Konversi Otomatis Kalimat Bebas ke Format RFQ Industri</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Tulis Kebutuhan Pabrik dalam Bahasa Alami
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ketik instruksi pengadaan seperti biasa. Mesin cerdas Scrava otomatis mengonversi kalimat bebas menjadi parameter RFQ standar industri.
              </p>
            </div>

            {/* Quick Sample Prompts */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-bold">Contoh Cepat:</span>
              <button
                onClick={() => handleRunAIParser('Saya butuh 100 ton besi tua HMS 1 untuk peleburan induksi, kirim ke Karawang sebelum tanggal 20.')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
              >
                "100 ton HMS 1 ke Karawang"
              </button>
              <button
                onClick={() => handleRunAIParser('Pabrik butuh 45 ton tembaga bare bright wire kabel millberry kirim ke Bandung minggu ini.')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
              >
                "45 ton tembaga bare bright ke Bandung"
              </button>
              <button
                onClick={() => handleRunAIParser('Perlu 30 ton aluminium profil 6063 clean offcuts kirim ke Cikarang sebelum akhir bulan.')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
              >
                "30 ton aluminium 6063 ke Cikarang"
              </button>
            </div>

            {/* Natural Textarea */}
            <div className="mt-4">
              <textarea
                value={naturalText}
                onChange={(e) => handleRunAIParser(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-hidden font-medium text-slate-900 shadow-inner"
                placeholder="Tulis kebutuhan pabrik Anda disini..."
              />
            </div>

            {/* AI Extraction Preview Card */}
            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
                <span className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Parameter RFQ Terstruktur Berhasil Diekstrak</span>
                </span>
                <span className="font-mono text-emerald-700 font-bold">Siap Dicocokkan ke Pemasok</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-sans">Material:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{parsedData.material}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-sans">Kategori:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{parsedData.category}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-sans">Tonase:</span>
                  <div className="font-bold text-emerald-700 mt-0.5">{parsedData.quantity} {parsedData.unit}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-sans">Tujuan Kirim:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{parsedData.destination}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-sans">Tgl Diperlukan:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{parsedData.requiredDate}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-sans">Tujuan Penggunaan:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{parsedData.purpose}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-sans">Kondisi:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{parsedData.condition}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-sans">Target Benchmark:</span>
                  <div className="font-bold text-slate-900 mt-0.5">Rp{parsedData.suggestedPriceIDR.toLocaleString('id-ID')}/kg</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500 font-sans">
                  Scrava akan langsung memberitahukan depo scrap terakreditasi dalam radius logistik terdekat.
                </span>
                <button
                  onClick={handleCreateFromAI}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Terbitkan Kebutuhan RFQ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MATERIAL MATCHING ENGINE & NEARBY SUPPLY */}
      {activeTab === 'matching' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="text-xs font-bold font-mono text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  <span>Jaringan Pasokan Geografis & Efisiensi Angkut</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Potensi Pasokan Scrap Sekitar Jawa Barat (Besi HMS 1)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Stok terdekat siap diantar ke pabrik: <strong>{totalImmediateQty} MT tersedia saat ini</strong> + <strong>42 MT siap kirim dalam 14 hari</strong>
                </p>
              </div>

              {/* Radius filter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-bold">Radius Logistik:</span>
                <div className="flex gap-1">
                  {[50, 100, 200].map((km) => (
                    <button
                      key={km}
                      onClick={() => setMaxDistance(km)}
                      className={`px-3 py-1 rounded-lg font-mono font-bold transition-colors ${
                        maxDistance === km
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      &lt; {km} km
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Nearby Suppliers Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNearby.map((sup) => (
                <div
                  key={sup.id}
                  className="p-4 border border-slate-200 rounded-xl hover:border-emerald-500 transition-all flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-900 truncate max-w-[170px]">{sup.supplierName}</span>
                      <span className="font-mono text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {sup.distanceKm} km
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sup.location}</span>
                    </div>

                    <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs flex justify-between font-mono">
                      <span>Tonase Tersedia:</span>
                      <span className="font-bold text-slate-900">{sup.quantity} {sup.unit}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Harga Indikatif</div>
                      <div className="text-sm font-black font-mono text-emerald-700">Rp {(sup.pricePerUnit * 15.85).toLocaleString('id-ID')} / kg</div>
                    </div>

                    <button
                      onClick={() => {
                        showToast(`Permintaan pasokan dikirim ke ${sup.supplierName} untuk ${sup.quantity} ${sup.unit}.`);
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
                    >
                      Kunci Pasokan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. SUPPLY POOL AGGREGATION */}
      {activeTab === 'supply_pool' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="pb-4 border-b border-slate-100">
              <div className="text-xs font-bold font-mono text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Box className="w-4 h-4" />
                <span>Pengumpulan Pasokan Depo & Pencocokan Kebutuhan</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Scrava Supply Pool (Kumpulan Stok Terbuka)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Depo memasukkan stok gudang yang belum terikat kontrak. Sistem cerdas Scrava otomatis mencocokkannya ke permintaan smelter.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {supplyPool.map((pool) => (
                <div key={pool.id} className="p-5 border border-slate-200 rounded-xl bg-white space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {pool.id}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">{pool.material}</h3>
                        <span className="text-xs text-slate-500 font-mono">({pool.grade})</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Depo Pengepul: <strong>{pool.collectorName}</strong> · Lokasi Gudang: {pool.location}
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Stok Siap Kirim</div>
                      <div className="text-xl font-black font-mono text-emerald-700">{pool.availableQty} {pool.unit}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Rentang Harga: Rp {(pool.expectedPriceMin * 15.85).toFixed(0)} - Rp {(pool.expectedPriceMax * 15.85).toFixed(0)} / kg</div>
                    </div>
                  </div>

                  {/* Matched Buyer Demands */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Permintaan Pabrik yang Cocok ({pool.matchedDemands.length})
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {pool.matchedDemands.map((dem, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 flex flex-col justify-between">
                          <div>
                            <div className="font-bold text-slate-900">{dem.buyerName}</div>
                            <div className="text-slate-500">Tujuan: {dem.destination}</div>
                            <div className="text-slate-800 mt-1 font-mono font-bold">
                              Kebutuhan: {dem.needQty} {pool.unit} @ Rp {(dem.targetPrice * 15.85).toFixed(0)}/kg
                            </div>
                          </div>
                          <button
                            onClick={() => allocateSupplyPool(pool.id, idx)}
                            className="mt-2 w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs"
                          >
                            Alokasikan Pasokan ({dem.needQty} {pool.unit})
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. LANDED COST ENGINE */}
      {activeTab === 'landed_cost' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="pb-4 border-b border-slate-100">
              <div className="text-xs font-bold font-mono text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Truck className="w-4 h-4" />
                <span>Rincian Biaya Angkut & Harga Tiba di Pabrik (*Landed Cost*)</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Hitung Biaya Riil Seluruh Komponen hingga Pintu Tungku
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Jangan membeli scrap hanya berdasarkan harga timbang gudang. Kalkulator ini memperhitungkan jarak angkut, biaya bongkar, uji lab, dan jaminan escrow.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Harga Dasar Material (USD / MT)
                  </label>
                  <input
                    type="number"
                    value={calcBasePrice}
                    onChange={(e) => setCalcBasePrice(Number(e.target.value))}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">Setara: ~Rp{(calcBasePrice * 15.85).toLocaleString('id-ID')}/kg</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jarak Pengiriman Truk Trailer (KM)
                  </label>
                  <input
                    type="number"
                    value={calcDistance}
                    onChange={(e) => setCalcDistance(Number(e.target.value))}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                  />
                  <div className="flex gap-2 mt-1">
                    {[35, 65, 120, 250].map((d) => (
                      <button
                        key={d}
                        onClick={() => setCalcDistance(d)}
                        className="px-2.5 py-0.5 bg-slate-100 rounded text-[11px] font-mono text-slate-700 hover:bg-slate-200"
                      >
                        {d} km
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Landed Cost Breakdown Output */}
              <div className="md:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 text-xs">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-xs pb-2 border-b border-slate-200">
                  Struktur Rincian Biaya Tiba (Per MT)
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                  <span className="text-slate-600">Harga Dasar di Pintu Depo:</span>
                  <span className="font-bold text-slate-900">${landedCostResult.materialBasePrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                  <span className="text-slate-600">Ongkos Truk Trailer ({calcDistance} km):</span>
                  <span className="font-bold text-slate-800">+${landedCostResult.transportFreight.toFixed(2)}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                  <span className="text-slate-600">Crane Gudang & Biaya Muat/Bongkar:</span>
                  <span className="font-bold text-slate-800">+${landedCostResult.handlingLoading.toFixed(2)}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                  <span className="text-slate-600">Inspeksi Lab & Uji Spektrometri SGS:</span>
                  <span className="font-bold text-slate-800">+${landedCostResult.qcInspection.toFixed(2)}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 font-mono">
                  <span className="text-slate-600">Jaminan Escrow & Rekonsiliasi (1.5%):</span>
                  <span className="font-bold text-slate-800">+${landedCostResult.platformEscrowFee.toFixed(2)}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between font-bold text-sm">
                  <span className="text-slate-900">Total Estimasi Biaya Tiba di Pabrik:</span>
                  <span className="text-emerald-700 font-mono text-lg">
                    ${landedCostResult.estimatedLandedCost.toFixed(2)} / MT
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-mono">
                  Setara dengan ~Rp{(landedCostResult.estimatedLandedCost * 15.85).toFixed(0)}/kg di pintu tungku peleburan
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. FACTORY CLEARANCE & SURPLUS */}
      {activeTab === 'clearance' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="text-xs font-bold font-mono text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Building className="w-4 h-4" />
                  <span>Relokasi Pabrik & Likuidasi Mesin Industri</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Likuidasi Pabrik Ex-Manufaktur — Plant Bandung
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  PT Autoparts Precision Bandung · Seluruh aset tersedia sebagai lot satuan atau borongan satu pabrik
                </p>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Valuasi Total Paket</div>
                <div className="text-xl font-black font-mono text-emerald-700">$380,000 USD</div>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Nama Aset / Mesin</th>
                    <th className="py-3 px-4">Klasifikasi</th>
                    <th className="py-3 px-4">Tonase / Unit</th>
                    <th className="py-3 px-4 text-right">Est. Valuasi</th>
                    <th className="py-3 px-4">Kondisi Operasional</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {factoryClearances[0].assets.map((ast, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900 font-sans">{ast.name}</td>
                      <td className="py-3 px-4 text-slate-600 font-sans">{ast.category}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{ast.quantity} {ast.unit}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">${ast.estValue.toLocaleString()}</td>
                      <td className="py-3 px-4 font-sans">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {ast.condition}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        <button
                          onClick={() => showToast(`Lembar penawaran dibuka untuk ${ast.name}.`)}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
                        >
                          Tawar Lot
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. ACTUAL TRANSACTIONS INTELLIGENCE */}
      {activeTab === 'actual_prices' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="pb-4 border-b border-slate-100">
              <div className="text-xs font-bold font-mono text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Transparansi Pasar: Perbandingan Harga Iklan vs Kesepakatan Akhir</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Database Riwayat Transaksi Riil Tervalidasi Jembatan Timbang
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Rekam jejak transaksi riil setelah rekonsiliasi timbangan resmi dan verifikasi kemurnian kadar SGS
              </p>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Grade Komoditas</th>
                    <th className="py-3 px-4">Wilayah Hub</th>
                    <th className="py-3 px-4 text-right">Harga Buka Iklan</th>
                    <th className="py-3 px-4 text-right">Harga Akhir Deal</th>
                    <th className="py-3 px-4 text-right">Tonase</th>
                    <th className="py-3 px-4 text-center">Variansi Timbang %</th>
                    <th className="py-3 px-4 text-right">Koreksi Kadar</th>
                    <th className="py-3 px-4">Tgl Selesai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {actualTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-sans">
                        {tx.material} ({tx.grade})
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-sans">{tx.region}</td>
                      <td className="py-3.5 px-4 text-right text-slate-500 line-through">
                        ${tx.listingPricePerUnit.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-emerald-700 text-sm">
                        ${tx.actualSettlementPricePerUnit.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-900 font-bold">{tx.volumeMT} {tx.unit}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={tx.weighbridgeVariancePct < 0 ? 'text-rose-600 font-bold' : 'text-emerald-600'}>
                          {tx.weighbridgeVariancePct}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {tx.qualityAdjustmentDeltaUSD < 0 ? (
                          <span className="text-rose-600 font-bold">
                            -${Math.abs(tx.qualityAdjustmentDeltaUSD).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">$0</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-sans text-[11px]">{tx.settledDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Split Order Modal Triggered when user selects a requirement */}
      {splitModalReq && (
        <SplitOrderModal
          requirement={splitModalReq}
          onClose={() => setSplitModalReq(null)}
          onSuccess={() => {
            setSplitModalReq(null);
            navigate('dashboard-orders');
          }}
        />
      )}
    </div>
  );
};
