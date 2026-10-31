import React from 'react';
import { OrderStatus } from '../../types';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface TimelineProps {
  currentStatus: OrderStatus;
}

const STAGES = [
  { id: 'LISTING_CREATED', label: 'Listing Dibuat' },
  { id: 'OFFER_SUBMITTED', label: 'Penawaran Diajukan' },
  { id: 'OFFER_ACCEPTED', label: 'Penawaran Disepakati' },
  { id: 'ORDER_CREATED', label: 'Pesanan PO Dibuat' },
  { id: 'PAYMENT_PENDING', label: 'Menunggu Pembayaran' },
  { id: 'PAID', label: 'Escrow Terverifikasi' },
  { id: 'PICKUP_SCHEDULED', label: 'Jadwal Muat / Kirim' },
  { id: 'PICKED_UP', label: 'Muatan Berangkat' },
  { id: 'WEIGHING', label: 'Timbangan Jembatan' },
  { id: 'QC', label: 'Uji Lab & Mutu (QC)' },
  { id: 'SETTLEMENT', label: 'Rekonsiliasi Escrow' },
  { id: 'SETTLED', label: 'Pencairan Dikonfirmasi' },
  { id: 'COMPLETED', label: 'Transaksi Selesai' },
];

export const TimelineComponent: React.FC<TimelineProps> = ({ currentStatus }) => {
  const getStageIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PAYMENT_PENDING':
        return 4;
      case 'PAID':
        return 5;
      case 'PICKUP_SCHEDULED':
        return 6;
      case 'PICKED_UP':
        return 7;
      case 'WEIGHING':
        return 8;
      case 'QC':
        return 9;
      case 'SETTLEMENT':
        return 10;
      case 'COMPLETED':
        return 12;
      case 'DISPUTED':
        return 9; // Disputed around QC/Weighing
      default:
        return 3;
    }
  };

  const activeIndex = getStageIndex(currentStatus);
  const isDisputed = currentStatus === 'DISPUTED';

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Alur Eksekusi Transaksi & Logistik B2B</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Tahap {activeIndex + 1} dari 13 · Setiap pergerakan logistik dan berat timbangan tercatat secara resmi
          </p>
        </div>
        {isDisputed ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded">
            <AlertTriangle className="w-3.5 h-3.5" />
            Dalam Mediasi Sengketa
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Dijamin Rekening Bersama Escrow
          </span>
        )}
      </div>

      {/* Horizontal Stepper with horizontal scroll for wide screens / mobile */}
      <div className="overflow-x-auto pb-3 pt-1">
        <div className="flex items-center min-w-[980px] justify-between relative">
          {/* Connector Line behind steps */}
          <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-slate-200 -z-0" />
          <div
            className="absolute top-3.5 left-4 h-0.5 bg-emerald-600 transition-all duration-300 -z-0"
            style={{ width: `${(activeIndex / (STAGES.length - 1)) * 96}%` }}
          />

          {STAGES.map((stage, idx) => {
            const isPassed = idx < activeIndex;
            const isCurrent = idx === activeIndex;

            let circleClass = 'bg-white border-2 border-slate-300 text-slate-400';
            let textClass = 'text-slate-400';

            if (isPassed) {
              circleClass = 'bg-emerald-600 border-2 border-emerald-600 text-white';
              textClass = 'text-slate-700 font-medium';
            } else if (isCurrent) {
              if (isDisputed) {
                circleClass = 'bg-rose-600 border-2 border-rose-600 text-white ring-4 ring-rose-100';
                textClass = 'text-rose-700 font-semibold';
              } else {
                circleClass = 'bg-white border-2 border-emerald-600 text-emerald-700 ring-4 ring-emerald-100';
                textClass = 'text-emerald-800 font-semibold';
              }
            }

            return (
              <div key={stage.id} className="flex flex-col items-center text-center relative z-10 w-20">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors duration-150 ${circleClass}`}
                >
                  {isPassed ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span className={`text-[11px] leading-tight mt-2 ${textClass}`}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
