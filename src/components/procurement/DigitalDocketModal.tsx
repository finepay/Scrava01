import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Truck,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Download,
  X,
  QrCode
} from 'lucide-react';
import { Order } from '../../types';

interface DigitalDocketModalProps {
  order: Order;
  onClose: () => void;
}

export const DigitalDocketModal: React.FC<DigitalDocketModalProps> = ({ order, onClose }) => {
  const { showToast } = useApp();

  const steps = [
    { label: 'Pesanan Penjual Dikonfirmasi', time: '2026-09-28 08:30', status: 'COMPLETED', location: order.pickupDetails.pickupAddress },
    { label: 'Armada Truk Ditugaskan & Surat Jalan Terbit', time: '2026-09-28 09:15', status: 'COMPLETED', location: order.pickupDetails.transporter },
    { label: 'Pemuatan Barang di Depo Penjual', time: '2026-09-28 11:00', status: 'COMPLETED', location: 'Timbangan Pintu Depo' },
    { label: 'Penimbangan Resmi Jembatan Timbang', time: '2026-09-28 13:45', status: 'COMPLETED', location: order.weighbridge.stationName },
    { label: 'Pemeriksaan Mutu & Spektrometri Sucofindo', time: '2026-09-28 14:15', status: 'COMPLETED', location: 'Unit Uji Lab QC Pabrik' },
    { label: 'Material Diterima di Smelter Pabrik', time: '2026-09-28 16:30', status: 'COMPLETED', location: order.buyerCompany },
    { label: 'Rekonsiliasi & Pencairan Escrow Otomatis', time: '2026-09-28 17:00', status: order.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS', location: 'Kustodi Escrow Scrava' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono">
              TRZ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Surat Jalan & Tiket Timbang Digital Scrava</h3>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                  Surat Jalan Elektronik
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Nomor Surat Jalan #{order.orderNumber}-DKT · Hash: sha256:7f81b9204...
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Top 3-Way Parties Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Pengirim / Penjual Depo</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{order.sellerCompany}</div>
              <div className="text-slate-500 mt-0.5">{order.sellerCountry} · Depo Terverifikasi</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Armada Logistik Resmi</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{order.pickupDetails.transporter}</div>
              <div className="text-slate-500 mt-0.5 font-mono">No. Polisi: {order.pickupDetails.vehiclePlate} · Sopir: {order.pickupDetails.driverName}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Penerima / Pabrik Pembeli</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{order.buyerCompany}</div>
              <div className="text-slate-500 mt-0.5">{order.buyerCountry} · Pintu Tungku Smelter</div>
            </div>
          </div>

          {/* Weighbridge Electronic Ticket */}
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Sertifikasi Jembatan Timbang Elektronik
                </h4>
              </div>
              <span className="font-mono text-slate-500 text-[11px]">
                Tiket #{order.weighbridge.ticketNumber} · {order.weighbridge.stationName}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center font-mono">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase">Berat Kotor (Bruto)</div>
                <div className="text-sm font-bold text-slate-900">{order.weighbridge.actualGrossWeight} {order.weighbridge.unit}</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase">Berat Kendaraan (Tara)</div>
                <div className="text-sm font-bold text-slate-900">{order.weighbridge.tareWeight} {order.weighbridge.unit}</div>
              </div>
              <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded">
                <div className="text-[10px] text-emerald-800 uppercase font-bold">Berat Bersih Tersertifikasi</div>
                <div className="text-base font-extrabold text-emerald-700">{order.weighbridge.actualNetWeight} {order.weighbridge.unit}</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase">Selisih dari Kontrak</div>
                <div className={`text-sm font-bold ${order.weighbridge.difference < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {order.weighbridge.difference} {order.weighbridge.unit}
                </div>
              </div>
            </div>
          </div>

          {/* Chain of Custody Timeline */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Rantai Logistik & Penelusuran Fisik Material</span>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {steps.map((st, i) => (
                <div key={i} className="relative flex items-start justify-between gap-4">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-white" />
                  <div>
                    <div className="font-bold text-slate-900">{st.label}</div>
                    <div className="text-[11px] text-slate-500">{st.location}</div>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400 shrink-0">{st.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500 font-mono text-[11px]">
            Sah secara hukum perdagangan elektronik dan logistik Indonesia (UU ITE).
          </div>
          <button
            onClick={() => showToast('Mengunduh dokumen surat jalan PDF tervalidasi tanda tangan elektronik.')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Surat Jalan PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
