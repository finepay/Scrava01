import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ReverseBidRequirement, RFQResponse } from '../../types';
import {
  Layers,
  CheckCircle2,
  ShieldCheck,
  Building,
  DollarSign,
  Truck,
  Scale,
  X,
  ArrowRight
} from 'lucide-react';

interface SplitOrderModalProps {
  requirement: ReverseBidRequirement;
  onClose: () => void;
  onSuccess: () => void;
}

export const SplitOrderModal: React.FC<SplitOrderModalProps> = ({ requirement, onClose, onSuccess }) => {
  const { executeSplitOrder, formatPrice, showToast } = useApp();

  // State to track allocated quantities for each supplier response
  const [allocations, setAllocations] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    if (requirement.responses.length >= 2) {
      init[requirement.responses[0].id] = 40;
      init[requirement.responses[1].id] = 60;
    } else if (requirement.responses.length === 1) {
      init[requirement.responses[0].id] = requirement.quantity;
    }
    return init;
  });

  const totalDemanded = requirement.quantity;
  const currentTotalAllocated = Object.values(allocations).reduce((sum, val) => sum + (val || 0), 0);
  const isExactFulfillment = currentTotalAllocated === totalDemanded;

  // Calculate weighted blended price
  let totalCost = 0;
  requirement.responses.forEach((resp) => {
    const qty = allocations[resp.id] || 0;
    totalCost += qty * resp.pricePerUnit;
  });
  const blendedPricePerUnit = currentTotalAllocated > 0 ? totalCost / currentTotalAllocated : 0;

  const handleQtyChange = (respId: string, val: number) => {
    setAllocations((prev) => ({
      ...prev,
      [respId]: Math.max(0, val),
    }));
  };

  const handleConfirmSplitOrder = () => {
    if (!isExactFulfillment) {
      showToast(`Total alokasi tonase (${currentTotalAllocated} ${requirement.unit}) harus sama persis dengan kuota kebutuhan (${totalDemanded} ${requirement.unit}).`);
      return;
    }

    const payload = requirement.responses
      .filter((r) => (allocations[r.id] || 0) > 0)
      .map((r) => ({
        supplierCompany: r.sellerCompany,
        allocatedQty: allocations[r.id] || 0,
        unitPrice: r.pricePerUnit,
        pickupTerms: `${r.incoterm} (${r.pickupOption || 'Termasuk'})`,
      }));

    executeSplitOrder(requirement.id, payload);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>Sistem Split Order Multi-Supplier Scrava</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Penuhi 100% Kuota Pasokan dari Multi-Depo Terverifikasi
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Kebutuhan Pabrik: {requirement.title} ({totalDemanded} {requirement.unit})
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar & Blended Cost Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-2/3">
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-700">Progres Pemenuhan Kuota:</span>
              <span className={isExactFulfillment ? 'text-emerald-700 font-bold' : 'text-amber-700'}>
                {currentTotalAllocated} / {totalDemanded} {requirement.unit} ({Math.round((currentTotalAllocated / totalDemanded) * 100)}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isExactFulfillment ? 'bg-emerald-600' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, (currentTotalAllocated / totalDemanded) * 100)}%` }}
              />
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <div className="text-[10px] text-slate-400 uppercase font-medium">Rata-Rata Harga Gabungan</div>
            <div className="text-lg font-mono font-extrabold text-slate-900 tabular-nums">
              {formatPrice(blendedPricePerUnit, requirement.unit)}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold">
              Target: {formatPrice(requirement.targetPrice, requirement.unit)}
            </div>
          </div>
        </div>

        {/* Supplier Bids Allocation Rows */}
        <div className="p-6 space-y-4 max-h-[350px] overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Proposal Depo Tersedia ({requirement.responses.length})
          </div>

          {requirement.responses.map((resp) => {
            const allocated = allocations[resp.id] || 0;
            return (
              <div
                key={resp.id}
                className={`p-4 border rounded-lg transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  allocated > 0 ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-xs text-slate-900">{resp.sellerCompany}</span>
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100/60 px-1.5 py-0.2 rounded font-semibold">
                      Skor Scrava: {resp.scravaScore?.overall || 96}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Kapasitas Ditawarkan: <strong>{resp.quantityOffered} {resp.unit}</strong> @ <strong className="font-mono text-slate-900">{formatPrice(resp.pricePerUnit, resp.unit)}</strong> ({resp.incoterm})
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Waktu kirim: {resp.deliveryTimeline} · {resp.notes}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <div className="text-right">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase">Alokasi Tonase</label>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <input
                        type="number"
                        min={0}
                        max={resp.quantityOffered}
                        value={allocated}
                        onChange={(e) => handleQtyChange(resp.id, Number(e.target.value))}
                        className="w-20 px-2 py-1 text-xs border border-slate-300 rounded font-mono font-bold text-center text-slate-900"
                      />
                      <span className="text-xs text-slate-500 font-mono">{resp.unit}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 text-[11px]">
            Sistem otomatis membagi ini menjadi <strong>{Object.values(allocations).filter((v) => v > 0).length} Sub-Order Depo</strong> dalam 1 Surat Jalan Pengadaan Tunggal bagi pabrik.
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
            >
              Batal
            </button>
            <button
              onClick={handleConfirmSplitOrder}
              disabled={!isExactFulfillment}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Konfirmasi Split Order ({currentTotalAllocated} {requirement.unit})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
