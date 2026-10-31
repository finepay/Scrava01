import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  X,
  Save,
  Scale
} from 'lucide-react';

interface BuyerItem {
  id: string;
  companyName: string;
  picName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  businessType: string;
  consumptionMT: number;
  legalStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  weighbridgeCapacity: string;
  activeContracts: number;
}

const INITIAL_BUYERS: BuyerItem[] = [
  {
    id: 'PABRIK-01',
    companyName: 'PT Cilegon Precision Steel',
    picName: 'Ir. Bambang Sugiarto',
    phone: '0812-3456-7890',
    email: 'procurement@cilegonsteel.co.id',
    city: 'Cilegon, Banten',
    address: 'Kawasan Industri Krakatau Steel Kav. D-4, Cilegon',
    businessType: 'Pabrik Peleburan / Smelter Baja',
    consumptionMT: 3500,
    legalStatus: 'VERIFIED',
    weighbridgeCapacity: '80 Ton (Tera Metrologi)',
    activeContracts: 6,
  },
  {
    id: 'PABRIK-02',
    companyName: 'PT Surya Metal Tembaga Utama',
    picName: 'H. Suryadi Pratama',
    phone: '0813-8821-4455',
    email: 'purchasing@suryametal.com',
    city: 'Surabaya, Jawa Timur',
    address: 'Kawasan Industri SIER Blok M-18, Surabaya',
    businessType: 'Smelter & Peleburan Tembaga',
    consumptionMT: 1200,
    legalStatus: 'VERIFIED',
    weighbridgeCapacity: '60 Ton (Tera Metrologi)',
    activeContracts: 4,
  },
  {
    id: 'PABRIK-03',
    companyName: 'PT Mandiri Daur Aluminium',
    picName: 'David Tanuwidjaja',
    phone: '0811-2233-4455',
    email: 'pengadaan@mandirialum.co.id',
    city: 'Semarang, Jawa Tengah',
    address: 'Kawasan Berikat Tanjung Emas Kav. 12',
    businessType: 'Peleburan Aluminium & Remelting',
    consumptionMT: 1800,
    legalStatus: 'PENDING',
    weighbridgeCapacity: '80 Ton (Dalam Kalibrasi)',
    activeContracts: 1,
  },
  {
    id: 'PABRIK-04',
    companyName: 'PT Indo Pelletizer Plastik Gemilang',
    picName: 'Liana Anggraeni',
    phone: '0815-9900-1122',
    email: 'procurement@indopelletizer.com',
    city: 'Karawang, Jawa Barat',
    address: 'Kawasan Industri KIIC Karawang Lot 2-A',
    businessType: 'Daur Ulang Plastik Industri',
    consumptionMT: 850,
    legalStatus: 'VERIFIED',
    weighbridgeCapacity: '50 Ton (Tera Metrologi)',
    activeContracts: 3,
  },
];

