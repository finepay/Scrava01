import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MOCK_BIDS } from '../../data/mockData';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Gavel, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

interface BidsPageProps {
  navigate: (path: string, params?: any) => void;
}

export const BidsPage: React.FC<BidsPageProps> = ({ navigate }) => {
  const { auctions, formatPrice, showToast } = useApp();
  const [tab, setTab] = useState<'placed' | 'received'>('received');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Ringkasan Tawaran Lelang Terbuka</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau penawaran lelang terbuka secara langsung untuk lot scrap logam industri dan mesin pabrik
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded border border-slate-200 text-xs">
          <button
            onClick={() => setTab('placed')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              tab === 'placed' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tawaran Diajukan ({MOCK_BIDS.length})
          </button>
          <button
            onClick={() => setTab('received')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              tab === 'received' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tawaran Diterima ({auctions.length})
          </button>
        </div>
      </div>

      {/* Bids Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-3">ID Tawaran</th>
              <th className="py-3 px-3">Material Lelang</th>
              <th className="py-3 px-3">Entitas Penawar</th>
              <th className="py-3 px-3 text-right">Nilai Tawaran</th>
              <th className="py-3 px-3">Waktu Penawaran</th>
              <th className="py-3 px-3">Status Peringkat</th>
              <th className="py-3 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_BIDS.map((bid) => {
              const matchedAuction = auctions.find((a) => a.id === bid.listingId) || auctions[0];
              return (
                <tr key={bid.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-semibold text-slate-900">{bid.id}</td>
                  <td className="py-3.5 px-3">
                    <div
                      onClick={() => navigate('auction-detail', { id: matchedAuction.id })}
                      className="font-bold text-slate-900 hover:text-amber-600 cursor-pointer truncate max-w-xs"
                    >
                      {matchedAuction.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">Volume Lot: {matchedAuction.quantity} {matchedAuction.unit}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-800">{bid.bidderCompany}</div>
                    <div className="text-[10px] text-slate-400">{bid.bidderCountry}</div>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatPrice(bid.amount)}/{matchedAuction.unit}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-500 text-[11px]">{bid.timestamp}</td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        bid.status === 'WINNING'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {bid.status === 'WINNING' ? 'TERTINGGI (MEMIMPIN)' : 'TERLEWATI'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => navigate('auction-detail', { id: matchedAuction.id })}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded transition-colors shadow-xs"
                    >
                      {bid.status === 'WINNING' ? 'Pantau' : 'Tawar Ulang'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
