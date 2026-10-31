import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  MessageSquare,
  DollarSign,
  Send,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Building
} from 'lucide-react';
import { IncotermType } from '../../types';

interface NegotiationsProps {
  navigate: (path: string, params?: any) => void;
}

export const NegotiationsPage: React.FC<NegotiationsProps> = ({ navigate }) => {
  const { negotiations, sendNegotiationOffer, acceptNegotiation, formatPrice, userRole, openOffPlatformWarning } = useApp();

  const [selectedId, setSelectedId] = useState<string>(negotiations[0]?.id || '');
  const activeNeg = negotiations.find((n) => n.id === selectedId) || negotiations[0];

  // Counter offer state
  const [counterPrice, setCounterPrice] = useState<number>(activeNeg ? activeNeg.currentOfferPrice : 380);
  const [counterQty, setCounterQty] = useState<number>(activeNeg ? activeNeg.currentOfferQty : 100);
  const [counterIncoterm, setCounterIncoterm] = useState<IncotermType>(activeNeg ? activeNeg.incoterm : 'FOB');
  const [messageText, setMessageText] = useState<string>('');
  const [showOfferForm, setShowOfferForm] = useState<boolean>(false);

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNeg) return;
    sendNegotiationOffer(
      activeNeg.id,
      {
        pricePerUnit: counterPrice,
        quantity: counterQty,
        unit: activeNeg.unit,
        incoterm: counterIncoterm,
      },
      messageText || `Mengajukan tawaran harga baru: ${formatPrice(counterPrice)}/${activeNeg.unit} (${counterIncoterm}).`
    );
    setMessageText('');
    setShowOfferForm(false);
  };

  const handleAcceptOffer = () => {
    if (!activeNeg) return;
    acceptNegotiation(activeNeg.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Negosiasi Langsung & Tawar-Menawar</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengajuan penawaran harga balik B2B, penyesuaian Incoterm, dan konfirmasi kontrak jual beli mengikat
          </p>
        </div>

        {/* Anti off-platform security reminder */}
        <div
          onClick={openOffPlatformWarning}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 cursor-pointer hover:bg-amber-100 transition-colors"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
          <span>Seluruh transaksi dilindungi & terikat jaminan escrow bursa</span>
        </div>
      </div>

      {/* Split View: Left List | Right Chat & Offer Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden min-h-[580px]">
        {/* Left Side: Deal List (4 cols) */}
        <div className="lg:col-span-4 border-r border-slate-200 divide-y divide-slate-100">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
            Pengajuan Negosiasi Aktif ({negotiations.length})
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[550px]">
            {negotiations.map((n) => {
              const isSelected = n.id === selectedId;
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    setSelectedId(n.id);
                    setCounterPrice(n.currentOfferPrice);
                    setCounterQty(n.currentOfferQty);
                    setCounterIncoterm(n.incoterm);
                  }}
                  className={`p-4 cursor-pointer transition-colors text-xs ${
                    isSelected ? 'bg-emerald-50/70 border-l-4 border-emerald-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 truncate max-w-[160px]">{n.sellerCompany}</span>
                    <StatusBadge status={n.status} />
                  </div>
                  <div className="text-slate-600 font-medium truncate">{n.productTitle}</div>
                  <div className="mt-2 flex items-center justify-between text-slate-500 font-mono">
                    <span className="font-bold text-slate-900">{formatPrice(n.currentOfferPrice)}/{n.unit}</span>
                    <span>{n.currentOfferQty} {n.unit} · {n.incoterm}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Conversation & Offer Actions (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          {activeNeg ? (
            <>
              {/* Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900 truncate max-w-sm">{activeNeg.productTitle}</h2>
                    <StatusBadge status={activeNeg.status} />
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Rekan Transaksi: <strong>{activeNeg.sellerCompany}</strong> · Ketentuan: <strong>{activeNeg.incoterm}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeNeg.status !== 'Accepted' ? (
                    <button
                      onClick={handleAcceptOffer}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-xs"
                    >
                      Setujui Kesepakatan ({formatPrice(activeNeg.currentOfferPrice)}/{activeNeg.unit})
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('dashboard-orders')}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
                    >
                      Lihat Pesanan Kontrak
                    </button>
                  )}
                  <button
                    onClick={() => setShowOfferForm(!showOfferForm)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded"
                  >
                    {showOfferForm ? 'Tutup Formulir' : 'Ajukan Tawaran Balik'}
                  </button>
                </div>
              </div>

              {/* Message Feed */}
              <div className="p-4 space-y-4 overflow-y-auto max-h-[380px] flex-1">
                {activeNeg.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.senderRole === 'buyer' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400 mb-1 px-1">
                      {msg.senderCompany} · {msg.timestamp}
                    </div>

                    {/* If message includes an offer card */}
                    {msg.offer && (
                      <div className="w-full max-w-md p-4 bg-slate-50 border border-slate-200 rounded-lg mb-2 shadow-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2 text-xs">
                          <span className="font-bold text-slate-800">Lembar Penawaran Resmi B2B</span>
                          <span className="font-mono text-emerald-700 font-bold">{msg.offer.incoterm}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400">Harga Ditawarkan:</span>
                            <div className="font-mono font-bold text-slate-900">{formatPrice(msg.offer.pricePerUnit)}/{msg.offer.unit}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Total Komitmen Lot:</span>
                            <div className="font-mono font-bold text-slate-900">{formatPrice(msg.offer.totalAmount)}</div>
                          </div>
                        </div>
                        {msg.offer.notes && (
                          <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600 italic">
                            "{msg.offer.notes}"
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={`p-3 rounded-lg text-xs max-w-md ${
                        msg.senderRole === 'buyer'
                          ? 'bg-slate-900 text-white rounded-br-none'
                          : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Counter-Offer Form Drawer */}
              {showOfferForm && (
                <form onSubmit={handleSendOffer} className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                  <div className="font-bold text-xs text-slate-900">Ajukan Revisi Ketentuan Dagang</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Harga / {activeNeg.unit}</label>
                      <input
                        type="number"
                        value={counterPrice}
                        onChange={(e) => setCounterPrice(Number(e.target.value))}
                        className="w-full p-2 text-xs border border-slate-300 rounded font-mono font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Kuantitas ({activeNeg.unit})</label>
                      <input
                        type="number"
                        value={counterQty}
                        onChange={(e) => setCounterQty(Number(e.target.value))}
                        className="w-full p-2 text-xs border border-slate-300 rounded font-mono font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Incoterm</label>
                      <select
                        value={counterIncoterm}
                        onChange={(e) => setCounterIncoterm(e.target.value as IncotermType)}
                        className="w-full p-2 text-xs border border-slate-300 rounded font-mono"
                      >
                        <option value="EXW">EXW (Ambil di yard/depo)</option>
                        <option value="FOB">FOB (Diantar ke pelabuhan muat)</option>
                        <option value="CIF">CIF (Diantar sampai pelabuhan tujuan)</option>
                        <option value="DDP">DDP (Diantar sampai pabrik/smelter)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Tambahkan catatan negosiasi untuk rekanan..."
                      className="w-full p-2 text-xs border border-slate-300 rounded"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowOfferForm(false)}
                      className="px-3 py-1.5 text-xs text-slate-600"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs"
                    >
                      Kirim Penawaran Balik
                    </button>
                  </div>
                </form>
              )}

              {/* Standard Chat Input when form is closed */}
              {!showOfferForm && (
                <div className="p-3 border-t border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Tulis pesan untuk bernegosiasi (seluruh transaksi dijamin escrow)..."
                    className="flex-1 p-2.5 text-xs border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && messageText.trim()) {
                        handleSendOffer(e);
                      }
                    }}
                  />
                  <button
                    onClick={handleSendOffer}
                    disabled={!messageText.trim()}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">
              Pilih salah satu negosiasi dari daftar untuk melihat percakapan dan lembar penawaran.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
