import { Router, Request, Response } from 'express';
import { db } from './db';

export const apiRouter = Router();

// Helper to safely parse JSON
function parseJson(str: string | null | undefined, defaultValue: any = null) {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

// ----------------------------------------------------
// 1. AUTH & USER ENDPOINTS
// ----------------------------------------------------

let activeSessionUser: any = null;

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  res.json({ user: activeSessionUser });
});

apiRouter.get('/server-time', (req: Request, res: Response) => {
  const now = new Date();
  res.json({
    iso: now.toISOString(),
    timestamp: now.getTime(),
    formattedWIB: now.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour12: false,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + ' WIB',
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  let user = null;
  if (email) {
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (row) {
      user = {
        ...row,
        isGoogleAuth: Boolean(row.is_google_auth),
        isVerified: Boolean(row.is_verified),
        isBuyerVerified: Boolean(row.is_buyer_verified),
        companyName: row.company_name,
        businessType: row.business_type,
        legalDocs: parseJson(row.legal_docs, {}),
      };
    }
  }

  // Fallback demo user if not found in db or role selected
  if (!user) {
    const targetRole = role || (email && email.includes('admin') ? 'admin' : 'customer');
    const newId = `USR-${Date.now().toString().slice(-5)}`;
    const name = email ? email.split('@')[0] : (targetRole === 'admin' ? 'Admin Scrava' : 'Pengguna Scrava');
    const companyName = targetRole === 'admin' ? 'Scrava HQ Ops' : 'PT Logam Lestari Mandiri';
    
    db.prepare(`
      INSERT OR REPLACE INTO users (id, name, email, phone, role, company_name, business_type, is_google_auth, is_verified, is_buyer_verified, legal_docs, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId,
      name,
      email || `${name.toLowerCase()}@scrava.id`,
      '0812-3456-7890',
      targetRole,
      companyName,
      'Perusahaan Industri & Daur Ulang',
      1,
      1,
      targetRole === 'admin' ? 1 : 0,
      JSON.stringify({ status: targetRole === 'admin' ? 'VERIFIED' : 'PENDING' }),
      new Date().toISOString()
    );

    user = {
      id: newId,
      name,
      email: email || `${name.toLowerCase()}@scrava.id`,
      phone: '0812-3456-7890',
      role: targetRole,
      companyName,
      businessType: 'Perusahaan Industri & Daur Ulang',
      isGoogleAuth: true,
      isVerified: true,
      isBuyerVerified: targetRole === 'admin',
      legalDocs: { status: targetRole === 'admin' ? 'VERIFIED' : 'PENDING' },
    };
  }

  activeSessionUser = user;
  res.json({ success: true, user });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, companyName, businessType, role } = req.body;
  const id = `USR-${Date.now().toString().slice(-6)}`;
  const userRole = role || 'customer';

  try {
    db.prepare(`
      INSERT INTO users (id, name, email, phone, role, company_name, business_type, is_google_auth, is_verified, is_buyer_verified, legal_docs, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name || 'Pengguna Baru',
      email || `user_${Date.now()}@scrava.id`,
      phone || '',
      userRole,
      companyName || 'Usaha Scrap Mandiri',
      businessType || 'Pengepul / Depo Scrap',
      0,
      1,
      0,
      JSON.stringify({ status: 'UNVERIFIED' }),
      new Date().toISOString()
    );

    // Also register company
    const compId = `COMP-${Date.now().toString().slice(-5)}`;
    db.prepare(`
      INSERT INTO companies (id, name, country, city, address, business_type, verified, rating, completed_tx, legal_docs, kyc_status, full_profile)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      compId,
      companyName || 'Usaha Scrap Mandiri',
      'Indonesia',
      'Jakarta',
      'Kawasan Industri',
      businessType || 'Pengepul / Depo Scrap',
      0,
      5.0,
      0,
      JSON.stringify({ status: 'UNVERIFIED' }),
      'UNVERIFIED',
      JSON.stringify({ id: compId, name: companyName, country: 'Indonesia' })
    );

    const newUser = {
      id,
      name,
      email,
      phone,
      role: userRole,
      companyName,
      businessType,
      isGoogleAuth: false,
      isVerified: true,
      isBuyerVerified: false,
      legalDocs: { status: 'UNVERIFIED' },
    };

    activeSessionUser = newUser;
    res.json({ success: true, user: newUser });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  activeSessionUser = null;
  res.json({ success: true });
});

apiRouter.post('/auth/verify-buyer', (req: Request, res: Response) => {
  const { companyName, nib, npwp, phone, picName, businessType, address } = req.body;
  if (activeSessionUser) {
    activeSessionUser.isBuyerVerified = true;
    activeSessionUser.companyName = companyName || activeSessionUser.companyName;
    activeSessionUser.legalDocs = {
      status: 'VERIFIED',
      nib: nib || '9120009876543',
      npwp: npwp || '01.234.567.8-012.000',
      companyLegalName: companyName,
      verifiedAt: new Date().toISOString(),
    };

    db.prepare(`
      UPDATE users SET
        is_buyer_verified = 1,
        company_name = ?,
        legal_docs = ?
      WHERE id = ?
    `).run(activeSessionUser.companyName, JSON.stringify(activeSessionUser.legalDocs), activeSessionUser.id);
  }
  res.json({ success: true, user: activeSessionUser });
});

// ----------------------------------------------------
// 2. LISTINGS & AUCTIONS
// ----------------------------------------------------

function mapListingRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    subcategory: row.subcategory,
    description: row.description,
    quantity: row.quantity,
    unit: row.unit,
    pricePerUnit: row.price_per_unit,
    currency: row.currency,
    totalPrice: row.total_price,
    listingType: row.listing_type,
    condition: row.condition,
    incoterm: row.incoterm,
    location: parseJson(row.location, {}),
    seller: parseJson(row.seller, {}),
    photos: parseJson(row.photos, []),
    specs: parseJson(row.specs, {}),
    documents: parseJson(row.documents, []),
    status: row.status,
    minAskingPrice: row.min_asking_price,
    currentBid: row.current_bid,
    bidIncrement: row.bid_increment,
    bidCount: row.bid_count,
    closingDate: row.closing_date,
    closingCountdown: row.closing_countdown,
    viewsCount: row.views_count,
    createdAt: row.created_at,
    isPaidPromotion: Boolean(row.is_paid_promotion),
    promotionTier: row.promotion_tier || 'FREE',
  };
}

apiRouter.get('/listings', (req: Request, res: Response) => {
  const { category, type, search } = req.query;

  let query = 'SELECT * FROM listings WHERE 1=1';
  const params: any[] = [];

  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (type) {
    query += ' AND listing_type = ?';
    params.push(type);
  }

  if (search) {
    query += ' AND (title LIKE ? OR category LIKE ? OR subcategory LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY created_at DESC';

  const rows = db.prepare(query).all(...params);
  const listings = rows.map(mapListingRow);
  res.json(listings);
});

apiRouter.get('/listings/:id', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
  if (!row) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  // increment views count
  db.prepare('UPDATE listings SET views_count = views_count + 1 WHERE id = ?').run(req.params.id);
  res.json(mapListingRow(row));
});

apiRouter.post('/listings', (req: Request, res: Response) => {
  const item = req.body;
  const id = item.id || `LIST-${Date.now().toString().slice(-6)}`;
  const totalPrice = item.totalPrice || ((item.pricePerUnit || 0) * (item.quantity || 0));

  db.prepare(`
    INSERT INTO listings (
      id, title, category, subcategory, description, quantity, unit, price_per_unit, currency, total_price,
      listing_type, condition, incoterm, location, seller, photos, specs, documents, status,
      min_asking_price, current_bid, bid_increment, bid_count, closing_date, closing_countdown, views_count, created_at,
      is_paid_promotion, promotion_tier
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    item.title || 'Material Scrap Industri',
    item.category || 'Ferrous Metals',
    item.subcategory || '',
    item.description || '',
    item.quantity || 1,
    item.unit || 'MT',
    item.pricePerUnit || 0,
    item.currency || 'USD',
    totalPrice,
    item.listingType || 'FIXED_PRICE',
    item.condition || 'Processed',
    item.incoterm || 'FOB',
    JSON.stringify(item.location || { country: 'Indonesia', city: 'Surabaya', address: 'Gudang Scrap' }),
    JSON.stringify(item.seller || {
      id: 'COMP-MY',
      companyName: activeSessionUser?.companyName || 'Depo Scrap Berkah Mandiri',
      verified: true,
      rating: 5.0,
      completedTx: 12,
      country: 'Indonesia',
      responseRate: '100%',
    }),
    JSON.stringify(item.photos || ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80']),
    JSON.stringify(item.specs || {}),
    JSON.stringify(item.documents || ['Surat Jalan & Timbang']),
    item.status || 'Published',
    item.minAskingPrice || null,
    item.currentBid || null,
    item.bidIncrement || 50,
    item.bidCount || 0,
    item.closingDate || null,
    item.closingCountdown || null,
    0,
    new Date().toISOString(),
    item.isPaidPromotion ? 1 : 0,
    item.promotionTier || (item.isPaidPromotion ? 'PAID' : 'FREE')
  );

  const created = db.prepare('SELECT * FROM listings WHERE id = ?').get(id);
  res.status(201).json(mapListingRow(created));
});

apiRouter.patch('/listings/:id', (req: Request, res: Response) => {
  const { status, currentBid, bidCount } = req.body;
  if (status) {
    db.prepare('UPDATE listings SET status = ? WHERE id = ?').run(status, req.params.id);
  }
  if (currentBid !== undefined) {
    db.prepare('UPDATE listings SET current_bid = ?, bid_count = ? WHERE id = ?').run(currentBid, bidCount, req.params.id);
  }
  const updated = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
  res.json(mapListingRow(updated));
});

apiRouter.delete('/listings/:id', (req: Request, res: Response) => {
  db.prepare('DELETE FROM listings WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

apiRouter.post('/listings/:id/bid', (req: Request, res: Response) => {
  const { amount, bidderCompany, bidderCountry } = req.body;
  const listingId = req.params.id;

  const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(listingId) as any;
  if (!listing) {
    return res.status(404).json({ success: false, message: 'Listing lelang tidak ditemukan.' });
  }

  const currentBid = listing.current_bid || listing.min_asking_price || 0;
  if (amount <= currentBid) {
    return res.status(400).json({
      success: false,
      message: `Tawaran Anda harus lebih tinggi dari tawaran saat ini ($${currentBid.toLocaleString()}).`,
    });
  }

  const bidId = `BID-${Date.now().toString().slice(-6)}`;
  db.prepare(`
    INSERT INTO auction_bids (id, listing_id, bidder_company, bidder_country, amount, timestamp, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    bidId,
    listingId,
    bidderCompany || activeSessionUser?.companyName || 'PT Pengadaan Baja Utama',
    bidderCountry || 'Indonesia',
    amount,
    new Date().toISOString(),
    'WINNING'
  );

  // Update listing current bid & count
  const newCount = (listing.bid_count || 0) + 1;
  db.prepare('UPDATE listings SET current_bid = ?, bid_count = ? WHERE id = ?').run(amount, newCount, listingId);

  res.json({ success: true, message: `Tawaran Anda sebesar $${amount.toLocaleString()} berhasil dipasang!`, currentBid: amount, bidCount: newCount });
});

// ----------------------------------------------------
// 3. NEGOTIATIONS
// ----------------------------------------------------

function mapNegoRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    listingId: row.listing_id,
    productTitle: row.product_title,
    productImage: row.product_image,
    sellerCompany: row.seller_company,
    buyerCompany: row.buyer_company,
    currentOfferPrice: row.current_offer_price,
    currentOfferQty: row.current_offer_qty,
    unit: row.unit,
    currency: row.currency,
    incoterm: row.incoterm,
    status: row.status,
    updatedAt: row.updated_at,
    messages: parseJson(row.messages, []),
  };
}

apiRouter.get('/negotiations', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM negotiations ORDER BY updated_at DESC').all();
  res.json(rows.map(mapNegoRow));
});

apiRouter.get('/negotiations/:id', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM negotiations WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Negosiasi tidak ditemukan' });
  res.json(mapNegoRow(row));
});

apiRouter.post('/negotiations/:id/offer', (req: Request, res: Response) => {
  const { offer, text } = req.body;
  const row = db.prepare('SELECT * FROM negotiations WHERE id = ?').get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: 'Negosiasi tidak ditemukan' });

  const messages = parseJson(row.messages, []);
  const newMsg = {
    id: `MSG-${Date.now().toString().slice(-6)}`,
    senderCompany: activeSessionUser?.companyName || 'PT Pembeli Scrap',
    senderRole: 'buyer',
    text: text || 'Menawarkan penyesuaian harga dan volume untuk kontrak pengadaan.',
    timestamp: new Date().toISOString(),
    offer: {
      pricePerUnit: offer.pricePerUnit,
      quantity: offer.quantity,
      unit: offer.unit || row.unit,
      incoterm: offer.incoterm || row.incoterm,
      totalAmount: offer.pricePerUnit * offer.quantity,
      notes: offer.notes || '',
    },
  };

  messages.push(newMsg);

  db.prepare(`
    UPDATE negotiations SET
      current_offer_price = ?,
      current_offer_qty = ?,
      status = 'Countered',
      updated_at = ?,
      messages = ?
    WHERE id = ?
  `).run(offer.pricePerUnit, offer.quantity, new Date().toISOString(), JSON.stringify(messages), req.params.id);

  const updated = db.prepare('SELECT * FROM negotiations WHERE id = ?').get(req.params.id);
  res.json(mapNegoRow(updated));
});

apiRouter.post('/negotiations/:id/accept', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM negotiations WHERE id = ?').get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: 'Negosiasi tidak ditemukan' });

  db.prepare(`UPDATE negotiations SET status = 'Accepted', updated_at = ? WHERE id = ?`).run(
    new Date().toISOString(),
    req.params.id
  );

  // Generate binding escrow order from accepted negotiation
  const orderId = `ORD-${Date.now().toString().slice(-6)}`;
  const orderNumber = `SCR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const subtotal = row.current_offer_price * row.current_offer_qty;
  const escrowFee = subtotal * 0.015;
  const tax = subtotal * 0.11;
  const totalAmount = subtotal + escrowFee + tax;

  const fullOrder = {
    id: orderId,
    orderNumber,
    listingId: row.listing_id,
    productTitle: row.product_title,
    productImage: row.product_image,
    buyerCompany: row.buyer_company,
    sellerCompany: row.seller_company,
    quantity: row.current_offer_qty,
    unit: row.unit,
    pricePerUnit: row.current_offer_price,
    subtotal,
    escrowFee,
    tax,
    totalAmount,
    currency: row.currency,
    status: 'ESCROW_PENDING',
    paymentStatus: 'UNPAID',
    shippingStatus: 'PENDING_DISPATCH',
    milestones: [
      { id: 'M1', title: 'Negosiasi Selesai & Kontrak Dibuat', status: 'COMPLETED', timestamp: new Date().toISOString() },
      { id: 'M2', title: 'Dana Escrow Masuk Rekening Bersama', status: 'IN_PROGRESS' },
      { id: 'M3', title: 'Pemuatan & Timbang Pabrik', status: 'PENDING' },
      { id: 'M4', title: 'Konfirmasi Penerimaan & Uji QC', status: 'PENDING' },
      { id: 'M5', title: 'Pelepasan Dana Otomatis', status: 'PENDING' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO orders (
      id, order_number, listing_id, product_title, product_image, buyer_company, seller_company,
      quantity, unit, price_per_unit, subtotal, escrow_fee, tax, total_amount, currency,
      status, payment_status, shipping_status, created_at, updated_at, full_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    orderId,
    orderNumber,
    row.listing_id,
    row.product_title,
    row.product_image,
    row.buyer_company,
    row.seller_company,
    row.current_offer_qty,
    row.unit,
    row.current_offer_price,
    subtotal,
    escrowFee,
    tax,
    totalAmount,
    row.currency,
    'ESCROW_PENDING',
    'UNPAID',
    'PENDING_DISPATCH',
    new Date().toISOString(),
    new Date().toISOString(),
    JSON.stringify(fullOrder)
  );

  const updatedNego = db.prepare('SELECT * FROM negotiations WHERE id = ?').get(req.params.id);
  res.json({ negotiation: mapNegoRow(updatedNego), createdOrder: fullOrder });
});

// ----------------------------------------------------
// 4. ORDERS & ESCROW
// ----------------------------------------------------

function mapOrderRow(row: any) {
  if (!row) return null;
  const fullOrder = parseJson(row.full_order, {});
  return {
    ...fullOrder,
    id: row.id,
    orderNumber: row.order_number,
    listingId: row.listing_id,
    productTitle: row.product_title,
    productImage: row.product_image,
    buyerCompany: row.buyer_company,
    sellerCompany: row.seller_company,
    quantity: row.quantity,
    unit: row.unit,
    pricePerUnit: row.price_per_unit,
    subtotal: row.subtotal,
    escrowFee: row.escrow_fee,
    tax: row.tax,
    totalAmount: row.total_amount,
    currency: row.currency,
    status: row.status,
    paymentStatus: row.payment_status,
    shippingStatus: row.shipping_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

apiRouter.get('/orders', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json(rows.map(mapOrderRow));
});

apiRouter.get('/orders/:id', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Order tidak ditemukan' });
  res.json(mapOrderRow(row));
});

apiRouter.post('/orders', (req: Request, res: Response) => {
  const body = req.body;
  const id = body.id || `ORD-${Date.now().toString().slice(-6)}`;
  const orderNumber = body.orderNumber || `SCR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const subtotal = body.subtotal || ((body.pricePerUnit || 0) * (body.quantity || 1));
  const escrowFee = body.escrowFee || (subtotal * 0.015);
  const tax = body.tax || (subtotal * 0.11);
  const totalAmount = body.totalAmount || (subtotal + escrowFee + tax);

  const fullOrder = {
    ...body,
    id,
    orderNumber,
    subtotal,
    escrowFee,
    tax,
    totalAmount,
    status: body.status || 'ESCROW_FUNDED',
    paymentStatus: body.paymentStatus || 'HELD_IN_ESCROW',
    shippingStatus: body.shippingStatus || 'DISPATCH_IN_PROGRESS',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO orders (
      id, order_number, listing_id, product_title, product_image, buyer_company, seller_company,
      quantity, unit, price_per_unit, subtotal, escrow_fee, tax, total_amount, currency,
      status, payment_status, shipping_status, created_at, updated_at, full_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    orderNumber,
    body.listingId || '',
    body.productTitle || 'Material Scrap Industri',
    body.productImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    body.buyerCompany || activeSessionUser?.companyName || 'PT Pembeli Bersama',
    body.sellerCompany || 'PT Nusantara Metalindo Mandiri',
    body.quantity || 10,
    body.unit || 'MT',
    body.pricePerUnit || 100,
    subtotal,
    escrowFee,
    tax,
    totalAmount,
    body.currency || 'USD',
    fullOrder.status,
    fullOrder.paymentStatus,
    fullOrder.shippingStatus,
    fullOrder.createdAt,
    fullOrder.updatedAt,
    JSON.stringify(fullOrder)
  );

  res.status(201).json(fullOrder);
});

apiRouter.patch('/orders/:id/status', (req: Request, res: Response) => {
  const { status, paymentStatus, shippingStatus } = req.body;
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: 'Order tidak ditemukan' });

  const fullOrder = parseJson(row.full_order, {});
  fullOrder.status = status || fullOrder.status;
  if (paymentStatus) fullOrder.paymentStatus = paymentStatus;
  if (shippingStatus) fullOrder.shippingStatus = shippingStatus;
  fullOrder.updatedAt = new Date().toISOString();

  db.prepare(`
    UPDATE orders SET
      status = ?,
      payment_status = COALESCE(?, payment_status),
      shipping_status = COALESCE(?, shipping_status),
      updated_at = ?,
      full_order = ?
    WHERE id = ?
  `).run(
    status || row.status,
    paymentStatus || null,
    shippingStatus || null,
    new Date().toISOString(),
    JSON.stringify(fullOrder),
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  res.json(mapOrderRow(updated));
});

apiRouter.post('/orders/:id/settle', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: 'Order tidak ditemukan' });

  const fullOrder = parseJson(row.full_order, {});
  fullOrder.status = 'SETTLEMENT';
  fullOrder.paymentStatus = 'RELEASED_TO_SELLER';
  fullOrder.shippingStatus = 'DELIVERED';
  fullOrder.updatedAt = new Date().toISOString();

  db.prepare(`
    UPDATE orders SET
      status = 'SETTLEMENT',
      payment_status = 'RELEASED_TO_SELLER',
      shipping_status = 'DELIVERED',
      updated_at = ?,
      full_order = ?
    WHERE id = ?
  `).run(new Date().toISOString(), JSON.stringify(fullOrder), req.params.id);

  // Add audit log
  db.prepare(`
    INSERT INTO audit_logs (id, action, performed_by, target_id, timestamp, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    `LOG-${Date.now().toString().slice(-6)}`,
    'ESCROW_SETTLEMENT_RELEASED',
    activeSessionUser?.name || 'Escrow Smart Protocol',
    req.params.id,
    new Date().toISOString(),
    `Dana escrow sebesar ${row.currency} ${row.total_amount.toLocaleString()} berhasil dicairkan ke penjual.`
  );

  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  res.json(mapOrderRow(updated));
});

// ----------------------------------------------------
// 5. REVERSE BIDS / TENDER DICARI PABRIK
// ----------------------------------------------------

function mapReverseBidRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    material: row.material,
    grade: row.grade,
    quantity: row.quantity,
    unit: row.unit,
    targetPrice: row.target_price,
    currency: row.currency,
    deliveryLocation: row.delivery_location,
    requiredDate: row.required_date,
    incoterm: row.incoterm,
    specifications: row.specifications,
    deadline: row.deadline,
    buyerCompany: row.buyer_company,
    buyerCountry: row.buyer_country,
    buyerVerified: Boolean(row.buyer_verified),
    status: row.status,
    bidsCount: row.bids_count,
    lowestBid: row.lowest_bid,
    responses: parseJson(row.responses, []),
    allowSplitAward: Boolean(row.allow_split_award),
    targetTotalNeeded: row.target_total_needed,
  };
}

apiRouter.get('/reverse-bids', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM reverse_bids ORDER BY id DESC').all();
  res.json(rows.map(mapReverseBidRow));
});

apiRouter.get('/reverse-bids/:id', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM reverse_bids WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Tender tidak ditemukan' });
  res.json(mapReverseBidRow(row));
});

apiRouter.post('/reverse-bids', (req: Request, res: Response) => {
  const item = req.body;
  const id = item.id || `RFQ-${Date.now().toString().slice(-6)}`;

  db.prepare(`
    INSERT INTO reverse_bids (
      id, title, category, material, grade, quantity, unit, target_price, currency,
      delivery_location, required_date, incoterm, specifications, deadline, buyer_company, buyer_country,
      buyer_verified, status, bids_count, lowest_bid, responses, allow_split_award, target_total_needed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    item.title || 'Kebutuhan Scrap Pabrik',
    item.category || 'Ferrous Metals',
    item.material || 'Besi HMS',
    item.grade || 'Grade 1',
    item.quantity || 100,
    item.unit || 'MT',
    item.targetPrice || 350,
    item.currency || 'USD',
    item.deliveryLocation || 'Karawang, Jawa Barat',
    item.requiredDate || '2026-11-15',
    item.incoterm || 'DDP',
    item.specifications || 'Spesifikasi standar pabrik smelter',
    item.deadline || '2026-11-10',
    item.buyerCompany || activeSessionUser?.companyName || 'PT Pabrik Peleburan Logam',
    item.buyerCountry || 'Indonesia',
    1,
    'OPEN',
    0,
    null,
    JSON.stringify([]),
    item.allowSplitAward !== false ? 1 : 0,
    item.targetTotalNeeded || item.quantity || 100
  );

  const created = db.prepare('SELECT * FROM reverse_bids WHERE id = ?').get(id);
  res.status(201).json(mapReverseBidRow(created));
});

apiRouter.post('/reverse-bids/:id/offer', (req: Request, res: Response) => {
  const { offer } = req.body;
  const row = db.prepare('SELECT * FROM reverse_bids WHERE id = ?').get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: 'Tender tidak ditemukan' });

  const responses = parseJson(row.responses, []);
  const newResponse = {
    id: `RSP-${Date.now().toString().slice(-6)}`,
    requirementId: req.params.id,
    sellerCompany: activeSessionUser?.companyName || offer.sellerCompany || 'Depo Scrap Berkah Mandiri',
    sellerCountry: 'Indonesia',
    sellerVerified: true,
    pricePerUnit: offer.pricePerUnit || row.target_price,
    quantityOffered: offer.quantityOffered || row.quantity,
    unit: offer.unit || row.unit,
    incoterm: offer.incoterm || row.incoterm,
    deliveryTimeline: offer.deliveryTimeline || '7-10 Hari',
    pickupOption: offer.pickupOption || 'Included',
    qcIncluded: offer.qcIncluded !== false,
    notes: offer.notes || '',
    submittedAt: new Date().toISOString(),
    status: 'PENDING',
    scravaScore: { onTime: 96, accuracy: 98, quality: 95, overall: 96 },
  };

  responses.push(newResponse);
  const newCount = responses.length;
  const lowest = Math.min(...responses.map((r: any) => r.pricePerUnit));

  db.prepare(`
    UPDATE reverse_bids SET
      responses = ?,
      bids_count = ?,
      lowest_bid = ?
    WHERE id = ?
  `).run(JSON.stringify(responses), newCount, lowest, req.params.id);

  const updated = db.prepare('SELECT * FROM reverse_bids WHERE id = ?').get(req.params.id);
  res.json(mapReverseBidRow(updated));
});

apiRouter.post('/reverse-bids/:id/split-order', (req: Request, res: Response) => {
  const { allocations } = req.body;
  const row = db.prepare('SELECT * FROM reverse_bids WHERE id = ?').get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: 'Tender tidak ditemukan' });

  // Update reverse bid status to AWARDED
  db.prepare(`UPDATE reverse_bids SET status = 'AWARDED' WHERE id = ?`).run(req.params.id);

  // Create child escrow orders for each supplier allocated
  const createdOrders: any[] = [];
  for (const alloc of allocations) {
    const orderId = `ORD-SPLIT-${Date.now().toString().slice(-5)}-${Math.floor(Math.random() * 900)}`;
    const subtotal = alloc.unitPrice * alloc.allocatedQty;
    const escrowFee = subtotal * 0.015;
    const tax = subtotal * 0.11;
    const totalAmount = subtotal + escrowFee + tax;

    const ord = {
      id: orderId,
      orderNumber: `SPLIT-${Math.floor(1000 + Math.random() * 9000)}`,
      productTitle: `[Split Order] ${row.material} (${alloc.allocatedQty} ${row.unit})`,
      buyerCompany: row.buyer_company,
      sellerCompany: alloc.supplierCompany,
      quantity: alloc.allocatedQty,
      unit: row.unit,
      pricePerUnit: alloc.unitPrice,
      subtotal,
      escrowFee,
      tax,
      totalAmount,
      currency: row.currency,
      status: 'ESCROW_FUNDED',
      paymentStatus: 'HELD_IN_ESCROW',
      shippingStatus: 'SCHEDULED_PICKUP',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.prepare(`
      INSERT INTO orders (
        id, order_number, product_title, product_image, buyer_company, seller_company,
        quantity, unit, price_per_unit, subtotal, escrow_fee, tax, total_amount, currency,
        status, payment_status, shipping_status, created_at, updated_at, full_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      ord.orderNumber,
      ord.productTitle,
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      ord.buyerCompany,
      ord.sellerCompany,
      ord.quantity,
      ord.unit,
      ord.pricePerUnit,
      subtotal,
      escrowFee,
      tax,
      totalAmount,
      ord.currency,
      ord.status,
      ord.paymentStatus,
      ord.shippingStatus,
      ord.createdAt,
      ord.updatedAt,
      JSON.stringify(ord)
    );
    createdOrders.push(ord);
  }

  res.json({ success: true, createdOrders });
});

// ----------------------------------------------------
// 6. DISPUTES
// ----------------------------------------------------

function mapDisputeRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    orderId: row.order_id,
    orderNumber: row.order_number,
    raisedByCompany: row.raised_by_company,
    defendantCompany: row.defendant_company,
    reason: row.reason,
    amountDisputed: row.amount_disputed,
    currency: row.currency,
    status: row.status,
    createdAt: row.created_at,
    evidence: parseJson(row.evidence, []),
    resolution: row.resolution,
  };
}

apiRouter.get('/disputes', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM disputes ORDER BY created_at DESC').all();
  res.json(rows.map(mapDisputeRow));
});

apiRouter.post('/disputes', (req: Request, res: Response) => {
  const item = req.body;
  const id = item.id || `DISP-${Date.now().toString().slice(-6)}`;

  db.prepare(`
    INSERT INTO disputes (
      id, order_id, order_number, raised_by_company, defendant_company, reason,
      amount_disputed, currency, status, created_at, evidence, resolution
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    item.orderId || '',
    item.orderNumber || '',
    item.raisedByCompany || activeSessionUser?.companyName || 'PT Pembeli Baja',
    item.defendantCompany || 'PT Penjual Scrap',
    item.reason || 'Kesesuaian Mutu & Timbangan',
    item.amountDisputed || 1000,
    item.currency || 'USD',
    'OPEN',
    new Date().toISOString(),
    JSON.stringify(item.evidence || []),
    null
  );

  // Freeze order if applicable
  if (item.orderId) {
    db.prepare(`UPDATE orders SET status = 'DISPUTED' WHERE id = ?`).run(item.orderId);
  }

  const created = db.prepare('SELECT * FROM disputes WHERE id = ?').get(id);
  res.status(201).json(mapDisputeRow(created));
});

apiRouter.patch('/disputes/:id/resolve', (req: Request, res: Response) => {
  const { decision } = req.body;
  db.prepare(`
    UPDATE disputes SET
      status = 'RESOLVED',
      resolution = ?
    WHERE id = ?
  `).run(decision || 'Dana escrow diselesaikan sesuai mediasi verifikator.', req.params.id);

  const updated = db.prepare('SELECT * FROM disputes WHERE id = ?').get(req.params.id);
  res.json(mapDisputeRow(updated));
});

// ----------------------------------------------------
// 7. PROCUREMENT PROJECTS
// ----------------------------------------------------

apiRouter.get('/procurement-projects', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM procurement_projects').all();
  res.json(rows.map((r: any) => parseJson(r.full_project, r)));
});

apiRouter.post('/procurement-projects', (req: Request, res: Response) => {
  const project = req.body;
  const id = project.id || `PRJ-${Date.now().toString().slice(-6)}`;

  db.prepare(`
    INSERT INTO procurement_projects (
      id, title, factory_name, total_needed, unit, target_price, status, deadline,
      matched_suppliers, allocations, full_project
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    project.title || 'Proyek Pengadaan Bahan Baku',
    project.factoryName || activeSessionUser?.companyName || 'PT Pabrik Logam',
    project.totalNeeded || 500,
    project.unit || 'MT',
    project.targetPrice || 350,
    project.status || 'Active',
    project.deadline || '2026-11-30',
    JSON.stringify(project.matchedSuppliers || []),
    JSON.stringify(project.allocations || []),
    JSON.stringify({ ...project, id })
  );

  res.status(201).json({ ...project, id });
});

// ----------------------------------------------------
// 8. COMPANIES & ADMIN OPS
// ----------------------------------------------------

apiRouter.get('/companies', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM companies').all();
  res.json(rows.map((r: any) => parseJson(r.full_profile, {
    id: r.id,
    name: r.name,
    country: r.country,
    city: r.city,
    address: r.address,
    businessType: r.business_type,
    verified: Boolean(r.verified),
    rating: r.rating,
    completedTx: r.completed_tx,
    legalDocs: parseJson(r.legal_docs, {}),
  })));
});

apiRouter.patch('/companies/:id/kyc', (req: Request, res: Response) => {
  const { status } = req.body;
  const verified = status === 'VERIFIED' ? 1 : 0;

  db.prepare(`
    UPDATE companies SET
      kyc_status = ?,
      verified = ?
    WHERE id = ?
  `).run(status, verified, req.params.id);

  // Also update in users if matching
  db.prepare(`
    UPDATE users SET
      is_buyer_verified = ?
    WHERE company_name IN (SELECT name FROM companies WHERE id = ?)
  `).run(verified, req.params.id);

  res.json({ success: true, status });
});

apiRouter.get('/admin/overview', (req: Request, res: Response) => {
  const listingsCount = (db.prepare('SELECT COUNT(*) as c FROM listings').get() as any).c;
  const ordersCount = (db.prepare('SELECT COUNT(*) as c FROM orders').get() as any).c;
  const disputesCount = (db.prepare("SELECT COUNT(*) as c FROM disputes WHERE status = 'OPEN'").get() as any).c;
  const companiesCount = (db.prepare('SELECT COUNT(*) as c FROM companies').get() as any).c;
  const totalVolume = (db.prepare('SELECT SUM(total_amount) as s FROM orders').get() as any).s || 0;
  const totalEscrowFee = (db.prepare('SELECT SUM(escrow_fee) as s FROM orders').get() as any).s || 0;

  res.json({
    listingsCount,
    ordersCount,
    disputesCount,
    companiesCount,
    totalVolume,
    totalEscrowFee,
  });
});

apiRouter.get('/admin/audit-logs', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50').all();
  res.json(rows);
});

apiRouter.get('/admin/fees', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM platform_fees').all();
  res.json(rows);
});

apiRouter.patch('/admin/fees/:id', (req: Request, res: Response) => {
  const { percentage, fixedAmount } = req.body;
  db.prepare(`
    UPDATE platform_fees SET
      percentage = COALESCE(?, percentage),
      fixed_amount = COALESCE(?, fixed_amount)
    WHERE id = ?
  `).run(percentage || null, fixedAmount || null, req.params.id);

  const updated = db.prepare('SELECT * FROM platform_fees WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// ----------------------------------------------------
// 9. PROJECT AUCTIONS & OTP BIDDING SYSTEM
// ----------------------------------------------------

function mapProjectAuctionRow(row: any) {
  if (!row) return null;
  const startingBid = row.starting_bid || 0;
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    photos: parseJson(row.photos, []),
    startingBid,
    currentHighestBid: row.current_highest_bid || startingBid,
    bidIncrement: row.bid_increment || 5000000,
    securityDeposit: row.security_deposit || 10000000,
    depositDeductionFee: row.deposit_deduction_fee || 250000,
    buyNowPrice: row.buy_now_price || Math.round(startingBid * 1.35),
    status: row.status,
    winnerCompany: row.winner_company,
    winnerBid: row.winner_bid,
    winnerSettlementStatus: row.winner_settlement_status,
    location: row.location,
    aanwijzingDate: row.aanwijzing_date,
    deadline: row.deadline,
    sellerCompany: row.seller_company,
    totalBids: row.total_bids || 0,
    createdAt: row.created_at,
  };
}

const activeProjectOtps = new Map<string, { otp: string; expiresAt: number }>();

apiRouter.get('/project-auctions', (req: Request, res: Response) => {
  const { status, includePending } = req.query;
  let query = 'SELECT * FROM project_auctions';
  const params: any[] = [];

  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  } else if (!includePending && activeSessionUser?.role !== 'admin') {
    // Hide unapproved pending auctions from regular public feed
    query += " WHERE status != 'PENDING_APPROVAL'";
  }

  query += ' ORDER BY created_at DESC';
  const rows = db.prepare(query).all(...params);
  res.json(rows.map(mapProjectAuctionRow));
});

apiRouter.get('/project-auctions/:id', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM project_auctions WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Lelang project tidak ditemukan' });

  const bids = db.prepare('SELECT * FROM project_bids WHERE project_id = ? ORDER BY amount DESC, timestamp DESC').all(req.params.id);
  const deposits = db.prepare('SELECT * FROM auction_deposits WHERE project_id = ?').all(req.params.id);

  // Map deposits with pinCode
  const mappedDeposits = deposits.map((d: any) => ({
    id: d.id,
    projectId: d.project_id,
    companyName: d.company_name,
    amount: d.amount,
    vaNumber: d.va_number,
    bank: d.bank,
    status: d.status,
    pinCode: d.pin_code || '123456',
    deductionAmount: d.deduction_amount,
    netRefundAmount: d.net_refund_amount,
    createdAt: d.created_at,
    verifiedAt: d.verified_at,
    refundedAt: d.refunded_at,
  }));

  res.json({
    project: mapProjectAuctionRow(row),
    bids,
    deposits: mappedDeposits,
  });
});

// Admin Approve Auction
apiRouter.post('/project-auctions/:id/approve', (req: Request, res: Response) => {
  const projectId = req.params.id;
  const project = db.prepare('SELECT * FROM project_auctions WHERE id = ?').get(projectId) as any;
  if (!project) return res.status(404).json({ error: 'Lelang tidak ditemukan' });

  db.prepare("UPDATE project_auctions SET status = 'OPEN' WHERE id = ?").run(projectId);
  const updated = db.prepare('SELECT * FROM project_auctions WHERE id = ?').get(projectId);
  res.json({ success: true, message: 'Lelang berhasil disetujui dan kini tayang aktif di bursa!', project: mapProjectAuctionRow(updated) });
});

// Admin Reject Auction
apiRouter.post('/project-auctions/:id/reject', (req: Request, res: Response) => {
  const projectId = req.params.id;
  db.prepare("UPDATE project_auctions SET status = 'REJECTED' WHERE id = ?").run(projectId);
  res.json({ success: true, message: 'Lelang telah ditolak.' });
});

// Create Auction (User Pemilik Barang) - Defaults to PENDING_APPROVAL
apiRouter.post('/project-auctions', (req: Request, res: Response) => {
  const b = req.body;
  const id = b.id || `PRJ-AUC-${Date.now().toString().slice(-5)}`;
  const startingBid = Number(b.startingBid) || 100000000;
  const buyNowPrice = Number(b.buyNowPrice) || Math.round(startingBid * 1.35);
  const initialStatus = b.status || (activeSessionUser?.role === 'admin' ? 'OPEN' : 'PENDING_APPROVAL');

  db.prepare(`
    INSERT INTO project_auctions (
      id, title, category, description, photos, starting_bid, current_highest_bid, bid_increment,
      security_deposit, deposit_deduction_fee, status, location, aanwijzing_date, deadline, seller_company, total_bids, created_at, buy_now_price
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    b.title || 'Lelang Aset Industri',
    b.category || 'Besi Baja Industri',
    b.description || '',
    JSON.stringify(b.photos || ['https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80']),
    startingBid,
    startingBid,
    Number(b.bidIncrement) || 10000000,
    Number(b.securityDeposit) || 10000000,
    Number(b.depositDeductionFee) || 250000,
    initialStatus,
    b.location || 'Kawasan Industri',
    b.aanwijzingDate || '2026-11-10',
    b.deadline || '2026-11-20',
    b.sellerCompany || activeSessionUser?.companyName || 'PT Pemilik Aset Industri',
    0,
    new Date().toISOString(),
    buyNowPrice
  );

  const row = db.prepare('SELECT * FROM project_auctions WHERE id = ?').get(id);
  res.status(201).json(mapProjectAuctionRow(row));
});

// Beli Langsung (Buy Now - Instan Order via Escrow)
apiRouter.post('/project-auctions/:id/buy-now', (req: Request, res: Response) => {
  const { buyerCompany } = req.body;
  const projectId = req.params.id;
  const project = db.prepare('SELECT * FROM project_auctions WHERE id = ?').get(projectId) as any;
  if (!project) return res.status(404).json({ error: 'Proyek lelang tidak ditemukan' });

  const buyer = buyerCompany || activeSessionUser?.companyName || 'PT Pembeli Cepat';
  const price = project.buy_now_price || Math.round((project.starting_bid || 100000000) * 1.35);

  // Set project as awarded
  db.prepare(`
    UPDATE project_auctions SET
      status = 'AWARDED',
      winner_company = ?,
      winner_bid = ?,
      winner_settlement_status = 'SETTLED'
    WHERE id = ?
  `).run(buyer, price, projectId);

  // Create immediate escrow order
  const orderId = `ORD-AUC-${Date.now().toString().slice(-6)}`;
  const orderNumber = `SCR-AUC-${Math.floor(100000 + Math.random() * 900000)}`;
  const escrowFee = Math.round(price * 0.015);
  const tax = Math.round(price * 0.11);
  const totalAmount = price + escrowFee + tax;

  const orderObj = {
    id: orderId,
    orderNumber,
    listingId: projectId,
    productTitle: `[Beli Langsung] ${project.title}`,
    productImage: parseJson(project.photos, [''])[0],
    buyerCompany: buyer,
    sellerCompany: project.seller_company,
    quantity: 1,
    unit: 'Lot',
    pricePerUnit: price,
    subtotal: price,
    escrowFee,
    tax,
    totalAmount,
    currency: 'IDR',
    status: 'ESCROW_HOLD',
    paymentStatus: 'PAID',
    shippingStatus: 'PREPARING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [
      { status: 'Dibuat via Beli Langsung', date: new Date().toISOString(), desc: 'Pesanan instan buy-now lelang berhasil diterbitkan' },
      { status: 'Dana di Escrow Kustodi', date: new Date().toISOString(), desc: 'Pembayaran diamankan di rekening kustodi resmi Scrava' },
    ],
  };

  db.prepare(`
    INSERT INTO orders (
      id, order_number, listing_id, product_title, product_image, buyer_company, seller_company,
      quantity, unit, price_per_unit, subtotal, escrow_fee, tax, total_amount, currency,
      status, payment_status, shipping_status, created_at, updated_at, full_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    orderId,
    orderNumber,
    projectId,
    `[Beli Langsung] ${project.title}`,
    parseJson(project.photos, [''])[0],
    buyer,
    project.seller_company,
    1,
    'Lot',
    price,
    price,
    escrowFee,
    tax,
    totalAmount,
    'IDR',
    'ESCROW_HOLD',
    'PAID',
    'PREPARING',
    new Date().toISOString(),
    new Date().toISOString(),
    JSON.stringify(orderObj)
  );

  res.json({
    success: true,
    message: `Pembelian langsung berhasil! Kontrak pesanan ${orderNumber} telah diterbitkan dengan perlindungan Escrow.`,
    order: orderObj,
  });
});

// Submit / Register Uang Jaminan Lelang with unique PIN per lelang
apiRouter.post('/project-auctions/:id/deposit', (req: Request, res: Response) => {
  const { companyName, autoVerify, bank } = req.body;
  const projectId = req.params.id;
  const project = db.prepare('SELECT * FROM project_auctions WHERE id = ?').get(projectId) as any;
  if (!project) return res.status(404).json({ error: 'Proyek tidak ditemukan' });

  const comp = companyName || activeSessionUser?.companyName || 'Depo Scrap Berkah Mandiri';
  
  // Check if deposit already exists for this company on this project
  const existing = db.prepare('SELECT * FROM auction_deposits WHERE project_id = ? AND company_name = ?').get(projectId, comp) as any;
  if (existing) {
    const pin = existing.pin_code || Math.floor(100000 + Math.random() * 900000).toString();
    if (!existing.pin_code) {
      db.prepare('UPDATE auction_deposits SET pin_code = ? WHERE id = ?').run(pin, existing.id);
    }
    const updated = db.prepare('SELECT * FROM auction_deposits WHERE id = ?').get(existing.id) as any;
    return res.json({
      success: true,
      deposit: {
        id: updated.id,
        projectId: updated.project_id,
        companyName: updated.company_name,
        amount: updated.amount,
        vaNumber: updated.va_number,
        bank: updated.bank,
        status: updated.status,
        pinCode: pin,
        createdAt: updated.created_at,
        verifiedAt: updated.verified_at,
      },
      pinCode: pin,
    });
  }

  const depId = `DEP-${Date.now().toString().slice(-6)}`;
  const vaNumber = `8277 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
  const status = autoVerify ? 'VERIFIED' : 'PENDING_PAYMENT';
  // Generate unique PIN per lelang
  const pinCode = Math.floor(100000 + Math.random() * 900000).toString();

  db.prepare(`
    INSERT INTO auction_deposits (id, project_id, company_name, amount, va_number, bank, status, created_at, verified_at, pin_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    depId,
    projectId,
    comp,
    autoVerify ? 0 : project.security_deposit,
    vaNumber,
    bank || 'BCA Escrow',
    status,
    new Date().toISOString(),
    autoVerify ? new Date().toISOString() : null,
    pinCode
  );

  const dep = db.prepare('SELECT * FROM auction_deposits WHERE id = ?').get(depId) as any;
  res.json({
    success: true,
    deposit: {
      id: dep.id,
      projectId: dep.project_id,
      companyName: dep.company_name,
      amount: dep.amount,
      vaNumber: dep.va_number,
      bank: dep.bank,
      status: dep.status,
      pinCode,
      createdAt: dep.created_at,
      verifiedAt: dep.verified_at,
    },
    pinCode,
  });
});

// Admin or Instant Verify Deposit Payment
apiRouter.post('/project-auctions/:id/verify-deposit', (req: Request, res: Response) => {
  const { depositId, companyName } = req.body;
  const projectId = req.params.id;

  if (depositId) {
    db.prepare(`UPDATE auction_deposits SET status = 'VERIFIED', verified_at = ? WHERE id = ?`).run(
      new Date().toISOString(),
      depositId
    );
  } else if (companyName) {
    db.prepare(`UPDATE auction_deposits SET status = 'VERIFIED', verified_at = ? WHERE project_id = ? AND company_name = ?`).run(
      new Date().toISOString(),
      projectId,
      companyName
    );
  }

  const dep = depositId
    ? db.prepare('SELECT * FROM auction_deposits WHERE id = ?').get(depositId)
    : db.prepare('SELECT * FROM auction_deposits WHERE project_id = ? AND company_name = ?').get(projectId, companyName);

  res.json({
    success: true,
    message: 'Uang jaminan lelang berhasil diverifikasi! Hak penawaran lelang kini aktif.',
    deposit: dep,
  });
});

// Request OTP for Bidding
apiRouter.post('/project-auctions/:id/request-otp', (req: Request, res: Response) => {
  const { companyName } = req.body;
  const projectId = req.params.id;
  const comp = companyName || activeSessionUser?.companyName || 'Depo Scrap Berkah Mandiri';

  const deposit = db.prepare("SELECT * FROM auction_deposits WHERE project_id = ? AND company_name = ? AND status = 'VERIFIED'").get(projectId, comp);
  if (!deposit) {
    return res.status(403).json({
      success: false,
      message: 'Uang jaminan lelang proyek ini belum diverifikasi. Silakan bayar jaminan terlebih dahulu untuk menerima kode OTP.',
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const key = `${projectId}:${comp}`;
  activeProjectOtps.set(key, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  res.json({
    success: true,
    message: `Kode OTP verifikasi penawaran berhasil dibuat: ${otp}`,
    otp,
    expiresInSeconds: 300,
  });
});

// Submit OTP Verified Bid
apiRouter.post('/project-auctions/:id/bid', (req: Request, res: Response) => {
  const { amount, otp, companyName } = req.body;
  const projectId = req.params.id;
  const comp = companyName || activeSessionUser?.companyName || 'Depo Scrap Berkah Mandiri';

  const project = db.prepare('SELECT * FROM project_auctions WHERE id = ?').get(projectId) as any;
  if (!project) return res.status(404).json({ success: false, message: 'Proyek tidak ditemukan.' });

  const deposit = db.prepare("SELECT * FROM auction_deposits WHERE project_id = ? AND company_name = ? AND status = 'VERIFIED'").get(projectId, comp) as any;
  if (!deposit) {
    return res.status(403).json({
      success: false,
      message: 'Anda belum menyetorkan uang jaminan lelang untuk proyek ini.',
    });
  }

  const key = `${projectId}:${comp}`;
  const storedOtp = activeProjectOtps.get(key);
  const pinInput = String(otp || req.body.pin || '').trim();
  const isPinValid = (deposit.pin_code && deposit.pin_code === pinInput) || (storedOtp && storedOtp.otp === pinInput);
  if (!isPinValid) {
    return res.status(400).json({
      success: false,
      message: 'Kode PIN lelang tidak valid. Masukkan 6-digit PIN rahasia lelang yang diterbitkan khusus untuk Anda pada lelang ini.',
    });
  }

  const currentHighest = project.current_highest_bid || project.starting_bid;
  const minAllowed = currentHighest + (project.bid_increment || 10000000);
  if (amount < minAllowed) {
    return res.status(400).json({
      success: false,
      message: `Tawaran bid harus minimal Rp ${minAllowed.toLocaleString('id-ID')}.`,
    });
  }

  db.prepare("UPDATE project_bids SET status = 'OUTBID' WHERE project_id = ? AND status = 'WINNING'").run(projectId);

  const bidId = `PBID-${Date.now().toString().slice(-6)}`;
  db.prepare(`
    INSERT INTO project_bids (id, project_id, bidder_company, amount, otp_code, otp_verified, status, timestamp)
    VALUES (?, ?, ?, ?, ?, 1, 'WINNING', ?)
  `).run(
    bidId,
    projectId,
    comp,
    amount,
    otp,
    new Date().toISOString().replace('T', ' ').slice(0, 16)
  );

  const newCount = (project.total_bids || 0) + 1;
  db.prepare(`
    UPDATE project_auctions SET
      current_highest_bid = ?,
      total_bids = ?
    WHERE id = ?
  `).run(amount, newCount, projectId);

  activeProjectOtps.delete(key);

  const updatedProject = db.prepare('SELECT * FROM project_auctions WHERE id = ?').get(projectId);
  const allBids = db.prepare('SELECT * FROM project_bids WHERE project_id = ? ORDER BY amount DESC, timestamp DESC').all(projectId);

  res.json({
    success: true,
    message: `Penawaran sah terverifikasi OTP sebesar Rp ${amount.toLocaleString('id-ID')} berhasil dipasang!`,
    project: mapProjectAuctionRow(updatedProject),
    bids: allBids,
  });
});

// Admin Award Winner
apiRouter.post('/project-auctions/:id/award', (req: Request, res: Response) => {
  const projectId = req.params.id;
  const project = db.prepare('SELECT * FROM project_auctions WHERE id = ?').get(projectId) as any;
  if (!project) return res.status(404).json({ error: 'Proyek tidak ditemukan' });

  const winningBid = db.prepare("SELECT * FROM project_bids WHERE project_id = ? AND status = 'WINNING' ORDER BY amount DESC LIMIT 1").get(projectId) as any;
  if (!winningBid) {
    return res.status(400).json({ error: 'Belum ada penawaran aktif pada proyek ini.' });
  }

  db.prepare(`
    UPDATE project_auctions SET
      status = 'AWARDED',
      winner_company = ?,
      winner_bid = ?,
      winner_settlement_status = 'PENDING_PAYMENT'
    WHERE id = ?
  `).run(winningBid.bidder_company, winningBid.amount, projectId);

  db.prepare("UPDATE project_bids SET status = 'WON' WHERE id = ?").run(winningBid.id);
  db.prepare("UPDATE project_bids SET status = 'LOST' WHERE project_id = ? AND id != ?").run(projectId, winningBid.id);

  db.prepare("UPDATE auction_deposits SET status = 'SETTLED_TO_WINNER' WHERE project_id = ? AND company_name = ?").run(
    projectId,
    winningBid.bidder_company
  );

  const updated = db.prepare('SELECT * FROM project_auctions WHERE id = ?').get(projectId);
  res.json({ success: true, project: mapProjectAuctionRow(updated), winner: winningBid });
});

// Winner Settlement (Pelunasan Pembayaran Lelang)
apiRouter.post('/project-auctions/:id/settle-winner', (req: Request, res: Response) => {
  const projectId = req.params.id;
  db.prepare(`
    UPDATE project_auctions SET
      winner_settlement_status = 'SETTLED'
    WHERE id = ?
  `).run(projectId);

  res.json({
    success: true,
    message: 'Pelunasan lelang proyek berhasil diselesaikan melalui Escrow Kustodi Scrava! Uang jaminan telah dikreditkan ke pembayaran.',
  });
});

// Loser Refund Deposit with Agreed Administrative Deduction
apiRouter.post('/project-auctions/:id/refund-loser', (req: Request, res: Response) => {
  const { depositId } = req.body;
  const deposit = db.prepare('SELECT * FROM auction_deposits WHERE id = ?').get(depositId) as any;
  if (!deposit) return res.status(404).json({ error: 'Data jaminan tidak ditemukan.' });

  const project = db.prepare('SELECT * FROM project_auctions WHERE id = ?').get(deposit.project_id) as any;
  const deduction = project ? project.deposit_deduction_fee : 250000;
  const netRefund = Math.max(0, deposit.amount - deduction);

  db.prepare(`
    UPDATE auction_deposits SET
      status = 'REFUNDED',
      deduction_amount = ?,
      net_refund_amount = ?,
      refunded_at = ?
    WHERE id = ?
  `).run(deduction, netRefund, new Date().toISOString(), depositId);

  res.json({
    success: true,
    message: `Pengembalian uang jaminan sebesar Rp ${netRefund.toLocaleString('id-ID')} berhasil diproses (dipotong biaya administrasi kesepakatan Rp ${deduction.toLocaleString('id-ID')}).`,
    netRefund,
    deduction,
  });
});

