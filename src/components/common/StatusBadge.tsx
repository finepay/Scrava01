import React from 'react';
import { OrderStatus } from '../../types';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'listing' | 'kyc' | 'dispute' | 'default';
}

const statusTranslations: Record<string, string> = {
  COMPLETED: 'Selesai',
  PAID: 'Sudah Bayar',
  VERIFIED: 'Terverifikasi',
  APPROVED: 'Disetujui',
  SETTLED: 'Dana Cair',
  PUBLISHED: 'Tayang',
  ACCEPTED: 'Diterima',
  ACTIVE: 'Aktif',
  OPEN: 'Terbuka',
  PENDING: 'Menunggu',
  PAYMENT_PENDING: 'Menunggu Pembayaran',
  PICKUP_SCHEDULED: 'Jadwal Kirim / Muat',
  IN_TRANSIT: 'Dalam Perjalanan',
  DELIVERED: 'Tiba di Pabrik',
  WEIGHING: 'Timbangan Jembatan',
  QC: 'Uji Lab & Kadar',
  SETTLEMENT: 'Pencairan Escrow',
  COUNTERED: 'Nego Balasan',
  UNDER_REVIEW: 'Sedang Ditinjau',
  NEEDS_UPDATE: 'Perlu Perbaikan',
  AUCTION: 'Lelang',
  DISPUTED: 'Sengketa',
  REJECTED: 'Ditolak',
  FAILED: 'Gagal',
  SUSPENDED: 'Ditangguhkan',
  HIGH: 'Prioritas Tinggi',
  FIXED_PRICE: 'Harga Tetap',
  FREE_PICKUP: 'Ambil Gratis',
  CLOSED: 'Ditutup',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'default' }) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  const s = status.toUpperCase();

  if (
    s === 'COMPLETED' ||
    s === 'PAID' ||
    s === 'VERIFIED' ||
    s === 'APPROVED' ||
    s === 'SETTLED' ||
    s === 'PUBLISHED' ||
    s === 'ACCEPTED' ||
    s === 'ACTIVE'
  ) {
    style = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (
    s === 'PENDING' ||
    s === 'PAYMENT_PENDING' ||
    s === 'PICKUP_SCHEDULED' ||
    s === 'IN_TRANSIT' ||
    s === 'WEIGHING' ||
    s === 'QC' ||
    s === 'SETTLEMENT' ||
    s === 'COUNTERED' ||
    s === 'UNDER_REVIEW' ||
    s === 'NEEDS_UPDATE' ||
    s === 'AUCTION' ||
    s === 'OPEN'
  ) {
    style = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (
    s === 'DISPUTED' ||
    s === 'REJECTED' ||
    s === 'FAILED' ||
    s === 'SUSPENDED' ||
    s === 'HIGH'
  ) {
    style = 'bg-rose-50 text-rose-800 border-rose-200';
  } else if (s === 'FIXED_PRICE' || s === 'EXW' || s === 'FOB' || s === 'CIF' || s === 'DDP') {
    style = 'bg-slate-100 text-slate-800 border-slate-200';
  }

  const label = statusTranslations[s] || status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold tracking-tight rounded border ${style} whitespace-nowrap`}
    >
      {label}
    </span>
  );
};
