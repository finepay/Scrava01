import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Check, X, ShieldCheck } from 'lucide-react';

export const OffPlatformWarningModal: React.FC = () => {
  const { isOffPlatformWarningOpen, closeOffPlatformWarning } = useApp();

  if (!isOffPlatformWarningOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900">
                Pemberitahuan Keamanan & Perlindungan Transaksi
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Komunikasi telepon pribadi, WhatsApp di luar sistem, serta pembayaran di luar rekening bersama dilarang guna melindungi pembeli dan penjual dari penipuan, timbangan liar, dan gagal bayar.
              </p>
            </div>
            <button
              onClick={closeOffPlatformWarning}
              className="text-slate-400 hover:text-slate-600 p-1 -mr-2 -mt-2"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 bg-slate-50 border border-slate-200 rounded p-4 space-y-2.5">
            <p className="text-xs font-semibold text-slate-800">
              Bertransaksi di dalam platform Scrava menjamin:
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Jaminan Rekber Escrow:</strong> Dana pembeli aman disimpan di rekening penampung resmi dan baru dicairkan setelah timbangan resmi & uji mutu disetujui.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Rekonsiliasi Timbangan Metrologi:</strong> Selisih berat otomatis disesuaikan secara transparan tanpa sengketa berkepanjangan.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Perlindungan Mediasi Resmi:</strong> Arbitrase independen dan garansi refund berlaku penuh untuk transaksi di dalam platform.</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={closeOffPlatformWarning}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={closeOffPlatformWarning}
              className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Saya Paham & Tetap di Platform Resmi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
