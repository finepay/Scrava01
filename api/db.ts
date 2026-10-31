import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../scrava.db');

export const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');

// Initialize database tables
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      role TEXT NOT NULL,
      company_name TEXT,
      business_type TEXT,
      is_google_auth INTEGER DEFAULT 0,
      is_verified INTEGER DEFAULT 0,
      is_buyer_verified INTEGER DEFAULT 0,
      legal_docs TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT,
      city TEXT,
      address TEXT,
      business_type TEXT,
      verified INTEGER DEFAULT 0,
      rating REAL DEFAULT 5.0,
      completed_tx INTEGER DEFAULT 0,
      legal_docs TEXT,
      kyc_status TEXT DEFAULT 'UNVERIFIED',
      full_profile TEXT
    );

    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT,
      description TEXT,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      price_per_unit REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      total_price REAL NOT NULL,
      listing_type TEXT NOT NULL,
      condition TEXT,
      incoterm TEXT,
      location TEXT,
      seller TEXT,
      photos TEXT,
      specs TEXT,
      documents TEXT,
      status TEXT DEFAULT 'Published',
      min_asking_price REAL,
      current_bid REAL,
      bid_increment REAL,
      bid_count INTEGER DEFAULT 0,
      closing_date TEXT,
      closing_countdown TEXT,
      views_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS auction_bids (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL,
      bidder_company TEXT NOT NULL,
      bidder_country TEXT,
      amount REAL NOT NULL,
      timestamp TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY(listing_id) REFERENCES listings(id)
    );

    CREATE TABLE IF NOT EXISTS negotiations (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL,
      product_title TEXT NOT NULL,
      product_image TEXT,
      seller_company TEXT NOT NULL,
      buyer_company TEXT NOT NULL,
      current_offer_price REAL NOT NULL,
      current_offer_qty REAL NOT NULL,
      unit TEXT NOT NULL,
      currency TEXT DEFAULT 'USD',
      incoterm TEXT,
      status TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      messages TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reverse_bids (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      material TEXT NOT NULL,
      grade TEXT,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      target_price REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      delivery_location TEXT,
      required_date TEXT,
      incoterm TEXT,
      specifications TEXT,
      deadline TEXT,
      buyer_company TEXT NOT NULL,
      buyer_country TEXT,
      buyer_verified INTEGER DEFAULT 0,
      status TEXT DEFAULT 'OPEN',
      bids_count INTEGER DEFAULT 0,
      lowest_bid REAL,
      responses TEXT,
      allow_split_award INTEGER DEFAULT 1,
      target_total_needed REAL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL,
      listing_id TEXT,
      product_title TEXT NOT NULL,
      product_image TEXT,
      buyer_company TEXT NOT NULL,
      seller_company TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      price_per_unit REAL NOT NULL,
      subtotal REAL NOT NULL,
      escrow_fee REAL NOT NULL,
      tax REAL NOT NULL,
      total_amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      status TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      shipping_status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      full_order TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS disputes (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      order_number TEXT,
      raised_by_company TEXT NOT NULL,
      defendant_company TEXT NOT NULL,
      reason TEXT NOT NULL,
      amount_disputed REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      evidence TEXT,
      resolution TEXT
    );

    CREATE TABLE IF NOT EXISTS procurement_projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      factory_name TEXT NOT NULL,
      total_needed REAL NOT NULL,
      unit TEXT NOT NULL,
      target_price REAL NOT NULL,
      status TEXT NOT NULL,
      deadline TEXT,
      matched_suppliers TEXT,
      allocations TEXT,
      full_project TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS platform_fees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      percentage REAL,
      fixed_amount REAL,
      currency TEXT DEFAULT 'USD',
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      performed_by TEXT NOT NULL,
      target_id TEXT,
      timestamp TEXT NOT NULL,
      details TEXT
    );

    CREATE TABLE IF NOT EXISTS project_auctions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      photos TEXT,
      starting_bid REAL NOT NULL,
      current_highest_bid REAL,
      bid_increment REAL NOT NULL,
      security_deposit REAL NOT NULL,
      deposit_deduction_fee REAL NOT NULL,
      status TEXT DEFAULT 'OPEN',
      winner_company TEXT,
      winner_bid REAL,
      winner_settlement_status TEXT DEFAULT 'PENDING_PAYMENT',
      location TEXT,
      aanwijzing_date TEXT,
      deadline TEXT NOT NULL,
      seller_company TEXT NOT NULL,
      total_bids INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS auction_deposits (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      company_name TEXT NOT NULL,
      amount REAL NOT NULL,
      va_number TEXT NOT NULL,
      bank TEXT NOT NULL,
      status TEXT NOT NULL,
      deduction_amount REAL DEFAULT 0,
      net_refund_amount REAL DEFAULT 0,
      created_at TEXT NOT NULL,
      verified_at TEXT,
      refunded_at TEXT
    );

    CREATE TABLE IF NOT EXISTS project_bids (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      bidder_company TEXT NOT NULL,
      amount REAL NOT NULL,
      otp_code TEXT,
      otp_verified INTEGER DEFAULT 1,
      status TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);

  // Safe migration for listing promotion fields if not existing
  try {
    db.exec(`ALTER TABLE listings ADD COLUMN is_paid_promotion INTEGER DEFAULT 0`);
  } catch {}
  try {
    db.exec(`ALTER TABLE listings ADD COLUMN promotion_tier TEXT DEFAULT 'FREE'`);
  } catch {}
  try {
    db.exec(`ALTER TABLE listings ADD COLUMN buy_now_price REAL`);
  } catch {}
  try {
    db.exec(`ALTER TABLE listings ADD COLUMN security_deposit REAL DEFAULT 2500000`);
  } catch {}
  try {
    db.exec(`ALTER TABLE project_auctions ADD COLUMN buy_now_price REAL`);
  } catch {}
  try {
    db.exec(`ALTER TABLE auction_deposits ADD COLUMN pin_code TEXT`);
  } catch {}
}

