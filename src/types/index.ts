export type ListingType = 'FIXED_PRICE' | 'AUCTION' | 'FREE_PICKUP';
export type MaterialCondition = 'Clean' | 'Processed' | 'Unprocessed' | 'Contaminated' | 'Mixed';
export type IncotermType = 'EXW' | 'FOB' | 'DDP' | 'CIF';

export type UserRole = 'public' | 'customer' | 'admin' | 'seller' | 'buyer';

export type CustomerPersona = 'factory' | 'collector' | 'individual' | 'all_in_one';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  customerPersona?: CustomerPersona;
  companyName?: string;
  businessType?: string;
  isGoogleAuth?: boolean;
  avatar?: string;
  isVerified?: boolean;
  // Kept for backward compatibility
  isBuyerVerified?: boolean;
  walletBalance?: number;
  legalDocs?: {
    nib?: string;
    npwp?: string;
    companyLegalName?: string;
    izinUsaha?: string;
    submittedAt?: string;
    verifiedAt?: string;
    status: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  };
}

export interface Listing {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  description?: string;
  quantity: number;
  unit: string; // 'MT' | 'KG' | 'Piece' | 'Lot'
  pricePerUnit: number;
  currency: string;
  totalPrice: number;
  listingType: ListingType;
  condition: MaterialCondition;
  incoterm: IncotermType;
  location: {
    country: string;
    city: string;
    province?: string;
    address: string;
    port?: string;
  };
  seller: {
    id: string;
    companyName: string;
    verified: boolean;
    rating: number;
    completedTx: number;
    country: string;
    responseRate: string;
  };
  photos: string[];
  specs: Record<string, string>;
  documents: string[];
  createdAt: string;
  status: 'Draft' | 'Pending Review' | 'Published' | 'Paused' | 'Sold' | 'Expired';
  minAskingPrice?: number;
  currentBid?: number;
  bidIncrement?: number;
  bidCount?: number;
  closingDate?: string;
  closingCountdown?: string;
  viewsCount?: number;
  isPaidPromotion?: boolean;
  promotionTier?: 'FREE' | 'PAID' | 'PREMIUM_FEATURED' | 'STANDARD_FREE';
}

export interface AuctionBid {
  id: string;
  listingId: string;
  bidderCompany: string;
  bidderCountry: string;
  amount: number;
  timestamp: string;
  status: 'WINNING' | 'OUTBID' | 'ACCEPTED' | 'REJECTED';
}

export interface NegotiationMessage {
  id: string;
  senderCompany: string;
  senderRole: 'buyer' | 'seller';
  text: string;
  timestamp: string;
  offer?: {
    pricePerUnit: number;
    quantity: number;
    unit: string;
    incoterm: IncotermType;
    totalAmount: number;
    deliveryTimeline?: string;
    notes?: string;
  };
}

export interface Negotiation {
  id: string;
  listingId: string;
  productTitle: string;
  productImage: string;
  sellerCompany: string;
  buyerCompany: string;
  currentOfferPrice: number;
  currentOfferQty: number;
  unit: string;
  currency: string;
  incoterm: IncotermType;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Countered' | 'Expired';
  updatedAt: string;
  messages: NegotiationMessage[];
}

export interface RFQResponse {
  id: string;
  requirementId: string;
  sellerCompany: string;
  sellerCountry: string;
  sellerVerified: boolean;
  pricePerUnit: number;
  quantityOffered: number;
  unit: string;
  incoterm: IncotermType;
  deliveryTimeline: string;
  pickupOption?: 'Included' | 'Buyer Collects';
  qcIncluded?: boolean;
  notes: string;
  submittedAt: string;
  status: 'PENDING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED';
  scravaScore?: {
    onTime: number;
    accuracy: number;
    quality: number;
    overall: number;
  };
}

export interface ReverseBidRequirement {
  id: string;
  title: string;
  category: string;
  material: string;
  grade: string;
  quantity: number;
  unit: string;
  targetPrice: number;
  currency: string;
  deliveryLocation: string;
  requiredDate: string;
  incoterm: IncotermType;
  specifications: string;
  deadline: string;
  buyerCompany: string;
  buyerCountry: string;
  buyerVerified: boolean;
  createdAt: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'CLOSED' | 'AWARDED';
  responsesCount: number;
  responses: RFQResponse[];
  // Split order fulfillment
  splitOrderAllocations?: {
    supplierCompany: string;
    allocatedQty: number;
    unitPrice: number;
    pickupTerms: string;
  }[];
  isSplitFulfilled?: boolean;
}

// 2. Industrial Procurement Request & Project
export interface ProcurementProjectItem {
  id: string;
  material: string;
  grade: string;
  category: string;
  demandedQty: number;
  unit: string;
  targetPricePerUnit: number;
  fulfilledQty: number;
  status: 'OPEN' | 'PARTIAL' | 'FULFILLED';
  matchedSuppliers: {
    supplierName: string;
    offeredQty: number;
    price: number;
    location: string;
    distanceKm: number;
  }[];
}

