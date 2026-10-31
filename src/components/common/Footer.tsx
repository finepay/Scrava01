import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Scale,
  FileText,
  Truck,
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Lock,
  ExternalLink,
  Sparkles,
  HelpCircle,
  Clock
} from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { t } = useApp();
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs mt-16 font-sans">
      {/* 1. TOP TRUST BADGES STRIP */}
      <div className="bg-slate-800/80 border-b border-slate-700/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white text-xs font-bold">Jaminan Escrow</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Dana disimpan di rekening penampung resmi sampai timbang terima di pabrik selesai.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white text-xs font-bold">Timbangan Digital</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Jembatan timbang tersertifikasi Metrologi Legal dengan penyesuaian otomatis.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white text-xs font-bold">Inspeksi Lab</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pengujian kadar logam dan radiasi didukung surveyor SGS & Sucofindo.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white text-xs font-bold">Armada Truk</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Dukungan Tronton, Wingbox, Trailer dengan QR Code Surat Jalan digital.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER DIRECTORY (5 Columns) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand & Profile */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm">
                S
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-white font-black text-lg tracking-tight">Scrava</span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Industrial B2B</span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {t('footer.about', 'Platform e-commerce & bursa digital B2B bahan baku, scrap industri, dan mesin pabrik nomor #1 di Indonesia. Menghubungkan pabrik peleburan, manufaktur, dan jaringan depo scrap secara langsung tanpa calo.')}
            </p>

            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>One Pacific Place Level 15, SCBD Jakarta Selatan & Cikarang Techno Park</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Hotline B2B: (021) 5098-7700 / WhatsApp: +62 812-Scrava-ID</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Pengadaan & Penawaran: procurement@scrava.com</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono">
                <CheckCircle2 className="w-3 h-3" /> ISO 9001:2015 Certified
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                Kemenperin Reg. 2026/IND/TRZ
              </span>
            </div>
          </div>

          {/* Col 2: Kategori */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <span>{t('footer.categories', 'Kategori')}</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('marketplace')} className="hover:text-white transition-colors">
                  Besi & Baja Tua (HMS 1 & 2)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('marketplace')} className="hover:text-white transition-colors">
                  Tembaga Millberry & Kabel
                </button>
              </li>
              <li>
                <button onClick={() => navigate('marketplace')} className="hover:text-white transition-colors">
                  Aluminium Extrusion & UBC
                </button>
              </li>
              <li>
                <button onClick={() => navigate('marketplace')} className="hover:text-white transition-colors">
                  Plastik Flakes (HDPE / PET / PP)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('marketplace')} className="hover:text-white transition-colors">
                  Kardus Box Corrugated (OCC)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('marketplace')} className="hover:text-white transition-colors">
                  Aki Bekas & E-Waste Industri
                </button>
              </li>
              <li>
                <button onClick={() => navigate('marketplace')} className="hover:text-white transition-colors">
                  Mesin Industri & Workshop Lelang
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Solusi Pabrik & Tender */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3.5">
              {t('footer.solutions', 'Solusi Pabrik')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('procurement-hub')} className="hover:text-white transition-colors text-emerald-400 font-medium">
                  Split Order
                </button>
              </li>
              <li>
                <button onClick={() => navigate('reverse-bid')} className="hover:text-white transition-colors">
                  Dicari Pabrik (RFQ)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('marketplace')} className="hover:text-white transition-colors">
                  Ready Stok
                </button>
              </li>
              <li>
                <button onClick={() => navigate('dashboard-create-listing')} className="hover:text-white transition-colors">
                  Jual Scrap Gudang
                </button>
              </li>
              <li>
                <button onClick={() => navigate('auctions')} className="hover:text-white transition-colors">
                  Lelang Kilat Mesin Pabrik
                </button>
              </li>
              <li>
                <button onClick={() => navigate('how-it-works')} className="hover:text-white transition-colors">
                  Material Circularity & ESG Passport
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Panduan & Transaksi Aman */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3.5">
              {t('footer.guides', 'Panduan & Keamanan')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('how-it-works')} className="hover:text-white transition-colors">
                  Alur 5-Tahap Timbang Bayar
                </button>
              </li>
              <li>
                <button onClick={() => navigate('how-it-works')} className="hover:text-white transition-colors">
                  Sistem Rekening Bersama Escrow
                </button>
              </li>
              <li>
                <button onClick={() => navigate('how-it-works')} className="hover:text-white transition-colors">
                  Standar Jembatan Timbang Metrologi
                </button>
              </li>
              <li>
                <button onClick={() => navigate('how-it-works')} className="hover:text-white transition-colors">
                  Protokol Uji Lab Sucofindo & SGS
                </button>
              </li>
              <li>
                <button onClick={() => navigate('verification')} className="hover:text-white transition-colors">
                  Verifikasi Legalitas Perusahaan (KYC)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('how-it-works')} className="hover:text-white transition-colors">
                  Penyelesaian Sengketa Berat / Kadar
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. PARTNERS STRIP (Banks, Logistics, Quality Assurance) */}
        <div className="pt-8 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px]">
          <div>
            <div className="text-white font-bold mb-2">Mitra Bank Rekening Bersama (Escrow):</div>
            <div className="flex flex-wrap items-center gap-2 text-slate-300 font-mono text-[11px]">
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">Bank Mandiri Escrow</span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">BCA Virtual Account</span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">BNI B2B</span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">Bank Permata Custody</span>
            </div>
          </div>

          <div>
            <div className="text-white font-bold mb-2">Mitra Logistik & Truk Pengiriman:</div>
            <div className="flex flex-wrap items-center gap-2 text-slate-300 text-[11px]">
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">Tronton Losbak (20-30T)</span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">Wingbox Ekspedisi</span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">Trailer Container 40ft</span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">Deliveree B2B Heavy</span>
            </div>
          </div>

          <div>
            <div className="text-white font-bold mb-2">Akreditasi & Standar Industri:</div>
            <div className="flex flex-wrap items-center gap-2 text-slate-300 text-[11px]">
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-emerald-400 font-semibold">
                Metrologi Legal Kemendag
              </span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">PT Sucofindo</span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">SGS Inspectorate</span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">ISRI Scrap Code</span>
            </div>
          </div>
        </div>

        {/* 4. COPYRIGHT & LEGAL DISCLAIMER */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            &copy; 2026 PT Scrava Teknologi Industri. {t('footer.rights', 'Seluruh hak cipta dilindungi undang-undang.')}
          </div>
          <div className="text-center md:text-right text-slate-400 font-medium">
            {t('footer.trusted', 'Bursa Bahan Baku Industri Terpercaya')}
          </div>
        </div>
      </div>
    </footer>
  );
};
