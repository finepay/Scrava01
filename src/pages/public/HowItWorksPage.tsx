import React from 'react';
import {
  Scale,
  ShieldCheck,
  Truck,
  DollarSign,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Building,
  ArrowRight
} from 'lucide-react';

interface HowItWorksProps {
  navigate: (path: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksProps> = ({ navigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 font-sans">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
          Arsitektur Perdagangan B2B Tepercaya
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Cara Kerja Bursa Digital Scrava
        </h1>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          Scrava beroperasi sebagai platform teknologi bursa transaksi B2B terpercaya. Tidak memiliki gudang penimbunan fisik melainkan menghubungkan langsung depo yard ke pabrik dengan jaminan rekber escrow, jembatan timbang resmi, dan inspeksi independen.
        </p>
      </div>

      {/* The 5 Key Process Steps */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs relative">
          <div className="text-xs font-mono font-bold text-emerald-600 mb-3">01 · PASANG STOK</div>
          <h3 className="text-sm font-bold text-slate-900 mb-2">Listing Material</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Depo memasang stok Harga Tetap, Lelang Terbuka, atau Limbah Gratis dengan spesifikasi grade, kadar logam, lokasi gudang, dan Incoterm.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs relative">
          <div className="text-xs font-mono font-bold text-emerald-600 mb-3">02 · TAWAR & NEGO</div>
          <h3 className="text-sm font-bold text-slate-900 mb-2">Negosiasi Langsung</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Pabrik mengajukan penawaran harga atau bid lelang. Kesepakatan tonase, harga, dan jadwal kirim terekam di sistem tanpa calo.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs relative">
          <div className="text-xs font-mono font-bold text-emerald-600 mb-3">03 · DANA ESCROW</div>
          <h3 className="text-sm font-bold text-slate-900 mb-2">Jaminan Pembayaran</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Pabrik menyetor dana ke rekening penampung resmi (escrow) sebelum truk berangkat menjemput atau muat barang di depo.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs relative">
          <div className="text-xs font-mono font-bold text-emerald-600 mb-3">04 · TIMBANG & QC</div>
          <h3 className="text-sm font-bold text-slate-900 mb-2">Jembatan Timbang</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Muatan ditimbang bruto dan tara pada jembatan timbang resmi Metrologi Legal. Uji kadar spektrometri dilakukan di pintu pabrik.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs relative">
          <div className="text-xs font-mono font-bold text-emerald-600 mb-3">05 · DANA CAIR</div>
          <h3 className="text-sm font-bold text-slate-900 mb-2">Pencairan Otomatis</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Perbedaan berat timbang langsung direkonsiliasi. Dana otomatis dicairkan ke rekening penjual dan kelebihan dana dikembalikan ke pabrik.
          </p>
        </div>
      </div>

      {/* Deep Dive into Weighbridge & Settlement Mechanics */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-sm border border-slate-800">
        <div className="max-w-3xl mb-8">
          <h2 className="text-xl font-bold text-white mb-2">Mesin Rekonsiliasi Timbangan & Pencairan Otomatis</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Perdagangan scrap curah rentan perselisihan timbangan antara depo dan pabrik. Scrava menghilangkan risiko ini dengan rekonsiliasi timbangan digital bersertifikat resmi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-xl">
            <Scale className="w-5 h-5 text-emerald-400 mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">Kalibrasi Timbangan Elektronik</h4>
            <p className="text-slate-400 leading-relaxed">
              Tiket timbang digital mencatat Berat Bruto (Kotor), Berat Tara kendaraan kosong, dan Berat Bersih (Netto) lengkap dengan foto bukti timbang.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-xl">
            <DollarSign className="w-5 h-5 text-emerald-400 mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">Penyesuaian Selisih Tonase Otomatis</h4>
            <p className="text-slate-400 leading-relaxed">
              Jika surat jalan tercatat 50 MT tetapi timbangan pabrik memastikan 48,65 MT (-1,35 MT), sistem otomatis menghitung refund ke pembeli dan mentransfer hasil bersih ke penjual.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">Arbitrase & Mediasi Independen</h4>
            <p className="text-slate-400 leading-relaxed">
              Jika terjadi selisih kadar atau kontaminasi berat, tim inspektur independen memeriksa sampel tersegel dan memberikan keputusan yang mengikat kedua belah pihak.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center max-w-2xl mx-auto">
        <h3 className="text-lg font-bold text-emerald-950 mb-2">Siap Bertransaksi Bahan Baku Industri?</h3>
        <p className="text-xs text-emerald-800 mb-6">
          Bergabunglah dengan ratusan smelter, manufaktur, dan depo scrap terverifikasi di seluruh Indonesia.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('register')}
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
          >
            Daftar Akun Perusahaan
          </button>
          <button
            onClick={() => navigate('marketplace')}
            className="px-5 py-2.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Jelajahi Marketplace
          </button>
        </div>
      </div>
    </div>
  );
};
