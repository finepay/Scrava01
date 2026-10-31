import { db } from './db';
import {
  INITIAL_LISTINGS,
  MOCK_ORDERS,
  MOCK_NEGOTIATIONS,
  MOCK_REVERSE_BIDS,
  MOCK_COMPANY_PROFILES,
  MOCK_DISPUTES,
  MOCK_PROCUREMENT_PROJECTS,
  MOCK_AUDIT_LOGS,
  MOCK_PLATFORM_FEES,
  MOCK_BIDS,
} from '../src/data/mockData';

export function seedDatabaseIfEmpty() {
  const listingCount = db.prepare('SELECT COUNT(*) as count FROM listings').get() as { count: number };
  if (listingCount.count > 0) {
    return;
  }

  console.log('Seeding initial data into SQLite database scrava.db...');

  // 1. Seed Users & Companies
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, phone, role, company_name, business_type, is_google_auth, is_verified, is_buyer_verified, legal_docs, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertCompany = db.prepare(`
    INSERT INTO companies (id, name, country, city, address, business_type, verified, rating, completed_tx, legal_docs, kyc_status, full_profile)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Default initial users
  insertUser.run(
    'USR-01',
    'Hendra Wijaya',
    'hendra@scrava.id',
    '0812-3456-7890',
    'customer',
    'Depo Scrap Berkah Mandiri',
    'Depo Scrap & Pengepul Logam',
    1,
    1,
    1,
    JSON.stringify({ status: 'VERIFIED', nib: '9120001234567', npwp: '01.234.567.8-012.000' }),
    new Date().toISOString()
  );

  insertUser.run(
    'USR-ADMIN',
    'Superadmin Scrava',
    'admin@scrava.id',
    '021-5098-7700',
    'admin',
    'Scrava Operations HQ',
    'Platform Operator & Escrow Administrator',
    1,
    1,
    1,
    JSON.stringify({ status: 'VERIFIED' }),
    new Date().toISOString()
  );

  for (const comp of MOCK_COMPANY_PROFILES as any[]) {
    insertCompany.run(
      comp.id,
      comp.name,
      comp.country || 'Indonesia',
      comp.city || 'Jakarta',
      comp.address || 'Kawasan Industri',
      comp.businessType || 'Depo Scrap & Pengolahan',
      comp.verified ? 1 : 0,
      comp.rating || 5.0,
      comp.completedTransactions || comp.completedTx || 0,
      JSON.stringify(comp.legalDocs || { status: comp.kycStatus || 'VERIFIED' }),
      comp.kycStatus || 'VERIFIED',
      JSON.stringify(comp)
    );
  }

  // 2. Seed Listings
  const insertListing = db.prepare(`
    INSERT INTO listings (
      id, title, category, subcategory, description, quantity, unit, price_per_unit, currency, total_price,
      listing_type, condition, incoterm, location, seller, photos, specs, documents, status,
      min_asking_price, current_bid, bid_increment, bid_count, closing_date, closing_countdown, views_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of INITIAL_LISTINGS) {
    insertListing.run(
      item.id,
      item.title,
      item.category,
      item.subcategory || '',
      item.description || '',
      item.quantity,
      item.unit,
      item.pricePerUnit,
      item.currency || 'USD',
      item.totalPrice,
      item.listingType,
      item.condition,
      item.incoterm,
      JSON.stringify(item.location || {}),
      JSON.stringify(item.seller || {}),
      JSON.stringify(item.photos || []),
      JSON.stringify(item.specs || {}),
      JSON.stringify(item.documents || []),
      item.status || 'Published',
      item.minAskingPrice || null,
      item.currentBid || null,
      item.bidIncrement || null,
      item.bidCount || 0,
      item.closingDate || null,
      item.closingCountdown || null,
      item.viewsCount || 0,
      item.createdAt || new Date().toISOString()
    );
  }

  // 3. Seed Bids
  const insertBid = db.prepare(`
    INSERT INTO auction_bids (id, listing_id, bidder_company, bidder_country, amount, timestamp, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const bid of MOCK_BIDS) {
    insertBid.run(
      bid.id,
      bid.listingId,
      bid.bidderCompany,
      bid.bidderCountry,
      bid.amount,
      bid.timestamp,
      bid.status
    );
  }

  // 4. Seed Negotiations
  const insertNego = db.prepare(`
    INSERT INTO negotiations (
      id, listing_id, product_title, product_image, seller_company, buyer_company,
      current_offer_price, current_offer_qty, unit, currency, incoterm, status, updated_at, messages
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const nego of MOCK_NEGOTIATIONS) {
    insertNego.run(
      nego.id,
      nego.listingId,
      nego.productTitle,
      nego.productImage,
      nego.sellerCompany,
      nego.buyerCompany,
      nego.currentOfferPrice,
      nego.currentOfferQty,
      nego.unit,
      nego.currency,
      nego.incoterm,
      nego.status,
      nego.updatedAt,
      JSON.stringify(nego.messages || [])
    );
  }

  // 5. Seed Reverse Bids / RFQ
  const insertReverseBid = db.prepare(`
    INSERT INTO reverse_bids (
      id, title, category, material, grade, quantity, unit, target_price, currency,
      delivery_location, required_date, incoterm, specifications, deadline, buyer_company, buyer_country,
      buyer_verified, status, bids_count, lowest_bid, responses, allow_split_award, target_total_needed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const rb of MOCK_REVERSE_BIDS as any[]) {
    insertReverseBid.run(
      rb.id,
      rb.title,
      rb.category,
      rb.material,
      rb.grade,
      rb.quantity,
      rb.unit,
      rb.targetPrice,
      rb.currency,
      rb.deliveryLocation,
      rb.requiredDate,
      rb.incoterm,
      rb.specifications,
      rb.deadline,
      rb.buyerCompany,
      rb.buyerCountry,
      rb.buyerVerified ? 1 : 0,
      rb.status,
      rb.responsesCount || (rb.responses ? rb.responses.length : 0),
      rb.lowestBid || rb.targetPrice,
      JSON.stringify(rb.responses || []),
      rb.isSplitFulfilled !== false ? 1 : 0,
      rb.quantity
    );
  }

  // 6. Seed Orders
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, order_number, listing_id, product_title, product_image, buyer_company, seller_company,
      quantity, unit, price_per_unit, subtotal, escrow_fee, tax, total_amount, currency,
      status, payment_status, shipping_status, created_at, updated_at, full_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const ord of MOCK_ORDERS as any[]) {
    const pricePerUnit = ord.agreedPricePerUnit || 100;
    const subtotal = ord.totalOriginalValue || pricePerUnit * ord.quantity;
    const escrowFee = ord.settlement?.platformFee || subtotal * 0.015;
    const tax = ord.settlement?.taxes || subtotal * 0.11;
    const totalAmount = subtotal + escrowFee + tax;

    insertOrder.run(
      ord.id,
      ord.orderNumber,
      ord.listingId || '',
      ord.productTitle,
      ord.productImage || '',
      ord.buyerCompany,
      ord.sellerCompany,
      ord.quantity,
      ord.unit,
      pricePerUnit,
      subtotal,
      escrowFee,
      tax,
      totalAmount,
      ord.currency,
      ord.status,
      ord.paymentStatus,
      ord.pickupDetails?.status || 'Scheduled',
      ord.createdAt,
      ord.createdAt,
      JSON.stringify(ord)
    );
  }

  // 7. Seed Disputes
  const insertDispute = db.prepare(`
    INSERT INTO disputes (
      id, order_id, order_number, raised_by_company, defendant_company, reason,
      amount_disputed, currency, status, created_at, evidence, resolution
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const disp of MOCK_DISPUTES as any[]) {
    insertDispute.run(
      disp.id,
      disp.orderId,
      disp.orderNumber || '',
      disp.raisedByCompany,
      disp.againstCompany || 'Mitra Transaksi',
      disp.reason,
      disp.claimAmount || 500,
      disp.currency || 'USD',
      disp.status,
      disp.createdAt,
      JSON.stringify(disp.evidenceFiles || []),
      disp.adminDecision || null
    );
  }

  // 8. Seed Procurement Projects
  const insertProcurement = db.prepare(`
    INSERT INTO procurement_projects (
      id, title, factory_name, total_needed, unit, target_price, status, deadline,
      matched_suppliers, allocations, full_project
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const pp of MOCK_PROCUREMENT_PROJECTS as any[]) {
    insertProcurement.run(
      pp.id,
      pp.title,
      pp.buyerCompany || 'PT Pabrik Logam',
      pp.totalBudgetUSD || 150000,
      'MT',
      350,
      pp.status,
      pp.deadline,
      JSON.stringify(pp.items || []),
      JSON.stringify([]),
      JSON.stringify(pp)
    );
  }

  // 9. Seed Platform Fees
  const insertFee = db.prepare(`
    INSERT INTO platform_fees (id, name, percentage, fixed_amount, currency, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const fee of MOCK_PLATFORM_FEES as any[]) {
    insertFee.run(
      fee.id,
      fee.feeType || 'Platform Fee',
      parseFloat(fee.rate || '1.5'),
      parseFloat(fee.fixedAmount || '0'),
      'IDR',
      fee.applicableTo || fee.description || 'Biaya transaksi escrow'
    );
  }

  // 10. Seed Audit Logs
  const insertLog = db.prepare(`
    INSERT INTO audit_logs (id, action, performed_by, target_id, timestamp, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const log of MOCK_AUDIT_LOGS as any[]) {
    insertLog.run(
      log.id,
      log.action,
      log.user || 'Admin',
      log.entityId || log.entity || '',
      log.timestamp,
      log.details
    );
  }

  // 11. Seed Project Auctions
  const projectAuctionCount = db.prepare('SELECT COUNT(*) as count FROM project_auctions').get() as { count: number };
  if (projectAuctionCount.count === 0) {
    const insertProjectAuction = db.prepare(`
      INSERT INTO project_auctions (
        id, title, category, description, photos, starting_bid, current_highest_bid, bid_increment,
        security_deposit, deposit_deduction_fee, status, winner_company, winner_bid, winner_settlement_status,
        location, aanwijzing_date, deadline, seller_company, total_bids, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertProjectAuction.run(
      'PRJ-AUC-101',
      'Lelang Scrap Pembongkaran Pabrik Semen & Silo Baja Cilegon (450 MT)',
      'Besi Baja & Heavy Equipment',
      'Paket lelang scrap pembongkaran pabrik semen terintegrasi meliputi silo baja, rangka baja berat WF/H-Beam, motor listrik induksi, dan ball mill. Wajib setoran uang jaminan lelang sebelum penawaran via OTP. Bagi pemenang wajib pelunasan H+3. Peserta kalah mendapatkan pengembalian jaminan penuh dipotong biaya administrasi resmi Rp 500.000.',
      JSON.stringify([
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
      ]),
      1800000000,
      1950000000,
      25000000,
      50000000,
      500000,
      'OPEN',
      null,
      null,
      'PENDING_PAYMENT',
      'Kawasan Industri Krakatau Cilegon, Banten',
      '2026-11-06 (09:00 WIB)',
      '2026-11-12 15:00',
      'PT Krakatau Industrial Facilities',
      6,
      new Date().toISOString()
    );

    insertProjectAuction.run(
      'PRJ-AUC-102',
      'Lelang Proyek Scrap Pipa Baja Seamless Eks Pipa Gas Offshore (280 MT)',
      'Pipa Baja & Non-Ferrous',
      'Lelang scrap pipa seamless API 5L grade B eks jalur transmisi gas bawah laut. Lokasi penumpukan di dermaga pelabuhan Cilegon. Uang jaminan lelang Rp 30.000.000. Penawaran wajib diverifikasi dengan kode OTP sah setiap penawaran.',
      JSON.stringify([
        'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      ]),
      1200000000,
      1260000000,
      20000000,
      30000000,
      300000,
      'OPEN',
      null,
      null,
      'PENDING_PAYMENT',
      'Pelabuhan Cilegon Logistics Base, Banten',
      '2026-11-08 (10:00 WIB)',
      '2026-11-15 16:00',
      'PT Energi Sarana Mandiri',
      4,
      new Date().toISOString()
    );

    insertProjectAuction.run(
      'PRJ-AUC-103',
      'Lelang Clearance Mesin Bubut CNC & Motor Listrik Industri Ex Pabrik Otomotif (15 Lot)',
      'Industrial Machinery',
      'Lelang likuidasi mesin pabrik otomotif: 6 unit CNC Mazak, 4 unit bubut manual, trafo 500kVA, dan scrap tembaga panel. Status telah dimenangkan, pemenang lelang dalam proses pelunasan sisa tagihan.',
      JSON.stringify([
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80',
      ]),
      850000000,
      920000000,
      15000000,
      25000000,
      250000,
      'AWARDED',
      'PT Surya Logam Presisi',
      920000000,
      'PENDING_PAYMENT',
      'Kawasan Industri GIIC Cikarang Pusat, Jawa Barat',
      '2026-10-20',
      '2026-10-28 14:00',
      'PT Indo Autoparts Manufacturing',
      8,
      new Date().toISOString()
    );

    // Initial project bids
    const insertPBid = db.prepare(`
      INSERT INTO project_bids (id, project_id, bidder_company, amount, otp_code, otp_verified, status, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPBid.run('PBID-101-1', 'PRJ-AUC-101', 'PT Cilegon Steel Recycler', 1850000000, '491028', 1, 'OUTBID', '2026-10-29 10:15');
    insertPBid.run('PBID-101-2', 'PRJ-AUC-101', 'CV Berkah Baja Nusantara', 1900000000, '712834', 1, 'OUTBID', '2026-10-29 14:30');
    insertPBid.run('PBID-101-3', 'PRJ-AUC-101', 'Depo Scrap Berkah Mandiri', 1950000000, '903412', 1, 'WINNING', '2026-10-30 11:20');

    // Initial deposit record for testing
    const insertDeposit = db.prepare(`
      INSERT INTO auction_deposits (id, project_id, company_name, amount, va_number, bank, status, deduction_amount, net_refund_amount, created_at, verified_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertDeposit.run(
      'DEP-101-01',
      'PRJ-AUC-101',
      'Depo Scrap Berkah Mandiri',
      50000000,
      '8277 0812 3456 7890',
      'BCA Escrow',
      'VERIFIED',
      0,
      0,
      '2026-10-28 09:00',
      '2026-10-28 09:15'
    );
  }

  console.log('Database successfully seeded with SQLite records.');
}
