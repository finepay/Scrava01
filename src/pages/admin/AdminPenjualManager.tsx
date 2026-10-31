import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Scale,
  X,
  ShieldCheck,
  Building,
  Building2,
  Save,
  Truck,
  Check
} from 'lucide-react';

interface CustomerItem {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  mainCategory: string;
  capacityMT: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  hasWeighbridge: boolean;
  totalTransactions: number;
  totalVolumeMT: number;
  // Customer 2-role attributes
  isBuyerVerified: boolean;
  buyerCompanyName?: string;
  nib?: string;
  npwp?: string;
}

const INITIAL_CUSTOMERS: CustomerItem[] = [
  {
    id: 'CUST-001',
    name: 'Depo Logam Metalindo Jaya',
    ownerName: 'H. Hendra Wijaya',
    phone: '0812-8822-1100',
    email: 'depo.metalindo@gmail.com',
    city: 'Surabaya, Jawa Timur',
    address: 'Jl. Rungkut Industri No. 45, Surabaya',
    mainCategory: 'Ferrous Metals (Besi HMS 1/2)',
    capacityMT: 800,
    status: 'ACTIVE',
    hasWeighbridge: true,
    totalTransactions: 48,
    totalVolumeMT: 1250,
    isBuyerVerified: false, // Default Penjual
  },
  {
    id: 'CUST-002',
    name: 'PT Cilegon Precision Steel',
    ownerName: 'Ir. Hendra Wijaya (Procurement Head)',
    phone: '0812-9876-5432',
    email: 'pengadaan@cilegonsteel.co.id',
    city: 'Cilegon, Banten',
    address: 'Kawasan Industri Krakatau Steel Pos 5',
    mainCategory: 'Smelter & Peleburan Baja Induksi',
    capacityMT: 10000,
    status: 'ACTIVE',
    hasWeighbridge: true,
    totalTransactions: 94,
    totalVolumeMT: 4200,
    isBuyerVerified: true, // Terverifikasi Pembeli
    buyerCompanyName: 'PT Cilegon Precision Steel',
    nib: '0220001234567',
    npwp: '01.992.112.8-041.000',
  },
  {
    id: 'CUST-003',
    name: 'CV Tembaga Raya Abadi',
    ownerName: 'Sugeng Pranoto',
    phone: '0813-7722-9900',
    email: 'tembaga.raya@yahoo.com',
    city: 'Semarang, Jawa Tengah',
    address: 'Kawasan Depo Logam Genuk Kav. 8, Semarang',
    mainCategory: 'Copper (Tembaga Millberry / Bare)',
    capacityMT: 250,
    status: 'ACTIVE',
    hasWeighbridge: true,
    totalTransactions: 32,
    totalVolumeMT: 420,
    isBuyerVerified: false,
  },
  {
    id: 'CUST-004',
    name: 'PT Indo Pelletizer Gemilang',
    ownerName: 'Bambang Sutanto',
    phone: '0811-9988-7711',
    email: 'bambang.plastik@gemilang.co.id',
    city: 'Karawang, Jawa Barat',
    address: 'Kawasan Industri KIIC Blok C-4',
    mainCategory: 'Pabrik Daur Ulang Plastik Pellet',
    capacityMT: 2000,
    status: 'ACTIVE',
    hasWeighbridge: true,
    totalTransactions: 28,
    totalVolumeMT: 850,
    isBuyerVerified: true,
    buyerCompanyName: 'PT Indo Pelletizer Gemilang',
    nib: '9120008819201',
    npwp: '02.441.992.4-503.000',
  },
  {
    id: 'CUST-005',
    name: 'Lapak Scrap Aluminium Nusantara',
    ownerName: 'M. Arifin',
    phone: '0819-0123-4567',
    email: 'arifin.scrap@gmail.com',
    city: 'Bekasi, Jawa Barat',
    address: 'Sentra Daur Ulang Bantargebang KM 11, Bekasi',
    mainCategory: 'Aluminum (Profil 6063 & Tembus)',
    capacityMT: 400,
    status: 'ACTIVE',
    hasWeighbridge: false,
    totalTransactions: 19,
    totalVolumeMT: 310,
    isBuyerVerified: false,
  },
];

