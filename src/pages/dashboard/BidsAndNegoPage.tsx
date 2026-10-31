import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Gavel, MessageSquare, Clock, CheckCircle2, ArrowRight, DollarSign } from 'lucide-react';

interface BidsAndNegoPageProps {
  navigate: (path: string, params?: any) => void;
}

export const BidsAndNegoPage: React.FC<BidsAndNegoPageProps> = ({ navigate }) => {
  const { auctions, negotiations, currentCompany, formatPrice, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'nego' | 'bids'>('nego');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Tawaran & Negosiasi Harga (Jual & Beli)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau penawaran harga masuk dari pembeli, negosiasi lot scrap, dan histori bid lelang bahan baku
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('nego')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'nego' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Negosiasi Harga ({negotiations.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('bids')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'bids' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gavel className="w-3.5 h-3.5 text-blue-600" />
            <span>Riwayat Bid Lelang ({auctions.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'nego' ? (
        /* Negosiasi Table */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Daftar Room Negosiasi Harga</h2>
            <span className="text-[11px] text-slate-500 font-medium">Semua tawaran mengikat dalam Rupiah</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">ID Nego</th>
                  <th className="p-3.5">Produk / Material</th>
                  <th className="p-3.5">Pihak Rekanan</th>
                  <th className="p-3.5 text-right">Tonase</th>
                  <th className="p-3.5 text-right">Tawaran Harga (Rp)</th>
                  <th className="p-3.5">Incoterm</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {negotiations.map((neg) => (
                  <tr key={neg.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{neg.id}</td>
                    <td className="p-3.5 font-semibold text-slate-900 truncate max-w-xs">
                      {neg.productTitle}
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <div className="font-semibold text-slate-900 truncate max-w-[180px]">
                        {neg.sellerCompany === currentCompany.name ? neg.buyerCompany : neg.sellerCompany}
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase inline-block mt-0.5 ${
                        neg.sellerCompany === currentCompany.name ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {neg.sellerCompany === currentCompany.name ? 'Penawaran Masuk (Jual)' : 'Tawaran Saya (Beli)'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                      {neg.currentOfferQty} {neg.unit}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                      {formatPrice(neg.currentOfferPrice, neg.unit)}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-600">
                      {neg.incoterm}
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        neg.status === 'Accepted'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : neg.status === 'Countered'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {neg.status === 'Accepted' ? 'Disetujui' : neg.status === 'Countered' ? 'Ada Counter Offer' : neg.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => navigate('dashboard-negotiations')}
                        className="px-3 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold rounded-md text-[11px] transition-colors"
                      >
                        Buka Chat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Bids Table */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Riwayat Penawaran Lelang Terbuka</h2>
            <span className="text-[11px] text-slate-500 font-medium">Bursa lelang kilat material & mesin</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">ID Lot Lelang</th>
                  <th className="p-3.5">Material & Mesin</th>
                  <th className="p-3.5">Lokasi Gudang</th>
                  <th className="p-3.5">Jumlah Bid</th>
                  <th className="p-3.5 text-right">Penawaran Tertinggi (Rp)</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {auctions.map((auc) => (
                  <tr key={auc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{auc.id}</td>
                    <td className="p-3.5 font-semibold text-slate-900 truncate max-w-xs">{auc.title}</td>
                    <td className="p-3.5 text-slate-600">{auc.location.city}</td>
                    <td className="p-3.5 font-mono font-bold text-blue-700">{auc.bidCount || 3} Tawaran</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                      {formatPrice(auc.currentBid || auc.pricePerUnit, auc.unit)}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => navigate('auction-detail', { id: auc.id })}
                        className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold rounded-md text-[11px] transition-colors"
                      >
                        Detail Lelang
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