export const AdminPembeliManager: React.FC = () => {
  const { showToast } = useApp();
  const [buyers, setBuyers] = useState<BuyerItem[]>(INITIAL_BUYERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [picName, setPicName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [businessType, setBusinessType] = useState('Pabrik Peleburan / Smelter Baja');
  const [consumptionMT, setConsumptionMT] = useState<number>(2000);
  const [legalStatus, setLegalStatus] = useState<'VERIFIED' | 'PENDING' | 'REJECTED'>('VERIFIED');
  const [weighbridgeCapacity, setWeighbridgeCapacity] = useState('80 Ton (Tera Metrologi)');

  const filteredBuyers = buyers.filter((b) => {
    const matchSearch =
      b.companyName.toLowerCase().includes(search.toLowerCase()) ||
      b.picName.toLowerCase().includes(search.toLowerCase()) ||
      b.city.toLowerCase().includes(search.toLowerCase()) ||
      b.businessType.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || b.legalStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId('');
    setCompanyName('');
    setPicName('');
    setPhone('');
    setEmail('');
    setCity('Cilegon, Banten');
    setAddress('');
    setBusinessType('Pabrik Peleburan / Smelter Baja');
    setConsumptionMT(2000);
    setLegalStatus('VERIFIED');
    setWeighbridgeCapacity('80 Ton (Tera Metrologi)');
    setModalOpen(true);
  };

  const openEditModal = (b: BuyerItem) => {
    setIsEditing(true);
    setCurrentId(b.id);
    setCompanyName(b.companyName);
    setPicName(b.picName);
    setPhone(b.phone);
    setEmail(b.email);
    setCity(b.city);
    setAddress(b.address);
    setBusinessType(b.businessType);
    setConsumptionMT(b.consumptionMT);
    setLegalStatus(b.legalStatus);
    setWeighbridgeCapacity(b.weighbridgeCapacity);
    setModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data pabrik ${name}?`)) {
      setBuyers(buyers.filter((b) => b.id !== id));
      showToast(`Pabrik ${name} berhasil dihapus dari sistem.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      setBuyers(
        buyers.map((b) =>
          b.id === currentId
            ? {
                ...b,
                companyName,
                picName,
                phone,
                email,
                city,
                address,
                businessType,
                consumptionMT,
                legalStatus,
                weighbridgeCapacity,
              }
            : b
        )
      );
      showToast(`Data pembeli pabrik ${companyName} berhasil diperbarui.`);
    } else {
      const newBuyer: BuyerItem = {
        id: `PABRIK-0${buyers.length + 1}`,
        companyName,
        picName,
        phone,
        email,
        city,
        address,
        businessType,
        consumptionMT,
        legalStatus,
        weighbridgeCapacity,
        activeContracts: 0,
      };
      setBuyers([newBuyer, ...buyers]);
      showToast(`Akun pembeli pabrik baru ${companyName} berhasil dibuat.`);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Manage Pembeli (Pabrik / Smelter)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data pabrik manufaktur, PIC pengadaan, konsumsi scrap bulanan, dan jembatan timbang
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pembeli Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pabrik, PIC, kota, industri..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500">Filter Status:</span>
          {(['ALL', 'VERIFIED', 'PENDING'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'Semua' : st === 'VERIFIED' ? 'Terverifikasi' : 'Pending Review'}
            </button>
          ))}
        </div>
      </div>

      {/* Table CRUD Pembeli */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3.5">ID & Nama PT Pabrik</th>
                <th className="p-3.5">PIC Pengadaan & Kontak</th>
                <th className="p-3.5">Lokasi Fasilitas</th>
                <th className="p-3.5">Bidang Industri</th>
                <th className="p-3.5 text-center">Konsumsi (MT/Bln)</th>
                <th className="p-3.5 text-center">Jembatan Timbang</th>
                <th className="p-3.5 text-center">Legalitas</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredBuyers.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span>{item.companyName}</span>
                      {item.legalStatus === 'VERIFIED' && (
                        <span title="Legalitas Terverifikasi">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.id}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-900">{item.picName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{item.phone}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1 text-slate-900">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.city}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-xs">{item.address}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium text-[11px]">
                      {item.businessType}
                    </span>
                  </td>
                  <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                    {item.consumptionMT} MT
                  </td>
                  <td className="p-3.5 text-center text-slate-600 font-mono text-[11px]">
                    {item.weighbridgeCapacity}
                  </td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.legalStatus === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {item.legalStatus === 'VERIFIED' ? 'Terverifikasi' : 'Menunggu Review'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit Pembeli"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.companyName)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Pembeli"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create / Edit Pembeli */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit Data Pembeli Pabrik' : 'Tambah Pembeli Pabrik Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Resmi Perusahaan (PT/CV) *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    placeholder="cth. PT Cilegon Precision Steel"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama PIC Pengadaan *</label>
                  <input
                    type="text"
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    required
                    placeholder="cth. Ir. Bambang Sugiarto"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. WhatsApp PIC *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="0812-xxxx-xxxx"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Pengadaan *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="procurement@pabrik.com"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kota Fasilitas Smelter *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    placeholder="Cilegon, Banten"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bidang Industri *</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-emerald-600"
                  >
                    <option value="Pabrik Peleburan / Smelter Baja">Pabrik Peleburan / Smelter Baja</option>
                    <option value="Smelter & Peleburan Tembaga">Smelter & Peleburan Tembaga</option>
                    <option value="Peleburan Aluminium & Remelting">Peleburan Aluminium & Remelting</option>
                    <option value="Pabrik Daur Ulang Plastik (Pelletizer)">Pabrik Daur Ulang Plastik (Pelletizer)</option>
                    <option value="Pabrik Kertas & Pulp Paper">Pabrik Kertas & Pulp Paper</option>
                    <option value="Pengecoran Logam & Foundry">Pengecoran Logam & Foundry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Fasilitas Pabrik *</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  required
                  placeholder="Kawasan Industri Krakatau Steel Kav. D-4, Cilegon, Banten"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Konsumsi (MT/Bln)</label>
                  <input
                    type="number"
                    value={consumptionMT}
                    onChange={(e) => setConsumptionMT(Number(e.target.value))}
                    min="1"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jembatan Timbang</label>
                  <input
                    type="text"
                    value={weighbridgeCapacity}
                    onChange={(e) => setWeighbridgeCapacity(e.target.value)}
                    placeholder="80 Ton (Tera Metrologi)"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Legalitas</label>
                  <select
                    value={legalStatus}
                    onChange={(e) => setLegalStatus(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    <option value="VERIFIED">Terverifikasi</option>
                    <option value="PENDING">Pending Review</option>
                    <option value="REJECTED">Ditolak</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Simpan Perubahan' : 'Terbitkan Akun Pabrik'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