export interface ProcurementProject {
  id: string;
  projectCode: string; // e.g. TRZ-2026-001
  title: string;
  buyerCompany: string;
  deliveryDestination: string;
  deadline: string;
  items: ProcurementProjectItem[];
  totalBudgetUSD: number;
  status: 'ACTIVE' | 'AGGREGATING' | 'FULFILLED' | 'IN_TRANSIT';
  createdAt: string;
}

// 4. Material Matching Engine Result
export interface MaterialMatchSupply {
  id: string;
  supplierName: string;
  material: string;
  grade: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  location: string;
  distanceKm: number;
  availability: 'IMMEDIATE' | 'WITHIN_7_DAYS' | 'WITHIN_14_DAYS';
  scravaScore: number;
}

// 7. Supply Pool
export interface SupplyPoolItem {
  id: string;
  collectorName: string;
  location: string;
  material: string;
  grade: string;
  availableQty: number;
  unit: string;
  expectedPriceMin: number;
  expectedPriceMax: number;
  matchedDemandCount: number;
  matchedDemands: {
    buyerName: string;
    needQty: number;
    destination: string;
    targetPrice: number;
  }[];
  status: 'ACTIVE_POOL' | 'PARTIAL_ALLOCATED' | 'DEPLETED';
}

// 14 & 15. Digital Docket & Chain of Custody
export interface DigitalDocket {
  docketNumber: string;
  suratJalanNumber: string;
  orderNumber: string;
  vehiclePlate: string;
  transporterFleet: string;
  driverName: string;
  driverPhoneHash: string;
  supplierCompany: string;
  supplierYardAddress: string;
  buyerCompany: string;
  buyerFacilityAddress: string;
  grossWeightMT: number;
  tareWeightMT: number;
  netWeightMT: number;
  weighbridgeStation: string;
  weighbridgeTicketHash: string;
  qcPurityPercentage: number;
  qcInspectionBody: string;
  timestamp: string;
  chainOfCustody: {
    step: string;
    timestamp: string;
    location: string;
    authorizedBy: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  }[];
}

// 16 & 17. Scrava Reliability Score
export interface ScravaScoreProfile {
  companyId: string;
  companyName: string;
  type: 'SUPPLIER' | 'BUYER';
  overallScore: number; // 0 - 100
  onTimeDeliveryPct: number;
  quantityAccuracyPct: number;
  qualityConsistencyPct: number;
  responseRatePct: number;
  paymentReliabilityPct?: number;
  completedOrdersCount: number;
  totalVolumeHandled: string;
  disputeResolutionSpeedHours: number;
}

// 20 & 21. Factory Clearance / Surplus Project
export interface FactoryClearanceProject {
  id: string;
  title: string;
  factoryName: string;
  reason: 'Plant Relocation' | 'Facility Shutdown' | 'Renovation' | 'Asset Liquidation';
  location: string;
  estimatedPackageValue: number;
  currency: string;
  deadline: string;
  assets: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    estValue: number;
    condition: string;
  }[];
  saleMode: 'BULK_PACKAGE' | 'INDIVIDUAL_LOTS' | 'HYBRID';
  status: 'CATALOGING' | 'OPEN_OFFERS' | 'LIQUIDATED';
}

// 24. Landed Cost Breakdown
export interface LandedCostBreakdown {
  materialBasePrice: number;
  transportFreight: number;
  handlingLoading: number;
  qcInspection: number;
  platformEscrowFee: number;
  insuranceCoverage: number;
  estimatedLandedCost: number;
  unit: string;
  distanceKm: number;
}

// 29. Material Passport
export interface MaterialPassport {
  passportId: string;
  materialName: string;
  gradeCode: string;
  originSource: string;
  netWeightMT: number;
  metallurgicalAssay: Record<string, string>;
  radiationFreeCertified: boolean;
  carbonSavingsVsVirginMT: number;
  circularityScore: number; // 0-100
  previousBatches: string[];
  qrCodeDigest: string;
}

// 11. Actual Transaction Price Record
export interface ActualTransactionPriceRecord {
  id: string;
  material: string;
  grade: string;
  region: string;
  listingPricePerUnit: number;
  actualSettlementPricePerUnit: number;
  unit: string;
  volumeMT: number;
  settledDate: string;
  weighbridgeVariancePct: number;
  qualityAdjustmentDeltaUSD: number;
}

export type OrderStatus =
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'WEIGHING'
  | 'QC'
  | 'SETTLEMENT'
  | 'COMPLETED'
  | 'DISPUTED';

