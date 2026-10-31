import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Scale,
  MapPin,
  Phone,
  FileText,
  User,
  X,
  Save,
  Check
} from 'lucide-react';

interface ShipmentManualItem {
  id: string;
  doNumber: string;
  orderNumber: string;
  truckPlate: string;
  driverName: string;
  driverPhone: string;
  originYard: string;
  destinationFactory: string;
  commodity: string;
  estWeightMT: number;
  status:
    | 'JADWAL_MUAT'
    | 'TIBA_DI_DEPO'
    | 'SEDANG_MUAT'
    | 'IN_TRANSIT'
    | 'TIBA_DI_GATE_PABRIK'
    | 'TIMBANG_GROSS'
    | 'BONGKAR_SELESAI'
    | 'TIMBANG_TARE'
    | 'PENGIRIMAN_SELESAI';
  grossWeightKg?: number;
  tareWeightKg?: number;
  nettoWeightKg?: number;
  weighTicketNumber?: string;
  updatedAt: string;
}

const INITIAL_SHIPMENTS: ShipmentManualItem[] = [
  {
    id: 'SHP-001',
    doNumber: 'DO-TRZ-2026-0881',
    orderNumber: 'TRZ-PO-882103',
    truckPlate: 'B 9812 UIX (Trailer 40ft)',
    driverName: 'Kuswanto',
    driverPhone: '0812-4411-9988',
    originYard: 'Depo Logam Metalindo Surabaya',
    destinationFactory: 'PT Cilegon Precision Steel (Gate 2)',
    commodity: 'Scrap Besi Baja HMS 1/2',
    estWeightMT: 25,
    status: 'TIMBANG_GROSS',
    grossWeightKg: 42800,
    tareWeightKg: 18000,
    nettoWeightKg: 24800,
    weighTicketNumber: 'WB-CLG-88192',
    updatedAt: 'Hari ini, 10:15 WIB',
  },
  {
    id: 'SHP-002',
    doNumber: 'DO-TRZ-2026-0880',
    orderNumber: 'TRZ-PO-771029',
    truckPlate: 'L 8820 QP (Engkel Box)',
    driverName: 'Slamet Riyadi',
    driverPhone: '0813-9900-1122',
    originYard: 'CV Tembaga Raya Abadi Semarang',
    destinationFactory: 'PT Surya Metal Tembaga Surabaya',
    commodity: 'Tembaga Millberry Kawat',
    estWeightMT: 5,
    status: 'PENGIRIMAN_SELESAI',
    grossWeightKg: 11200,
    tareWeightKg: 6200,
    nettoWeightKg: 5000,
    weighTicketNumber: 'WB-SBY-77102',
    updatedAt: 'Kemarin, 16:30 WIB',
  },
  {
    id: 'SHP-003',
    doNumber: 'DO-TRZ-2026-0882',
    orderNumber: 'TRZ-PO-661920',
    truckPlate: 'B 9201 TK (Tronton Bak Terbuka)',
    driverName: 'Asep Suparman',
    driverPhone: '0815-6677-8899',
    originYard: 'Lapak Scrap Aluminium Nusantara Bekasi',
    destinationFactory: 'PT Mandiri Daur Aluminium Semarang',
    commodity: 'Aluminium Profil 6063 Scrap',
    estWeightMT: 15,
    status: 'IN_TRANSIT',
    updatedAt: 'Hari ini, 07:00 WIB',
  },
];

