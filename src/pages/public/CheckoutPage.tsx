import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Listing, IncotermType, Order } from '../../types';
import { UpgradeToFactoryModal } from '../../components/common/UpgradeToFactoryModal';
import {
  MapPin,
  Truck,
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  ShieldCheck,
  Scale,
  ArrowLeft,
  ChevronRight,
  Clock,
  Copy,
  Info,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

interface CheckoutPageProps {
  listingId?: string;
  navigate: (path: string, params?: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ listingId, navigate }) => {
  const { listings, formatPrice, currentCompany, isBuyerVerified, showToast, addOrder } = useApp();

  const listing: Listing = listings.find((l) => l.id === listingId) || listings[0];

  const [showLegalityModal, setShowLegalityModal] = useState(false);

  // Steps: 'address' -> 'shipping' -> 'payment' -> 'success'
  const [step, setStep] = useState<'address' | 'shipping' | 'payment' | 'success'>('address');

  // 1. Alamat Pengiriman / Destinasi Pabrik
  const [deliveryType, setDeliveryType] = useState<'existing' | 'new'>('existing');
  const [selectedAddress, setSelectedAddress] = useState({
    recipient: 'PT Cilegon Precision Steel (Logistics Gate 2)',
    pic: 'Ir. Hendra Wijaya (Procurement Head)',
    phone: '0812-9876-5432',
    address: 'Kawasan Industri Krakatau Pos 5, Jl. Industri Raya No. 12',
    city: 'Cilegon',
    province: 'Banten',
    postalCode: '42435',
    weighbridgeStation: 'Jembatan Timbang Metrologi Gate 2 (Max 60 MT)',
  });

  const [customAddress, setCustomAddress] = useState({
    recipient: '',
    pic: '',
    phone: '',
    address: '',
    city: 'Karawang',
    province: 'Jawa Barat',
    postalCode: '',
    weighbridgeStation: '',
  });

  // 2. Metode Pengiriman & Armada
  const [shippingMethod, setShippingMethod] = useState<'seller_fleet' | 'buyer_fleet' | 'scrava_logistics'>('scrava_logistics');
  const [fleetType, setFleetType] = useState<'tronton' | 'cdd' | 'wingbox'>('tronton');
  const [shippingSchedule, setShippingSchedule] = useState('2026-10-02');
  const [shippingNotes, setShippingNotes] = useState('Truk wajib uji jembatan timbang sebelum dan sesudah muat.');

  // Biaya pengiriman
  const shippingRates: Record<string, number> = {
    tronton: 3500000,
    cdd: 2200000,
    wingbox: 4200000,
  };
  const freightCost = shippingMethod === 'buyer_fleet' ? 0 : shippingRates[fleetType];
  const insuranceCost = 150000;
  const platformFee = Math.round(listing.totalPrice * 0.005); // 0.5% B2B Escrow fee
  const totalPayment = listing.totalPrice + freightCost + insuranceCost + platformFee;

  // 3. Metode Pembayaran (QRIS / Virtual Account / Transfer Bank Escrow)
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'va_bca' | 'va_mandiri' | 'va_bri' | 'bank_transfer'>('va_bca');
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string>('');

  // Selesaikan Order
  const handleProcessPayment = () => {
    if (!isBuyerVerified) {
      setShowLegalityModal(true);
      return;
    }

    const orderNum = `SCR-${Math.floor(100000 + Math.random() * 900000)}`;
    setCreatedOrderNumber(orderNum);

    const newOrderData: Partial<Order> = {
      orderNumber: orderNum,
      listingId: listing.id,
      productTitle: listing.title,
      productImage: listing.photos[0],
      category: listing.category,
      sellerCompany: listing.seller.companyName,
      sellerCountry: listing.seller.country,
      buyerCompany: currentCompany.name,
      buyerCountry: currentCompany.country,
      quantity: listing.quantity,
      unit: listing.unit,
      agreedPricePerUnit: listing.pricePerUnit,
      totalOriginalValue: totalPayment,
      currency: 'IDR',
      incoterm: listing.incoterm,
      status: 'PAYMENT_PENDING',
      paymentStatus: 'PENDING',
      pickupDetails: {
        scheduledDate: shippingSchedule,
        pickupAddress: `${selectedAddress.address}, ${selectedAddress.city}`,
        transporter: shippingMethod === 'buyer_fleet' ? 'Armada Sendiri Pembeli' : 'Mitra Logistik Resmi Scrava (Tronton)',
        vehiclePlate: 'B 9821 TZX / B 9102 UY',
        driverName: 'Bambang Sukirman (Terverifikasi SIM B2 Umum)',
        status: 'Scheduled',
      },
      weighbridge: {
        expectedWeight: listing.quantity,
        actualGrossWeight: 0,
        tareWeight: 0,
        actualNetWeight: 0,
        unit: listing.unit,
        difference: 0,
        ticketNumber: `WB-${orderNum}`,
        stationName: selectedAddress.weighbridgeStation,
        dateRecorded: 'Menunggu Muatan',
        isVerified: false,
      },
      qc: {
        inspector: 'PT Sucofindo (Persero) QC Lab',
        status: 'PENDING',
        notes: 'Sampling spektrometri dan uji kebersihan scrap dijadwalkan saat bongkar.',
        inspectionDate: 'Menunggu Kedatangan',
        samplePurityPercentage: 98,
      },
      settlement: {
        originalValue: totalPayment,
        actualWeight: listing.quantity,
        adjustedValue: totalPayment,
        platformFeeRate: 0.005,
        platformFee,
        taxRate: 0.11,
        taxes: 0,
        transportCost: freightCost,
        finalSellerPayout: listing.totalPrice,
        adjustmentDelta: 0,
        status: 'PENDING',
      },
    };

    addOrder(newOrderData);
    setStep('success');
    showToast(`Order ${orderNum} berhasil dibuat! Menunggu pembayaran Escrow.`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Top Breadcrumb & Step Tracker */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => {
            if (step === 'payment') setStep('shipping');
            else if (step === 'shipping') setStep('address');
            else navigate('listing-detail', { id: listing.id });
          }}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Detail Produk</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${step === 'address' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
            <span>1</span>
            <span>Alamat</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${step === 'shipping' ? 'bg-emerald-600 text-white' : step === 'payment' || step === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
            <span>2</span>
            <span>Pengiriman</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${step === 'payment' ? 'bg-emerald-600 text-white' : step === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
            <span>3</span>
            <span>Pembayaran</span>
          </div>
        </div>
      </div>

      {/* Unverified Buyer Warning Banner */}
      {!isBuyerVerified && step !== 'success' && (
        <div className="mb-6 bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 text-sm">Verifikasi Dokumen Legalitas Pembeli Diperlukan</span>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                Akun Customer Anda saat ini terdaftar dengan akses default <strong>Penjual (Depo Scrap)</strong>. Untuk menyelesaikan pembayaran checkout, menerbitkan nomor PO, dan proses timbang bayar, Anda wajib melengkapi data legalitas perusahaan (NIB & NPWP).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowLegalityModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors whitespace-nowrap shrink-0 shadow-xs flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Lengkapi Legalitas Pembeli</span>
          </button>
        </div>
      )}

      {step !== 'success' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Steps */}
          <div className="lg:col-span-8 space-y-6">
            {/* STEP 1: ALAMAT PENGIRIMAN / DESTINASI PABRIK */}
            {step === 'address' && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Alamat Pengiriman & Gerbang Pabrik</h2>
                      <p className="text-xs text-slate-500">Tentukan lokasi penerimaan material scrap dan pos jembatan timbang</p>
                    </div>
                  </div>
                </div>

                {/* Existing Saved Address Card */}
                <div
                  onClick={() => setDeliveryType('existing')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    deliveryType === 'existing'
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{selectedAddress.recipient}</span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded">
                          Alamat Utama
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1 font-medium">{selectedAddress.pic} · {selectedAddress.phone}</div>
                      <div className="text-xs text-slate-500 mt-1">{selectedAddress.address}, {selectedAddress.city}, {selectedAddress.province} {selectedAddress.postalCode}</div>
                      <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-white px-2.5 py-1 rounded border border-emerald-200">
                        <Scale className="w-3.5 h-3.5" />
                        <span>Fasilitas Timbangan: {selectedAddress.weighbridgeStation}</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      checked={deliveryType === 'existing'}
                      onChange={() => setDeliveryType('existing')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Or Custom / New Address */}
                <div
                  onClick={() => setDeliveryType('new')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    deliveryType === 'new'
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-900">+ Gunakan Alamat Gudang / Proyek Baru</span>
                    <input
                      type="radio"
                      checked={deliveryType === 'new'}
                      onChange={() => setDeliveryType('new')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>

                  {deliveryType === 'new' && (
                    <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                      <div>
                        <label className="block text-slate-600 mb-1 font-semibold">Nama Pabrik / Proyek</label>
                        <input
                          type="text"
                          placeholder="cth. PT Baja Nusantara Yard 3"
                          value={customAddress.recipient}
                          onChange={(e) => setCustomAddress({ ...customAddress, recipient: e.target.value })}
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1 font-semibold">PIC Lapangan & Telepon</label>
                        <input
                          type="text"
                          placeholder="cth. Pak Joko - 0811223344"
                          value={customAddress.pic}
                          onChange={(e) => setCustomAddress({ ...customAddress, pic: e.target.value })}
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-slate-600 mb-1 font-semibold">Alamat Lengkap</label>
                        <input
                          type="text"
                          placeholder="Jalan, Blok, Kawasan Industri..."
                          value={customAddress.address}
                          onChange={(e) => setCustomAddress({ ...customAddress, address: e.target.value })}
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setStep('shipping')}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Lanjut ke Metode Pengiriman</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: METODE PENGIRIMAN & ARMADA TRUK */}
            {step === 'shipping' && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Pilih Metode Pengiriman & Armada Truk</h2>
                      <p className="text-xs text-slate-500">Dilengkapi Surat Jalan Digital (QR Code Manifest) dan pelacakan timbang</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: 'scrava_logistics',
                      title: 'Armada Logistik Resmi Scrava (Rekomendasi)',
                      desc: 'Truk Tronton / Wingbox berizin khusus scrap dengan supir ber-SIM B2 dan segel QR code.',
                      badge: 'Termasuk Asuransi & Surat Jalan QR',
                      cost: freightCost,
                    },
                    {
                      id: 'seller_fleet',
                      title: 'Pengiriman oleh Penjual (Franco Pabrik)',
                      desc: 'Penjual menanggung pengiriman sampai di jembatan timbang gerbang pabrik Anda.',
                      badge: 'Franco Buyer',
                      cost: 2800000,
                    },
                    {
                      id: 'buyer_fleet',
                      title: 'Ambil Sendiri di Gudang Penjual (Loco / EXW)',
                      desc: 'Pembeli mengirim armada truk sendiri untuk mengambil material di lokasi depo penjual.',
                      badge: 'Gratis Biaya Kirim',
                      cost: 0,
                    },
                  ].map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setShippingMethod(m.id as any)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start justify-between ${
                        shippingMethod === m.id
                          ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{m.title}</span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded">
                            {m.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{m.desc}</p>
                        {m.id === 'scrava_logistics' && (
                          <div className="mt-2 flex items-center gap-2 pt-1">
                            <span className="text-[11px] text-slate-600 font-semibold">Pilih Tipe Truk:</span>
                            {(['tronton', 'cdd', 'wingbox'] as const).map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFleetType(t);
                                }}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors ${
                                  fleetType === t
                                    ? 'bg-emerald-700 text-white shadow-2xs'
                                    : 'bg-white border border-slate-300 text-slate-700'
                                }`}
                              >
                                {t === 'tronton' ? 'Tronton (20 MT)' : t === 'cdd' ? 'CDD (8 MT)' : 'Wingbox (25 MT)'}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0 ml-4">
                        <div className="text-xs font-mono font-bold text-slate-900">
                          {m.cost === 0 ? 'Rp 0 (Loco)' : formatPrice(m.cost)}
                        </div>
                        <input
                          type="radio"
                          checked={shippingMethod === m.id}
                          onChange={() => setShippingMethod(m.id as any)}
                          className="mt-2 text-emerald-600 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Jadwal & Instruksi Tambahan */}
                <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Rencana Tanggal Pengiriman</label>
                    <input
                      type="date"
                      value={shippingSchedule}
                      onChange={(e) => setShippingSchedule(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Catatan Tambahan untuk Supir</label>
                    <input
                      type="text"
                      value={shippingNotes}
                      onChange={(e) => setShippingNotes(e.target.value)}
                      placeholder="cth. Masuk gerbang barat pabrik..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    onClick={() => setStep('address')}
                    className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={() => setStep('payment')}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Lanjut ke Pembayaran Escrow</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: METODE PEMBAYARAN (QRIS / VIRTUAL ACCOUNT / TRANSFER BANK) */}
            {step === 'payment' && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Pilih Rekening Pembayaran Escrow</h2>
                      <p className="text-xs text-slate-500">Dana diamankan di bank kustodi resmi hingga timbang terima selesai</p>
                    </div>
                  </div>
                </div>

                {/* Trust Guarantee Strip */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-950">
                    <span className="font-bold">100% Proteksi Timbang Bayar Scrava Escrow:</span>
                    <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
                      Penjual tidak menerima pembayaran langsung. Dana Anda tetap tersimpan di rekening penampung aman sampai truk melewati jembatan timbang di pabrik dan lolos uji spektrometri QC.
                    </p>
                  </div>
                </div>

                {/* Payment Options Grid */}
                <div className="space-y-3">
                  {/* 1. QRIS Instan */}
                  <div
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      paymentMethod === 'qris'
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black">
                        <QrCode className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">QRIS Statis & Dinamis</span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded">
                            Verifikasi Instan Otomatis
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          BCA Mobile, Mandiri Livin, GoPay, OVO, ShopeePay, AstraPay
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      checked={paymentMethod === 'qris'}
                      onChange={() => setPaymentMethod('qris')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>

                  {/* 2. Virtual Account BCA */}
                  <div
                    onClick={() => setPaymentMethod('va_bca')}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      paymentMethod === 'va_bca'
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-black text-xs">
                        BCA
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">BCA Virtual Account (Escrow)</span>
                          <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.2 rounded">
                            Bebas Biaya Admin
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Nomor VA otomatis unik per pesanan, konfirmasi 24 jam nonstop
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      checked={paymentMethod === 'va_bca'}
                      onChange={() => setPaymentMethod('va_bca')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>

                  {/* 3. Virtual Account Mandiri */}
                  <div
                    onClick={() => setPaymentMethod('va_mandiri')}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      paymentMethod === 'va_mandiri'
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-900 text-white flex items-center justify-center font-black text-xs">
                        MDR
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">Mandiri Virtual Account</span>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.2 rounded">
                            Corporate MCM Ready
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Dukungan pembayaran Livin Mandiri dan Mandiri Cash Management (MCM)
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      checked={paymentMethod === 'va_mandiri'}
                      onChange={() => setPaymentMethod('va_mandiri')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>

                  {/* 4. Transfer Bank Manual / RTGS (Untuk Nilai di atas Rp 500 Juta) */}
                  <div
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center font-black text-xs">
                        RTGS
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">Transfer Bank Perusahaan / RTGS</span>
                          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.2 rounded">
                            Cocok untuk Tonase Besar
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Rekening Penampung: PT Scrava KUSTODI INDONESIA (BCA Cabang SCBD)
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <button
                    onClick={() => setStep('shipping')}
                    className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleProcessPayment}
                    className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Bayar Sekarang ({formatPrice(totalPayment)})</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Ringkasan Pesanan (Order Summary Card) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs sticky top-24 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
                Ringkasan Pesanan Bahan Baku
              </h3>

              {/* Product preview */}
              <div className="flex gap-3">
                <img
                  src={listing.photos[0]}
                  alt={listing.title}
                  className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                />
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-emerald-700 uppercase">{listing.category}</div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">{listing.title}</h4>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {listing.quantity} {listing.unit} · {listing.incoterm}
                  </div>
                </div>
              </div>

              {/* Breakdown Biaya */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Harga Bahan ({listing.quantity} {listing.unit}):</span>
                  <span className="font-mono font-semibold text-slate-900">{formatPrice(listing.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Ongkos Kirim Armada:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {freightCost === 0 ? 'Gratis (Ambil Sendiri)' : formatPrice(freightCost)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Asuransi Muatan Scrap:</span>
                  <span className="font-mono font-semibold text-slate-900">{formatPrice(insuranceCost)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Biaya Layanan Escrow (0.5%):</span>
                  <span className="font-mono font-semibold text-slate-900">{formatPrice(platformFee)}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-xs">Total Tagihan:</span>
                  <span className="text-lg font-black text-emerald-700 font-mono">
                    {formatPrice(totalPayment)}
                  </span>
                </div>
              </div>

              {/* Jaminan Metrologi & QC */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Jaminan Rekonsiliasi Timbangan</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Jika terjadi selisih timbangan saat truk tiba di gerbang pabrik Anda, sistem Escrow Scrava akan otomatis merefund kelebihan dana ke rekening Anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 4: SUCCESS INVOICE & INSTRUCTIONS (QRIS / VA Display) */
        <div className="max-w-2xl mx-auto bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Instruksi Pembayaran Escrow
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">Menunggu Pembayaran Anda</h2>
            <p className="text-xs text-slate-500 mt-1">
              Nomor Pesanan: <strong className="text-slate-800 font-mono">{createdOrderNumber}</strong>
            </p>
          </div>

          {/* Payment Detail Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-left space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-xs text-slate-500">Total Nominal Pembayaran:</span>
              <span className="text-xl font-black text-emerald-700 font-mono">{formatPrice(totalPayment)}</span>
            </div>

            {paymentMethod === 'qris' && (
              <div className="text-center space-y-3 py-2">
                <div className="w-48 h-48 bg-white p-3 mx-auto rounded-xl border border-slate-300 shadow-xs flex flex-col items-center justify-center">
                  {/* Mock QR Code Pattern */}
                  <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-white text-[11px] font-mono p-2 text-center">
                    [QRIS Scrava ESCROW ID20260928001]
                  </div>
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  Scan QRIS menggunakan BCA Mobile, Livin Mandiri, GoPay, atau OVO
                </div>
              </div>
            )}

            {(paymentMethod === 'va_bca' || paymentMethod === 'va_mandiri') && (
              <div className="space-y-3">
                <div className="text-xs text-slate-600">
                  {paymentMethod === 'va_bca' ? 'Nomor BCA Virtual Account:' : 'Nomor Mandiri Virtual Account:'}
                </div>
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-300">
                  <span className="text-lg font-mono font-black text-slate-900 tracking-wider">
                    {paymentMethod === 'va_bca' ? '8801 2983 0019 2831' : '8920 1823 9920 1102'}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(paymentMethod === 'va_bca' ? '8801298300192831' : '8920182399201102');
                      showToast('Nomor VA berhasil disalin!');
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-500">
                  Nama Akun: <strong>Scrava ESCROW / PT CILEGON STEEL</strong>
                </div>
              </div>
            )}

            {paymentMethod === 'bank_transfer' && (
              <div className="space-y-2 text-xs">
                <div className="text-slate-600">Rekening Transfer Bank Resmi (RTGS/Kliring):</div>
                <div className="bg-white p-3 rounded-lg border border-slate-300 space-y-1">
                  <div className="font-bold text-slate-900">Bank Central Asia (BCA) - Kantor Cabang SCBD</div>
                  <div className="font-mono text-base font-black text-slate-900">001-928-8772-01</div>
                  <div className="text-slate-500">Atas Nama: <strong>PT Scrava KUSTODI INDONESIA</strong></div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <Clock className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Selesaikan pembayaran dalam <strong>24 jam</strong> sebelum pesanan kedaluwarsa.</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('dashboard-orders')}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Lihat Status Pesanan di Dashboard
            </button>
            <button
              onClick={() => navigate('marketplace')}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
            >
              Lanjut Belanja Material
            </button>
          </div>
        </div>
      )}

      {/* Buyer Legality Verification Modal */}
      <UpgradeToFactoryModal
        isOpen={showLegalityModal}
        onClose={() => setShowLegalityModal(false)}
        reasonMessage="Default akun Customer adalah Penjual (Depo Scrap). Untuk menyelesaikan pembayaran checkout dan menerbitkan kontrak PO timbang bayar, lengkapi nomor NIB & NPWP perusahaan Anda."
      />
    </div>
  );
};