export interface Order {
  id: string;
  orderNumber: string;
  listingId: string;
  productTitle: string;
  productImage: string;
  category: string;
  sellerCompany: string;
  sellerCountry: string;
  buyerCompany: string;
  buyerCountry: string;
  quantity: number;
  unit: string;
  agreedPricePerUnit: number;
  totalOriginalValue: number;
  currency: string;
  incoterm: IncotermType;
  status: OrderStatus;
  paymentStatus: 'PENDING' | 'PAID' | 'PROCESSING' | 'REFUNDED' | 'HELD' | 'SETTLED';
  pickupDetails: {
    scheduledDate: string;
    pickupAddress: string;
    transporter: string;
    vehiclePlate: string;
    driverName: string;
    status: 'Scheduled' | 'Assigned' | 'Arrived' | 'Loading' | 'Departed';
  };
  weighbridge: {
    expectedWeight: number;
    actualGrossWeight: number;
    tareWeight: number;
    actualNetWeight: number;
    unit: string;
    difference: number;
    ticketNumber: string;
    stationName: string;
    dateRecorded: string;
    isVerified: boolean;
  };
  qc: {
    inspector: string;
    status: 'APPROVED' | 'REJECTED' | 'PENDING';
    notes: string;
    inspectionDate: string;
    samplePurityPercentage: number;
    expectedPurityPercentage?: number;
    qualityAdjustmentPenalty?: number; // e.g. -Rp80M if 91% vs 95%
  };
  settlement: {
    originalValue: number;
    actualWeight: number;
    adjustedValue: number;
    platformFeeRate: number;
    platformFee: number;
    taxRate: number;
    taxes: number;
    transportCost: number;
    qualityAdjustmentPenalty?: number;
    finalSellerPayout: number;
    adjustmentDelta: number;
    status: 'PENDING' | 'CALCULATED' | 'CONFIRMED' | 'PAID';
  };
  createdAt: string;
  completedAt?: string;
  digitalDocket?: DigitalDocket;
  materialPassport?: MaterialPassport;
}

export interface Dispute {
  id: string;
  disputeNumber: string;
  orderId: string;
  orderNumber: string;
  productTitle: string;
  raisedByCompany: string;
  raisedByRole: 'buyer' | 'seller';
  againstCompany: string;
  reason: 'Quantity mismatch' | 'Quality issue' | 'Weight discrepancy' | 'Damaged goods' | 'Payment issue' | 'Pickup issue' | 'Other' | 'Selisih timbangan';
  description: string;
  evidenceFiles: string[];
  claimAmount: number;
  currency: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  adminDecision?: string;
  createdAt: string;
}

export interface PriceIndexItem {
  id: string;
  material: string;
  grade: string;
  category: string;
  price: number;
  unit: string;
  currency: string;
  country: string;
  location: string;
  updated: string;
  change24h: number;
  source: string;
  historicalRange?: { min: number; max: number };
}

export interface CompanyProfile {
  id: string;
  name: string;
  logo: string;
  verified: boolean;
  country: string;
  businessType: string;
  yearsActive: number;
  completedTransactions: number;
  totalTradeVolume: string;
  rating: number;
  responseRate: string;
  kycStatus: 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NEEDS_UPDATE';
  kycProgress: number;
  materialsTraded: string[];
  address: string;
  taxId: string;
  bankAccount: string;
  scravaScoreProfile?: ScravaScoreProfile;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  ip: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details: string;
}

export interface PlatformFeeConfig {
  id: string;
  feeType: string;
  rate: string;
  fixedAmount: string;
  applicableTo: string;
  status: 'Active' | 'Inactive';
  effectiveDate: string;
}

export interface ProjectAuction {
  id: string;
  title: string;
  category: string;
  description: string;
  photos: string[];
  images?: string[];
  startingBid: number;
  currentHighestBid: number;
  bidIncrement: number;
  securityDeposit: number;
  depositDeductionFee: number;
  buyNowPrice?: number;
  status: 'PENDING_APPROVAL' | 'UPCOMING' | 'OPEN' | 'CLOSED' | 'AWARDED' | 'BIDDING_OPEN' | 'REJECTED';
  winnerCompany?: string | null;
  winnerBid?: number | null;
  winnerSettlementStatus?: 'PENDING_PAYMENT' | 'SETTLED';
  location: string;
  aanwijzingDate: string;
  deadline: string;
  bidClosingDate?: string;
  sellerCompany?: string;
  ownerCompany?: string;
  estimatedVolume?: number;
  unit?: string;
  specifications?: Record<string, string>;
  totalBids: number;
  createdAt: string;
}

export interface AuctionDeposit {
  id: string;
  projectId: string;
  companyName: string;
  amount: number;
  vaNumber: string;
  bank: string;
  pinCode?: string;
  status: 'PENDING_PAYMENT' | 'VERIFIED' | 'REFUNDED' | 'SETTLED_TO_WINNER';
  deductionAmount?: number;
  netRefundAmount?: number;
  createdAt: string;
  verifiedAt?: string;
  refundedAt?: string;
}

export interface ProjectBid {
  id: string;
  projectId: string;
  bidderCompany: string;
  amount: number;
  otpCode?: string;
  otpVerified: boolean | number;
  status: 'WINNING' | 'OUTBID' | 'WON' | 'LOST';
  timestamp: string;
}