export const AdminPenjualManager: React.FC = () => {
  const { showToast } = useApp();
  const [customers, setCustomers] = useState<CustomerItem[]>(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [buyerFilter, setBuyerFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL');

  // Modal State (Create / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [mainCategory, setMainCategory] = useState('Ferrous Metals (Besi HMS 1/2)');
  const [capacityMT, setCapacityMT] = useState<number>(500);
  const [status, setStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [hasWeighbridge, setHasWeighbridge] = useState(true);
  const [isBuyerVerified, setIsBuyerVerified] = useState(false);
  const [buyerCompanyName, setBuyerCompanyName] = useState('');
  const [nib, setNib] = useState('');
  const [npwp, setNpwp] = useState('');

  const filteredCustomers = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.mainCategory.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchBuyer =
      buyerFilter === 'ALL' ||
      (buyerFilter === 'VERIFIED' && c.isBuyerVerified) ||
      (buyerFilter === 'UNVERIFIED' && !c.isBuyerVerified);
    return matchSearch && matchStatus && matchBuyer;
  });

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId('');
    setName('');
    setOwnerName('');
    setPhone('');
    setEmail('');
    setCity('Surabaya, Jawa Timur');
    setAddress('');
    setMainCategory('Ferrous Metals (Besi HMS 1/2)');
    setCapacityMT(500);
    setStatus('ACTIVE');
    setHasWeighbridge(true);
    setIsBuyerVerified(false);
    setBuyerCompanyName('');
    setNib('');
    setNpwp('');
    setModalOpen(true);
  };

  const openEditModal = (c: CustomerItem) => {
    setIsEditing(true);
    setCurrentId(c.id);
    setName(c.name);
    setOwnerName(c.ownerName);
    setPhone(c.phone);
    setEmail(c.email);
    setCity(c.city);
    setAddress(c.address);
    setMainCategory(c.mainCategory);
    setCapacityMT(c.capacityMT);
    setStatus(c.status as 'ACTIVE' | 'SUSPENDED');
    setHasWeighbridge(c.hasWeighbridge);
    setIsBuyerVerified(c.isBuyerVerified);
    setBuyerCompanyName(c.buyerCompanyName || '');
    setNib(c.nib || '');
    setNpwp(c.npwp || '');
    setModalOpen(true);
  };

  const handleDelete = (id: string, sName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus customer ${sName}?`)) {
      setCustomers(customers.filter((c) => c.id !== id));
      showToast(`Customer ${sName} berhasil dihapus dari sistem.`);
    }
  };

  const toggleBuyerStatus = (id: string) => {
    setCustomers(
      customers.map((c) => {
        if (c.id === id) {
          const next = !c.isBuyerVerified;
          showToast(
            next
              ? `Akses Pembeli untuk ${c.name} telah DISETUJUI & AKTIF.`
              : `Akses Pembeli untuk ${c.name} dicabut (kembali ke default Penjual).`
          );
          return {
            ...c,
            isBuyerVerified: next,
            buyerCompanyName: next ? c.name : undefined,
            nib: next ? '0220001234567' : undefined,
            npwp: next ? '01.992.112.8-041.000' : undefined,
          };
        }
        return c;
      })
    );
  };

  const toggleStatus = (id: string) => {
    setCustomers(
      customers.map((c) => {
        if (c.id === id) {
          const next = c.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          showToast(`Status akun ${c.name} diubah menjadi ${next}`);
          return { ...c, status: next };
        }
        return c;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      setCustomers(
        customers.map((c) =>
          c.id === currentId
            ? {
                ...c,
                name,
                ownerName,
                phone,
                email,
                city,
                address,
                mainCategory,
                capacityMT,
                status,
                hasWeighbridge,
                isBuyerVerified,
                buyerCompanyName: isBuyerVerified ? (buyerCompanyName || name) : undefined,
                nib: isBuyerVerified ? nib : undefined,
                npwp: isBuyerVerified ? npwp : undefined,
              }
            : c
        )
      );
      showToast(`Data customer ${name} berhasil diperbarui.`);
    } else {
      const newCustomer: CustomerItem = {
        id: `CUST-00${customers.length + 1}`,
        name,
        ownerName,
        phone,
        email,
        city,
        address,
        mainCategory,
        capacityMT,
        status,
        hasWeighbridge,
        totalTransactions: 0,
        totalVolumeMT: 0,
        isBuyerVerified,
        buyerCompanyName: isBuyerVerified ? buyerCompanyName : undefined,
        nib: isBuyerVerified ? nib : undefined,
        npwp: isBuyerVerified ? npwp : undefined,
      };
      setCustomers([newCustomer, ...customers]);
      showToast(`Customer baru ${name} berhasil ditambahkan.`);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-purple-100 text-purple-700">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider font-mono">
              Database Customer Bursa (Penjual & Pembeli)
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Manajemen Data Customer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola seluruh customer bursa. Default pendaftaran adalah <strong>Penjual (Depo/Pengepul)</strong>, status <strong>Pembeli (Pabrik)</strong> aktif setelah verifikasi legalitas (NIB & NPWP).
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 text-xs font-bold text-white bg-purple-900 hover:bg-purple-800 rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Customer Baru</span>
        </button>
      </div>

      {/* Stats Quick Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-500">Total Customer Terdaftar</div>
          <div className="text-lg font-black text-slate-900 mt-1">{customers.length} Entitas</div>
          <div className="text-[10px] text-emerald-700 font-semibold">100% Penjual Aktif</div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-500">Pembeli Terverifikasi (Pabrik)</div>
          <div className="text-lg font-black text-emerald-700 mt-1">
            {customers.filter((c) => c.isBuyerVerified).length} Pabrik
          </div>
          <div className="text-[10px] text-slate-500">Legalitas NIB & NPWP lengkap</div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-500">Belum Verifikasi Pembeli</div>
          <div className="text-lg font-black text-amber-600 mt-1">
            {customers.filter((c) => !c.isBuyerVerified).length} Pengepul
          </div>
          <div className="text-[10px] text-slate-500">Default penjual aktif</div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-500">Fasilitas Jembatan Timbang</div>
          <div className="text-lg font-black text-blue-700 mt-1">
            {customers.filter((c) => c.hasWeighbridge).length} Yard
          </div>
          <div className="text-[10px] text-slate-500">Tera metrologi legal</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama depo, PT/CV, PIC, atau kota..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-purple-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Filter Akses Beli */}
          <select
            value={buyerFilter}
            onChange={(e) => setBuyerFilter(e.target.value as any)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
          >
            <option value="ALL">Semua Akses Pembeli</option>
            <option value="VERIFIED">Pembeli Terverifikasi (Pabrik)</option>
            <option value="UNVERIFIED">Belum Legalitas (Hanya Penjual)</option>
          </select>

          {/* Filter Status Akun */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
          >
            <option value="ALL">Semua Status Akun</option>
            <option value="ACTIVE">Aktif</option>
            <option value="SUSPENDED">Ditangguhkan</option>
          </select>
        </div>
      </div>

      {/* Table Customer */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">ID & Nama Customer</th>
                <th className="py-3 px-3">PIC & Kontak</th>
                <th className="py-3 px-3">Lokasi Yard / Pabrik</th>
                <th className="py-3 px-3">Kategori Komoditas</th>
                <th className="py-3 px-3">Akses Penjual</th>
                <th className="py-3 px-3">Akses Pembeli</th>
                <th className="py-3 px-3">Status Akun</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{c.name}</div>
                    <div className="font-mono text-[10px] text-slate-400">{c.id}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">{c.ownerName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{c.phone}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-slate-800 font-medium">{c.city}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{c.address}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {c.mainCategory}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Aktif (Default)</span>
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {c.isBuyerVerified ? (
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Terverifikasi</span>
                        </span>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">NIB: {c.nib || 'Lengkap'}</div>
                      </div>
                    ) : (
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>Belum Lengkap</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleBuyerStatus(c.id)}
                          className="block text-[10px] font-bold text-purple-700 hover:text-purple-900 hover:underline mt-0.5"
                          title="Setujui verifikasi legalitas pembeli"
                        >
                          + Setujui Legalitas
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => toggleStatus(c.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                        c.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {c.status}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                        title="Edit Data Customer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                        title="Hapus Customer"
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

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {isEditing ? `Edit Customer (${currentId})` : 'Tambah Customer Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Depo / Lapak / Usaha *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="cth. Depo Logam Metalindo Jaya"
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Pemilik / PIC *
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="cth. Hendra Wijaya"
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / Telp *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Akun
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="depo@email.com"
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kota / Wilayah *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Surabaya, Jawa Timur"
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kapasitas Yard (MT)
                  </label>
                  <input
                    type="number"
                    value={capacityMT}
                    onChange={(e) => setCapacityMT(Number(e.target.value))}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Lengkap Yard / Depo
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jalan, Blok, Kawasan Industri"
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              {/* Status Akses Pembeli (Legalitas) */}
              <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-950">Akses Pembeli (Pabrik / Smelter)</span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isBuyerVerified}
                      onChange={(e) => setIsBuyerVerified(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Terverifikasi Legal</span>
                  </label>
                </div>

                {isBuyerVerified && (
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">Nomor NIB</label>
                      <input
                        type="text"
                        value={nib}
                        onChange={(e) => setNib(e.target.value)}
                        placeholder="13-digit NIB"
                        className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">NPWP Perusahaan</label>
                      <input
                        type="text"
                        value={npwp}
                        onChange={(e) => setNpwp(e.target.value)}
                        placeholder="01.xxx.xxx.x-xxx.000"
                        className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-900 hover:bg-purple-800 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Data Customer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
