import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, X, CheckCircle2, ShieldCheck, ArrowRight, UploadCloud, FileText, AlertCircle } from 'lucide-react';

interface UpgradeToFactoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  reasonMessage?: string;
}

export const UpgradeToFactoryModal: React.FC<UpgradeToFactoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  reasonMessage,
}) => {
  const { currentUser, verifyCustomerAsBuyer, showToast } = useApp();

  const [companyName, setCompanyName] = useState('PT Cilegon Precision Steel');
  const [nib, setNib] = useState('0220001234567');
  const [npwp, setNpwp] = useState('01.992.112.8-041.000');
  const [picName, setPicName] = useState(currentUser?.name || 'Hendra Wijaya');
  const [phone, setPhone] = useState(currentUser?.phone || '0812-3456-7890');
  const [businessType, setBusinessType] = useState('Pabrik Peleburan / Smelter Baja');
  const [address, setAddress] = useState('Kawasan Industri Krakatau Steel, Cilegon, Banten');
  const [fileName, setFileName] = useState('NIB_NPWP_Legalitas_Pabrik.pdf');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      showToast('Harap isi nama resmi PT/CV perusahaan.');
      return;
    }
    if (!nib.trim() || !npwp.trim()) {
      showToast('Nomor NIB dan NPWP wajib diisi untuk verifikasi legalitas pembeli.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      verifyCustomerAsBuyer({
        companyName,
        nib,
        npwp,
        picName,
        phone,
        businessType,
        address,
      });
      setIsSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Verifikasi Legalitas Pembeli (Pabrik)</h2>
              <p className="text-xs text-slate-500">Lengkapi dokumen PT/CV untuk membuka akses pembelian & tender</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Regulatory Context Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Regulasi Bursa Scrap & Bahan Baku Scrava:</span>
            <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
              {reasonMessage ||
                'Akun Customer secara default berstatus Penjual (Depo/Pengepul). Untuk membeli material industri, menerbitkan PO timbang bayar, atau membuka tender pengadaan (RFQ), Anda wajib melengkapi dokumen legalitas resmi di bawah ini.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Nama Resmi Perusahaan (PT/CV) *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="cth. PT Cilegon Precision Steel"
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden bg-slate-50/50 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Nomor Induk Berusaha (NIB) *
              </label>
              <input
                type="text"
                value={nib}
                onChange={(e) => setNib(e.target.value)}
                placeholder="13 Digit NIB (OSS)"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden bg-slate-50/50 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                NPWP Badan Usaha *
              </label>
              <input
                type="text"
                value={npwp}
                onChange={(e) => setNpwp(e.target.value)}
                placeholder="01.xxx.xxx.x-xxx.000"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden bg-slate-50/50 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama PIC Penanggung Jawab *
              </label>
              <input
                type="text"
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
                placeholder="cth. Ir. Hendra Wijaya"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden bg-slate-50/50"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp PIC *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-3456-7890"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden bg-slate-50/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kategori Industri Pabrik / Smelter
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden bg-slate-50/50"
            >
              <option value="Pabrik Peleburan / Smelter Baja">Pabrik Peleburan / Smelter Baja</option>
              <option value="Manufaktur & Fabrikasi Logam">Manufaktur & Fabrikasi Logam</option>
              <option value="Peleburan Aluminium & Tembaga">Peleburan Aluminium & Tembaga</option>
              <option value="Pabrik Kertas & Karton Daur Ulang">Pabrik Kertas & Karton Daur Ulang</option>
              <option value="Pabrik Daur Ulang Plastik Pellet">Pabrik Daur Ulang Plastik Pellet</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Pabrik / Lokasi Jembatan Timbang Penerimaan
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="cth. Kawasan Industri Krakatau Steel, Cilegon"
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden bg-slate-50/50"
            />
          </div>

          {/* Upload Document Strip */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Berkas Pendukung (NIB / NPWP / IUI)
            </label>
            <div className="p-3 border border-dashed border-emerald-300 rounded-lg bg-emerald-50/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-mono text-[11px] text-slate-700 font-semibold">{fileName}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Siap Diverifikasi
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              {isSubmitting ? (
                'Memverifikasi Data...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verifikasi & Aktifkan Akses Pembeli</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