const SHIPMENT_STATUSES: Record<string, { label: string; step: number; color: string }> = {
  JADWAL_MUAT: { label: '1. Menunggu Jadwal Muat', step: 1, color: 'bg-slate-100 text-slate-800 border-slate-300' },
  TIBA_DI_DEPO: { label: '2. Truk Tiba di Depo Penjual', step: 2, color: 'bg-blue-50 text-blue-800 border-blue-200' },
  SEDANG_MUAT: { label: '3. Sedang Memuat Scrap', step: 3, color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  IN_TRANSIT: { label: '4. Dalam Perjalanan (In Transit)', step: 4, color: 'bg-amber-50 text-amber-800 border-amber-200' },
  TIBA_DI_GATE_PABRIK: { label: '5. Tiba di Gate Pabrik', step: 5, color: 'bg-teal-50 text-teal-800 border-teal-200' },
  TIMBANG_GROSS: { label: '6. Timbang Gross (Bruto)', step: 6, color: 'bg-purple-50 text-purple-800 border-purple-200' },
  BONGKAR_SELESAI: { label: '7. Bongkar Muatan Selesai', step: 7, color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  TIMBANG_TARE: { label: '8. Timbang Tare & Hitung Netto', step: 8, color: 'bg-orange-50 text-orange-800 border-orange-200' },
  PENGIRIMAN_SELESAI: { label: '9. Pengiriman Selesai (Delivered)', step: 9, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
};

export const AdminPengirimanManual: React.FC = () => {
  const { showToast } = useApp();
  const [shipments, setShipments] = useState<ShipmentManualItem[]>(INITIAL_SHIPMENTS);
  const [search, setSearch] = useState('');

  // Modal Input Timbang Manual
  const [weighModalOpen, setWeighModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentManualItem | null>(null);
  const [grossInput, setGrossInput] = useState<number>(42800);
  const [tareInput, setTareInput] = useState<number>(18000);
  const [ticketInput, setTicketInput] = useState<string>('WB-MANUAL-001');

  // Modal Tambah Surat Jalan Manual
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState('TRZ-PO-551029');
  const [truckPlate, setTruckPlate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [originYard, setOriginYard] = useState('');
  const [destinationFactory, setDestinationFactory] = useState('');
  const [commodity, setCommodity] = useState('Scrap Besi Baja HMS 1/2');
  const [estWeightMT, setEstWeightMT] = useState<number>(25);

  const filteredShipments = shipments.filter((s) => {
    return (
      s.doNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.truckPlate.toLowerCase().includes(search.toLowerCase()) ||
      s.driverName.toLowerCase().includes(search.toLowerCase()) ||
      s.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.destinationFactory.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleUpdateStatus = (id: string, newStatus: ShipmentManualItem['status']) => {
    setShipments(
      shipments.map((s) => {
        if (s.id === id) {
          showToast(`Status pengiriman ${s.doNumber} diubah ke: ${SHIPMENT_STATUSES[newStatus].label}`);
          return {
            ...s,
            status: newStatus,
            updatedAt: 'Baru saja diupdate manual',
          };
        }
        return s;
      })
    );
  };

  const openWeighModal = (s: ShipmentManualItem) => {
    setSelectedShipment(s);
    setGrossInput(s.grossWeightKg || 40000);
    setTareInput(s.tareWeightKg || 15000);
    setTicketInput(s.weighTicketNumber || `WB-${Math.floor(10000 + Math.random() * 90000)}`);
    setWeighModalOpen(true);
  };

  const handleSaveWeigh = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;
    const netto = Math.max(0, grossInput - tareInput);
    setShipments(
      shipments.map((s) =>
        s.id === selectedShipment.id
          ? {
              ...s,
              grossWeightKg: grossInput,
              tareWeightKg: tareInput,
              nettoWeightKg: netto,
              weighTicketNumber: ticketInput,
              status: 'PENGIRIMAN_SELESAI',
              updatedAt: 'Timbang netto tercatat: ' + (netto / 1000).toFixed(2) + ' MT',
            }
          : s
      )
    );
    showToast(`Data timbangan tiket ${ticketInput} berhasil disimpan. Netto: ${(netto / 1000).toFixed(2)} MT.`);
    setWeighModalOpen(false);
  };

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    const newDo: ShipmentManualItem = {
      id: `SHP-00${shipments.length + 1}`,
      doNumber: `DO-TRZ-2026-088${shipments.length + 1}`,
      orderNumber,
      truckPlate,
      driverName,
      driverPhone,
      originYard,
      destinationFactory,
      commodity,
      estWeightMT,
      status: 'JADWAL_MUAT',
      updatedAt: 'Baru dibuat',
    };
    setShipments([newDo, ...shipments]);
    showToast(`Surat jalan pengiriman manual ${newDo.doNumber} berhasil diterbitkan.`);
    setCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Truck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Manage Status Pengiriman (Manual)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pembaruan manual rute armada truk, plat nomor, supir, status perjalanan, dan pencatatan hasil timbangan metrologi
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Surat Jalan Pengiriman Manual</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari no. DO, plat truk, supir, PO..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
          />
        </div>
        <div className="text-xs text-slate-500">
          Total Armada Beroperasi: <strong>{shipments.length} Pengiriman</strong>
        </div>
      </div>

      {/* Shipment Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredShipments.map((s) => (
          <div
            key={s.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{s.doNumber}</span>
                    <span className="text-[11px] text-slate-500 font-mono">PO: {s.orderNumber}</span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    {s.commodity} · Estimasi: <strong>{s.estWeightMT} MT</strong>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    SHIPMENT_STATUSES[s.status].color
                  }`}
                >
                  {SHIPMENT_STATUSES[s.status].label}
                </span>
              </div>
            </div>

            {/* Truck & Driver Info */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Armada & Supir:</div>
                <div className="font-mono font-bold text-slate-900 mt-0.5">{s.truckPlate}</div>
                <div className="text-slate-600 mt-0.5">{s.driverName} ({s.driverPhone})</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Depo Asal Muat:</div>
                <div className="font-semibold text-slate-900 mt-0.5">{s.originYard}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Pabrik Tujuan:</div>
                <div className="font-semibold text-emerald-800 mt-0.5">{s.destinationFactory}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Hasil Timbang Netto:</div>
                {s.nettoWeightKg ? (
                  <div className="font-mono font-black text-slate-900 mt-0.5 text-sm">
                    {(s.nettoWeightKg / 1000).toFixed(2)} MT
                    <span className="text-[10px] font-normal text-slate-500 block">
                      Tiket: {s.weighTicketNumber}
                    </span>
                  </div>
                ) : (
                  <div className="text-slate-400 mt-0.5 italic">Belum ditimbang</div>
                )}
              </div>
            </div>

            {/* Manual Controls for Superadmin */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Update Status Pengiriman (Manual):</span>
                <select
                  value={s.status}
                  onChange={(e) => handleUpdateStatus(s.id, e.target.value as any)}
                  className="text-xs p-1.5 border border-slate-300 rounded-lg bg-white font-bold text-slate-900 focus:outline-hidden"
                >
                  <option value="JADWAL_MUAT">1. Menunggu Jadwal Muat</option>
                  <option value="TIBA_DI_DEPO">2. Truk Tiba di Depo Penjual</option>
                  <option value="SEDANG_MUAT">3. Sedang Memuat Scrap</option>
                  <option value="IN_TRANSIT">4. Dalam Perjalanan (In Transit)</option>
                  <option value="TIBA_DI_GATE_PABRIK">5. Tiba di Gate Pabrik</option>
                  <option value="TIMBANG_GROSS">6. Timbang Gross (Bruto)</option>
                  <option value="BONGKAR_SELESAI">7. Bongkar Muatan Selesai</option>
                  <option value="TIMBANG_TARE">8. Timbang Tare & Cetak Netto</option>
                  <option value="PENGIRIMAN_SELESAI">9. Pengiriman Selesai (Delivered)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openWeighModal(s)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Scale className="w-3.5 h-3.5 text-slate-600" />
                  <span>Input / Edit Timbangan Manual</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Input Timbangan Metrologi Manual */}
      {weighModalOpen && selectedShipment && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Input Timbangan Manual ({selectedShipment.doNumber})
                </h3>
              </div>
              <button
                onClick={() => setWeighModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWeigh} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nomor Tiket Timbang Jembatan *
                </label>
                <input
                  type="text"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  required
                  placeholder="cth. WB-CLG-88192"
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Berat Gross / Bruto (kg) *
                  </label>
                  <input
                    type="number"
                    value={grossInput}
                    onChange={(e) => setGrossInput(Number(e.target.value))}
                    required
                    placeholder="42800"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400">Truk + muatan scrap</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Berat Tare / Kosong (kg) *
                  </label>
                  <input
                    type="number"
                    value={tareInput}
                    onChange={(e) => setTareInput(Number(e.target.value))}
                    required
                    placeholder="18000"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400">Berat truk kosong</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                <span className="text-emerald-800 font-bold">Hasil Berat Bersih (Netto):</span>
                <span className="font-mono font-black text-emerald-950 text-base">
                  {((Math.max(0, grossInput - tareInput)) / 1000).toFixed(2)} MT ({Math.max(0, grossInput - tareInput)} kg)
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setWeighModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Hasil Timbang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Surat Jalan Manual */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Terbitkan Surat Jalan Pengiriman Manual Baru
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor PO Transaksi *</label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    required
                    placeholder="TRZ-PO-882103"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimasi Muatan (MT) *</label>
                  <input
                    type="number"
                    value={estWeightMT}
                    onChange={(e) => setEstWeightMT(Number(e.target.value))}
                    required
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plat Nomor Truk *</label>
                  <input
                    type="text"
                    value={truckPlate}
                    onChange={(e) => setTruckPlate(e.target.value)}
                    required
                    placeholder="cth. B 9812 UIX (Tronton)"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Supir & HP *</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    required
                    placeholder="Kuswanto (0812-xxxx)"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Komoditas Scrap *</label>
                <input
                  type="text"
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  required
                  placeholder="cth. Scrap Besi Baja HMS 1/2"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Depo Asal Muat *</label>
                <input
                  type="text"
                  value={originYard}
                  onChange={(e) => setOriginYard(e.target.value)}
                  required
                  placeholder="Depo Logam Metalindo Surabaya"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pabrik Penerima / Gate Tujuan *</label>
                <input
                  type="text"
                  value={destinationFactory}
                  onChange={(e) => setDestinationFactory(e.target.value)}
                  required
                  placeholder="PT Cilegon Precision Steel (Gate 2)"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Terbitkan Surat Jalan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
