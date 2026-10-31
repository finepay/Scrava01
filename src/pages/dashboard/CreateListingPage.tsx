import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../api/client';
import { CATEGORIES, COUNTRIES, SAMPLE_IMAGES } from '../../data/mockData';
import {
  Sparkles,
  Layers,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  FileText,
  CheckCircle2,
  MapPin,
  DollarSign,
  Gavel,
  Gift,
  HelpCircle,
  Eye,
  Camera,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { ListingType, MaterialCondition, IncotermType } from '../../types';

interface CreateListingProps {
  navigate: (path: string, params?: any) => void;
}

export const CreateListingPage: React.FC<CreateListingProps> = ({ navigate }) => {
  const { addListing, showToast, currentCompany, formatPrice } = useApp();

  const [mode, setMode] = useState<'select' | 'quick' | 'full'>('select');
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Quick Listing State
  const [quickTitle, setQuickTitle] = useState('50 MT Scrap Besi Baja Berat HMS 1');
  const [quickCategory, setQuickCategory] = useState(CATEGORIES[0]);
  const [quickQuantity, setQuickQuantity] = useState<number>(25);
  const [quickPriceIDR, setQuickPriceIDR] = useState<number>(6400000); // Rp 6.400.000 / MT (setara $400 / MT)
  const [quickLocation, setQuickLocation] = useState('Surabaya Scrap Yard, Jawa Timur');
  const [quickDescription, setQuickDescription] = useState<string>(
    'Scrap besi baja berat HMS 1/2 pilihan ex-pabrik & konstruksi. Ketebalan min 6mm, bersih tanpa oli/tanah. Siap muat langsung dari yard Surabaya dengan jembatan timbang terkalibrasi resmi.'
  );
  const [quickImage, setQuickImage] = useState<string>(SAMPLE_IMAGES.hmsScrap);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Full Listing State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<MaterialCondition>('Clean');
  const [quantity, setQuantity] = useState<number>(50);
  const [unit, setUnit] = useState<string>('MT');
  const [grade, setGrade] = useState('');
  const [specs, setSpecs] = useState<Record<string, string>>({
    'Kode ISRI': '200 (HMS 1)',
    'Ketebalan': 'Min 6mm',
    'Dimensi Maksimal': '1.5m x 0.5m',
  });

  // Pricing step
  const [listingType, setListingType] = useState<ListingType>('FIXED_PRICE');
  const [pricePerUnit, setPricePerUnit] = useState<number>(395);
  const [minAskingPrice, setMinAskingPrice] = useState<number>(380);
  const [bidIncrement, setBidIncrement] = useState<number>(10);
  const [closingDays, setClosingDays] = useState<number>(5);
  const [buyNowPrice, setBuyNowPrice] = useState<number>(450);
  const [securityDepositIDR, setSecurityDepositIDR] = useState<number>(5000000);

  // Trade terms step
  const [incoterm, setIncoterm] = useState<IncotermType>('FOB');
  const [portOfLoading, setPortOfLoading] = useState('Pelabuhan Tanjung Perak');
  const [pickupDate, setPickupDate] = useState('2026-10-15');

  // Location step
  const [country, setCountry] = useState('Indonesia');
  const [city, setCity] = useState('Surabaya');
  const [address, setAddress] = useState('Kawasan Industri Rungkut Blok H-12');

  // Promotion Plan Setting (Berbayar vs Gratis)
  const [isPaidPromotion, setIsPaidPromotion] = useState<boolean>(false);
  const [promotionTier, setPromotionTier] = useState<'STANDARD_FREE' | 'PREMIUM_FEATURED'>('STANDARD_FREE');

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Ukuran file maksimal 5MB.');
        return;
      }
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setQuickImage(reader.result as string);
        setIsUploading(false);
        showToast('Foto material scrap berhasil diunggah!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuickPublish = (e: React.FormEvent) => {
    e.preventDefault();
    const priceUSD = Math.round(quickPriceIDR / 16000);
    const created = addListing({
      title: quickTitle || '50 MT Scrap Besi Baja Berat HMS 1',
      category: quickCategory,
      quantity: quickQuantity,
      unit: 'MT',
      pricePerUnit: priceUSD,
      totalPrice: priceUSD * quickQuantity,
      listingType: 'FIXED_PRICE',
      condition: 'Clean',
      incoterm: 'EXW',
      location: {
        country: 'Indonesia',
        city: 'Surabaya',
        address: quickLocation,
      },
      photos: quickImage ? [quickImage] : [SAMPLE_IMAGES.hmsScrap],
      description: quickDescription,
      status: 'Published',
      isPaidPromotion,
      promotionTier: isPaidPromotion ? 'PREMIUM_FEATURED' : 'STANDARD_FREE',
    });
    showToast(
      isPaidPromotion
        ? 'Listing BERBAYAR (Prioritas) berhasil diterbitkan! Listing Anda diutamakan di posisi teratas.'
        : 'Listing GRATIS berhasil diterbitkan ke katalog bursa!'
    );
    navigate('listing-detail', { id: created.id });
  };

  const handleFullPublish = async () => {
    const isAuction = listingType === 'AUCTION';
    const status = isAuction ? 'Pending Review' : 'Published';

    const created = addListing({
      title: title || 'Lot Material Tersertifikasi',
      category,
      subcategory,
      description,
      quantity,
      unit,
      pricePerUnit: listingType === 'FREE_PICKUP' ? 0 : pricePerUnit,
      totalPrice: listingType === 'FREE_PICKUP' ? 0 : pricePerUnit * quantity,
      listingType,
      condition,
      incoterm,
      location: {
        country,
        city,
        address,
        port: portOfLoading,
      },
      minAskingPrice: isAuction ? minAskingPrice : undefined,
      currentBid: isAuction ? minAskingPrice : undefined,
      bidIncrement: isAuction ? bidIncrement : undefined,
      specs,
      status,
      isPaidPromotion,
      promotionTier: isPaidPromotion ? 'PREMIUM_FEATURED' : 'STANDARD_FREE',
    });

    if (isAuction) {
      try {
        await apiClient.projectAuctions.create({
          title: title || 'Lelang Material Industri',
          category,
          description: description || 'Lelang material scrap industri dari pemilik barang.',
          photos: [quickImage || SAMPLE_IMAGES.hmsScrap],
          startingBid: (minAskingPrice || 380) * 16000 * quantity,
          bidIncrement: (bidIncrement || 10) * 16000,
          buyNowPrice: (buyNowPrice || (minAskingPrice || 380) * 1.35) * 16000 * quantity,
          securityDeposit: securityDepositIDR,
          depositDeductionFee: 250000,
          status: 'PENDING_APPROVAL',
          location: `${city}, ${country}`,
          sellerCompany: currentCompany?.name || 'Depo Scrap Berkah Mandiri',
        });
      } catch (err) {
        console.warn('Failed to sync auction with database:', err);
      }

      showToast('Lelang berhasil dibuat oleh pemilik barang! Menunggu persetujuan (approve) Admin sebelum tayang di bursa.');
      navigate('my-listings');
      return;
    }

    showToast(
      isPaidPromotion
        ? 'Listing BERBAYAR (Prioritas) berhasil diterbitkan! Listing Anda diutamakan di posisi teratas.'
        : 'Listing GRATIS berhasil diterbitkan ke katalog bursa!'
    );
    navigate('listing-detail', { id: created.id });
  };

  // 1. Selector Mode
  if (mode === 'select') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Jual Bahan Baku & Scrap Industri Anda
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pilih metode publikasi listing Anda. Seluruh transaksi terlindungi oleh jaminan rekber escrow bursa dan inspeksi jembatan timbang resmi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Listing Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col justify-between hover:border-emerald-500 transition-colors">
            <div>
              <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono font-bold text-emerald-700 uppercase">30 Detik Kilat</div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">Listing Cepat (Quick)</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Rekomendasi judul dan kategori otomatis dengan input harga instan. Ideal untuk scrap standar dan pengosongan yard secara cepat.
              </p>
              <ul className="mt-4 text-xs text-slate-500 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Saran Judul & Kategori Otomatis</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Publikasi Cepat 1 Langkah</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => setMode('quick')}
              className="mt-6 w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-xs"
            >
              Mulai Listing Cepat →
            </button>
          </div>

          {/* Full Listing Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col justify-between hover:border-slate-400 transition-colors">
            <div>
              <div className="w-10 h-10 rounded bg-slate-100 text-slate-800 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono font-bold text-slate-500 uppercase">2 Menit · Standar Industri</div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">Listing Lengkap Profesional</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Formulir terpadu 5-langkah lengkap dengan Incoterms (EXW/FOB/CIF/DDP), lampiran dokumen uji laboratorium, dan opsi lelang terbuka.
              </p>
              <ul className="mt-4 text-xs text-slate-500 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                  <span>Lelang Terbuka atau Harga Tetap + Incoterms</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                  <span>Unggah Mill Certificate & Hasil Uji Lab SGS</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => setMode('full')}
              className="mt-6 w-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
            >
              Mulai Listing Lengkap 5-Langkah →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Quick Listing Mode
  if (mode === 'quick') {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <button
          onClick={() => setMode('select')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Ganti Metode Listing</span>
        </button>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Listing Kilat Material (30 Detik)</h2>
          </div>

          <form onSubmit={handleQuickPublish} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Apa material yang Anda jual? (Nama Produk) *
              </label>
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="cth. 50 MT Scrap Besi Baja Berat HMS 1"
                className="w-full p-2.5 text-xs border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden"
                required
              />
            </div>

            {/* Upload Foto Material Scrap */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Foto Material Scrap *</span>
                <span className="text-[10px] text-emerald-700 font-normal">Foto jelas meningkatkan minat pabrik</span>
              </label>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {quickImage ? (
                    <div className="relative w-28 h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 group">
                      <img
                        src={quickImage}
                        alt="Preview Scrap"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setQuickImage('')}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-90 hover:opacity-100 shadow-xs transition-opacity"
                        title="Hapus Foto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-28 h-24 rounded-lg border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 shrink-0">
                      <Camera className="w-6 h-6 mb-1 text-slate-300" />
                      <span className="text-[10px]">Belum ada foto</span>
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                    <div>
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-600 hover:text-emerald-700 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-2xs">
                        <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{quickImage ? 'Ganti Foto dari Perangkat' : 'Unggah Foto dari Perangkat'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Format JPG, PNG, WEBP (maks. 5MB) atau klik salah satu contoh foto scrap di bawah:
                    </p>

                    {/* Quick Preset Selector */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      {[
                        { label: 'Besi HMS', img: SAMPLE_IMAGES.hmsScrap },
                        { label: 'Tembaga', img: SAMPLE_IMAGES.copperWire },
                        { label: 'Aluminium', img: SAMPLE_IMAGES.aluminumExtrusion },
                        { label: 'Stainless', img: SAMPLE_IMAGES.stainlessPlate },
                        { label: 'Kardus OCC', img: SAMPLE_IMAGES.cardboardOCC },
                        { label: 'E-Waste', img: SAMPLE_IMAGES.eWaste },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setQuickImage(preset.img)}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                            quickImage === preset.img
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold ring-1 ring-emerald-500/20'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori *</label>
                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kuantitas (MT) *</label>
                <input
                  type="number"
                  value={quickQuantity}
                  onChange={(e) => setQuickQuantity(Number(e.target.value))}
                  className="w-full p-2 text-xs border border-slate-300 rounded font-mono font-semibold focus:border-emerald-600 focus:outline-hidden"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Harga per MT (Rp) *</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Mata Uang IDR</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={quickPriceIDR}
                    onChange={(e) => setQuickPriceIDR(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded font-mono font-semibold focus:border-emerald-600 focus:outline-hidden"
                    placeholder="6400000"
                    step="50000"
                    min="100000"
                    required
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Setara: <strong>Rp {new Intl.NumberFormat('id-ID').format(Math.round(quickPriceIDR / 1000))} / kg</strong></span>
                  <span className="text-slate-400">($ {Math.round(quickPriceIDR / 16000)}/MT)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lokasi Gudang / Yard *</label>
                <input
                  type="text"
                  value={quickLocation}
                  onChange={(e) => setQuickLocation(e.target.value)}
                  placeholder="Surabaya Scrap Yard, Jawa Timur"
                  className="w-full p-2 text-xs border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            {/* Deskripsi Material */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Deskripsi Material / Kondisi Scrap *</span>
                <span className="text-[10px] text-slate-400">Kadar kontaminan, ukuran potongan & jadwal timbang</span>
              </label>
              <textarea
                value={quickDescription}
                onChange={(e) => setQuickDescription(e.target.value)}
                rows={3}
                placeholder="cth. Scrap besi baja berat HMS 1/2 pilihan ex-pabrik & konstruksi. Ketebalan min 6mm, bersih tanpa oli/tanah. Siap muat langsung dari yard Surabaya dengan jembatan timbang resmi..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden leading-relaxed"
                required
              />
            </div>

            {/* Setting Iklan: Berbayar atau Gratis */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>Pengaturan Publikasi Iklan *</span>
                <span className="text-[10px] text-slate-500">Pilih opsi Gratis atau Berbayar (Prioritas)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsPaidPromotion(false);
                    setPromotionTier('STANDARD_FREE');
                  }}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    !isPaidPromotion
                      ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">Publikasi Gratis</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      Rp 0 / Bebas Biaya
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Listing standar di katalog bursa scrap. Verifikasi legalitas normal.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPaidPromotion(true);
                    setPromotionTier('PREMIUM_FEATURED');
                  }}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    isPaidPromotion
                      ? 'border-amber-500 bg-amber-50/60 ring-1 ring-amber-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Berbayar (Prioritas)
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                      Rp 99.000
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Prioritas di atas bursa, badge <strong>HOT / FEATURED</strong>, broadcast notifikasi ke 50+ pabrik & smelter.
                  </p>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <span className="text-slate-500 font-medium">Estimasi Total Nilai Lot:</span>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  {quickQuantity} MT × Rp {new Intl.NumberFormat('id-ID').format(quickPriceIDR)}/MT
                </div>
              </div>
              <span className="font-mono font-black text-emerald-800 text-base">
                Rp {new Intl.NumberFormat('id-ID').format(quickQuantity * quickPriceIDR)}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-xs"
            >
              Terbitkan Listing Cepat
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. Full 5-Step Wizard
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => setMode('select')}
        className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Ganti Metode Listing</span>
      </button>

      {/* Stepper Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold">
          {[
            { step: 1, label: '1. Rincian Lot' },
            { step: 2, label: '2. Skema Harga' },
            { step: 3, label: '3. Ketentuan Dagang' },
            { step: 4, label: '4. Media & Dokumen' },
            { step: 5, label: '5. Lokasi & Tinjau' },
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`pb-1 border-b-2 transition-colors ${
                currentStep === s.step
                  ? 'border-emerald-600 text-emerald-800 font-bold'
                  : currentStep > s.step
                  ? 'border-slate-300 text-slate-700'
                  : 'border-transparent text-slate-400'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Wizard Steps */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        {/* Step 1: Details */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Spesifikasi & Rincian Material
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Penawaran Lot *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="cth. Bare Bright Copper Wire (Millberry 99.99%) dalam Kemasan Bal 500kg"
                className="w-full p-2 text-xs border border-slate-300 rounded"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kondisi Material *</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as MaterialCondition)}
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                >
                  <option value="Clean">Bersih (Siap lebur / siap pakai langsung)</option>
                  <option value="Processed">Terproses (Dipres / dipotong bal)</option>
                  <option value="Unprocessed">Scrap mentah belum diproses</option>
                  <option value="Contaminated">Terkontaminasi (Perlu penyortiran)</option>
                  <option value="Mixed">Campuran Aneka Grade</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kuantitas Tersedia *</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full p-2 text-xs border border-slate-300 rounded font-mono font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Satuan Ukuran</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded font-mono"
                >
                  <option value="MT">MT (Metrik Ton)</option>
                  <option value="KG">KG (Kilogram)</option>
                  <option value="Piece">Pcs / Batang</option>
                  <option value="Lot">Seluruh Lot</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kode ISRI / Grade Komersial</label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="cth. Barley / Berry / 6063"
                  className="w-full p-2 text-xs border border-slate-300 rounded font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi & Riwayat Material</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Cantumkan kondisi penyimpanan gudang, industri sumber asal, kemasan bal, dan catatan kadar kemurnian..."
                rows={3}
                className="w-full p-2 text-xs border border-slate-300 rounded"
              />
            </div>
          </div>
        )}

        {/* Step 2: Pricing */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Skema & Model Penetapan Harga
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setListingType('FIXED_PRICE')}
                className={`p-3 rounded border text-left transition-colors ${
                  listingType === 'FIXED_PRICE'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <DollarSign className="w-4 h-4 mb-1 text-emerald-600" />
                <div className="text-xs">Harga Tetap (Pas)</div>
                <div className="text-[10px] text-slate-500 font-normal">Beli langsung & ajukan negosiasi</div>
              </button>

              <button
                type="button"
                onClick={() => setListingType('AUCTION')}
                className={`p-3 rounded border text-left transition-colors ${
                  listingType === 'AUCTION'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Gavel className="w-4 h-4 mb-1 text-amber-600" />
                <div className="text-xs">Lelang Terbuka</div>
                <div className="text-[10px] text-slate-500 font-normal">Penawaran kompetitif batas waktu</div>
              </button>

              <button
                type="button"
                onClick={() => setListingType('FREE_PICKUP')}
                className={`p-3 rounded border text-left transition-colors ${
                  listingType === 'FREE_PICKUP'
                    ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Gift className="w-4 h-4 mb-1 text-blue-600" />
                <div className="text-xs">Pengambilan Bebas Biaya</div>
                <div className="text-[10px] text-slate-500 font-normal">Pembeli angkut tanpa biaya material</div>
              </button>
            </div>

            {listingType === 'FIXED_PRICE' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga Penawaran per {unit} (USD) *
                  </label>
                  <input
                    type="number"
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(Number(e.target.value))}
                    className="w-full p-2 text-xs border border-slate-300 rounded font-mono font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Estimasi Nilai Lot</label>
                  <div className="p-2 text-xs bg-slate-50 border border-slate-200 rounded font-mono font-bold text-slate-900">
                    {formatPrice(pricePerUnit * quantity)}
                  </div>
                </div>
              </div>
            )}

            {listingType === 'AUCTION' && (
              <div className="space-y-4 pt-2">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs leading-relaxed">
                  <strong>Persetujuan Admin:</strong> Lelang yang dibuat oleh user pemilik barang akan masuk ke antrean moderasi dan baru tayang di bursa setelah disetujui (approve) oleh Admin.
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Harga Dasar Minimum / {unit} (USD) *
                    </label>
                    <input
                      type="number"
                      value={minAskingPrice}
                      onChange={(e) => setMinAskingPrice(Number(e.target.value))}
                      className="w-full p-2 text-xs border border-slate-300 rounded font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kelipatan Tawaran (Bid Increment)
                    </label>
                    <input
                      type="number"
                      value={bidIncrement}
                      onChange={(e) => setBidIncrement(Number(e.target.value))}
                      className="w-full p-2 text-xs border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Harga Beli Langsung / {unit} (USD)
                    </label>
                    <input
                      type="number"
                      value={buyNowPrice}
                      onChange={(e) => setBuyNowPrice(Number(e.target.value))}
                      placeholder="Beli tanpa lelang"
                      className="w-full p-2 text-xs border border-slate-300 rounded font-mono font-bold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Durasi Lelang
                    </label>
                    <select
                      value={closingDays}
                      onChange={(e) => setClosingDays(Number(e.target.value))}
                      className="w-full p-2 text-xs border border-slate-300 rounded"
                    >
                      <option value={3}>3 Hari</option>
                      <option value={5}>5 Hari</option>
                      <option value={7}>7 Hari</option>
                      <option value={10}>10 Hari</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Uang Jaminan Lelang yang Wajib Disetor Penawar (Rp) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      value={securityDepositIDR}
                      onChange={(e) => setSecurityDepositIDR(Number(e.target.value))}
                      step={1000000}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded font-mono font-bold text-slate-900"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Calon penawar wajib menyetorkan uang jaminan lelang ini ke rekening kustodi resmi sebelum dapat mengajukan penawaran sah.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Trade Terms */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Ketentuan Perdagangan & Incoterms
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Incoterm Perdagangan *</label>
                <select
                  value={incoterm}
                  onChange={(e) => setIncoterm(e.target.value as IncotermType)}
                  className="w-full p-2 text-xs border border-slate-300 rounded font-mono"
                >
                  <option value="EXW">EXW - Ex Works (Pembeli ambil di depo/yard penjual)</option>
                  <option value="FOB">FOB - Free on Board (Penjual antar sampai ke atas kapal)</option>
                  <option value="CIF">CIF - Cost, Insurance & Freight (Biaya, asuransi & angkut pelabuhan tujuan)</option>
                  <option value="DDP">DDP - Delivered Duty Paid (Diantar langsung ke pabrik pembeli)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pelabuhan Muat / Terminal Penumpukan</label>
                <input
                  type="text"
                  value={portOfLoading}
                  onChange={(e) => setPortOfLoading(e.target.value)}
                  placeholder="cth. Pelabuhan Tanjung Perak / Tanjung Priok"
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Mulai Siap Angkut / Muat</label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded font-mono"
              />
            </div>
          </div>
        )}

        {/* Step 4: Media & Documents */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Foto Material, Sertifikat Mutu & Tera Timbangan
            </h2>

            <div className="p-6 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-lg text-center cursor-pointer bg-slate-50 transition-colors">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-semibold text-slate-800">
                Tarik dan lepas foto resolusi tinggi material atau scrap
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Format PNG, JPG, WEBP hingga 20MB per foto</div>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 text-xs space-y-2">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Unggah Laporan Uji Mutu / Sertifikat Lab (Opsional tapi Sangat Disarankan)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Lot dengan lampiran sertifikat uji kadar SGS, analisis spektrometer, atau deklarasi bebas radiasi laku 3,4x lebih cepat dengan nilai optimal.
              </p>
              <button
                type="button"
                onClick={() => showToast('Sertifikat inspeksi sampel SGS berhasil dilampirkan.')}
                className="px-3 py-1 bg-white border border-slate-200 rounded font-medium text-slate-700 text-xs hover:bg-slate-100"
              >
                + Lampirkan PDF Sertifikat Uji Lab
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Location & Review */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Lokasi Depo Pengambilan & Tinjau Akhir
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Negara *</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kota / Hub Logistik *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Depo (Disamarkan hingga dana escrow masuk)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded"
                required
              />
            </div>

            {/* Setting Iklan: Berbayar atau Gratis */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>Pilih Tipe Publikasi Iklan *</span>
                <span className="text-[10px] text-slate-500">Pilih opsi Gratis atau Berbayar (Prioritas)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsPaidPromotion(false);
                    setPromotionTier('STANDARD_FREE');
                  }}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    !isPaidPromotion
                      ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">Publikasi Standar (Gratis)</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      Rp 0 / Bebas Biaya
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Listing standar di katalog bursa scrap tanpa biaya tambahan.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPaidPromotion(true);
                    setPromotionTier('PREMIUM_FEATURED');
                  }}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    isPaidPromotion
                      ? 'border-amber-500 bg-amber-50/60 ring-1 ring-amber-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Berbayar (Prioritas & Highlight)
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                      Rp 99.000
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Posisi atas bursa, pin HOT badge, dan blast ke pembeli pabrik verified.
                  </p>
                </button>
              </div>
            </div>

            {/* Final Summary Card */}
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded text-xs space-y-2">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Ringkasan Pra-Publikasi
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Judul Lot:</span>
                <span className="font-semibold text-slate-900">{title || 'Lot Material'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Volume:</span>
                <span className="font-mono font-bold text-slate-900">{quantity} {unit}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Skema Dagang:</span>
                <span className="font-semibold text-slate-900">{listingType} ({incoterm})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Tipe Iklan:</span>
                <span className={`font-semibold ${isPaidPromotion ? 'text-amber-700' : 'text-slate-700'}`}>
                  {isPaidPromotion ? 'Berbayar (Prioritas Rp 99.000)' : 'Gratis (Standar)'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Harga Tertera:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {listingType === 'FREE_PICKUP' ? 'GRATIS' : `${formatPrice(pricePerUnit)}/${unit}`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5"
            >
              <span>Langkah Berikutnya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFullPublish}
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Terbitkan Listing ke Katalog Bursa</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
