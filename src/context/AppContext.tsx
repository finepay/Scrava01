import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  Listing,
  AuctionBid,
  Negotiation,
  ReverseBidRequirement,
  Order,
  Dispute,
  PriceIndexItem,
  CompanyProfile,
  AuditLog,
  PlatformFeeConfig,
  OrderStatus,
  ProcurementProject,
  SupplyPoolItem,
  MaterialMatchSupply,
  ActualTransactionPriceRecord,
  FactoryClearanceProject,
  LandedCostBreakdown,
  DigitalDocket,
  MaterialPassport,
  CurrentUser,
} from '../types';
import {
  INITIAL_LISTINGS,
  MOCK_BIDS,
  MOCK_NEGOTIATIONS,
  MOCK_ORDERS,
  MOCK_REVERSE_BIDS,
  MOCK_PRICE_INDEX,
  MOCK_DISPUTES,
  MOCK_COMPANY_PROFILES,
  MOCK_AUDIT_LOGS,
  MOCK_PLATFORM_FEES,
  MOCK_PROCUREMENT_PROJECTS,
  MOCK_SUPPLY_POOL,
  MOCK_NEARBY_SUPPLY_WEST_JAVA,
  MOCK_ACTUAL_TRANSACTIONS,
  MOCK_FACTORY_CLEARANCES,
  CURRENCIES,
} from '../data/mockData';
import { TRANSLATIONS, Language } from '../data/translations';
import { apiClient } from '../api/client';

interface AppContextType {
  t: (key: string, fallback?: string) => string;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentUser: CurrentUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUser | null>>;
  isBuyerVerified: boolean;
  verifyCustomerAsBuyer: (factoryData: { companyName: string; nib?: string; npwp?: string; phone?: string; picName?: string; businessType?: string; address?: string }) => void;
  toggleBuyerVerification: (explicitState?: boolean) => void;
  loginWithGoogle: (options?: { role?: 'customer' | 'admin' | string; name?: string; email?: string; companyName?: string }) => void;
  upgradeToFactory: (factoryData: { companyName: string; phone?: string; picName?: string; businessType?: string; address?: string; nib?: string; npwp?: string }) => void;
  activeCurrency: string;
  setActiveCurrency: (curr: string) => void;
  formatPrice: (amountInUSD: number, unit?: string) => string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  listings: Listing[];
  addListing: (listing: Partial<Listing>) => Listing;
  updateListingStatus: (id: string, status: Listing['status']) => void;
  auctions: Listing[];
  placeBid: (listingId: string, amount: number) => { success: boolean; message: string };
  negotiations: Negotiation[];
  sendNegotiationOffer: (
    negId: string,
    offer: { pricePerUnit: number; quantity: number; unit: string; incoterm: any; notes?: string },
    text: string
  ) => void;
  acceptNegotiation: (negId: string) => void;
  reverseBids: ReverseBidRequirement[];
  addReverseBid: (req: Partial<ReverseBidRequirement>) => void;
  submitRFQOffer: (reqId: string, offer: any) => void;
  executeSplitOrder: (
    requirementId: string,
    allocations: { supplierCompany: string; allocatedQty: number; unitPrice: number; pickupTerms: string }[]
  ) => void;
  procurementProjects: ProcurementProject[];
  addProcurementProject: (project: Partial<ProcurementProject>) => void;
  supplyPool: SupplyPoolItem[];
  allocateSupplyPool: (poolId: string, demandIdx: number) => void;
  nearbySupplies: MaterialMatchSupply[];
  actualTransactions: ActualTransactionPriceRecord[];
  factoryClearances: FactoryClearanceProject[];
  parseNaturalLanguageToRFQ: (text: string) => {
    material: string;
    category: string;
    quantity: number;
    unit: string;
    destination: string;
    requiredDate: string;
    purpose: string;
    condition: string;
    suggestedPriceIDR: number;
  };
  calculateLandedCost: (basePricePerUnit: number, distanceKm: number, unit?: string) => LandedCostBreakdown;
  orders: Order[];
  addOrder: (order: Partial<Order>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  confirmSettlement: (orderId: string) => void;
  disputes: Dispute[];
  openDispute: (dispute: Partial<Dispute>) => void;
  resolveDispute: (disputeId: string, decision: string) => void;
  priceIndex: PriceIndexItem[];
  addPriceIndexItem: (item: Partial<PriceIndexItem>) => void;
  updatePriceIndexItem: (id: string, updated: Partial<PriceIndexItem>) => void;
  deletePriceIndexItem: (id: string) => void;
  auditLogs: AuditLog[];
  platformFees: PlatformFeeConfig[];
  updatePlatformFee: (id: string, fee: Partial<PlatformFeeConfig>) => void;
  companyProfiles: CompanyProfile[];
  currentCompany: CompanyProfile;
  kycProgress: number;
  updateKycProgress: (step: number) => void;
  isOffPlatformWarningOpen: boolean;
  openOffPlatformWarning: () => void;
  closeOffPlatformWarning: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  language: 'EN' | 'ID';
  setLanguage: (lang: 'EN' | 'ID') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User starts as public (not logged in) so message, cart, and notif are strictly hidden until login
  const [userRole, setUserRole] = useState<UserRole>('public');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [activeCurrency, setActiveCurrency] = useState<string>('IDR');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [negotiations, setNegotiations] = useState<Negotiation[]>(MOCK_NEGOTIATIONS);
  const [reverseBids, setReverseBids] = useState<ReverseBidRequirement[]>(MOCK_REVERSE_BIDS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [disputes, setDisputes] = useState<Dispute[]>(MOCK_DISPUTES);
  const [priceIndex, setPriceIndex] = useState<PriceIndexItem[]>(MOCK_PRICE_INDEX);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [platformFees, setPlatformFees] = useState<PlatformFeeConfig[]>(MOCK_PLATFORM_FEES);
  const [companyProfiles, setCompanyProfiles] = useState<CompanyProfile[]>(MOCK_COMPANY_PROFILES);
  const [procurementProjects, setProcurementProjects] = useState<ProcurementProject[]>(MOCK_PROCUREMENT_PROJECTS);
  const [supplyPool, setSupplyPool] = useState<SupplyPoolItem[]>(MOCK_SUPPLY_POOL);
  const [nearbySupplies, setNearbySupplies] = useState<MaterialMatchSupply[]>(MOCK_NEARBY_SUPPLY_WEST_JAVA);
  const [actualTransactions, setActualTransactions] = useState<ActualTransactionPriceRecord[]>(MOCK_ACTUAL_TRANSACTIONS);
  const [factoryClearances, setFactoryClearances] = useState<FactoryClearanceProject[]>(MOCK_FACTORY_CLEARANCES);
  const [kycProgress, setKycProgress] = useState<number>(5);
  const [isOffPlatformWarningOpen, setIsOffPlatformWarningOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [language, setLanguageState] = useState<'EN' | 'ID'>('ID');

  // Synchronize state with backend Express API & SQLite Database
  useEffect(() => {
    const fetchApiData = async () => {
      try {
        const [
          fetchedListings,
          fetchedNegos,
          fetchedReverseBids,
          fetchedOrders,
          fetchedDisputes,
          fetchedProjects,
          fetchedCompanies,
          sessionRes,
        ] = await Promise.allSettled([
          apiClient.listings.getAll(),
          apiClient.negotiations.getAll(),
          apiClient.reverseBids.getAll(),
          apiClient.orders.getAll(),
          apiClient.disputes.getAll(),
          apiClient.procurementProjects.getAll(),
          apiClient.companies.getAll(),
          apiClient.auth.getMe(),
        ]);

        if (fetchedListings.status === 'fulfilled' && fetchedListings.value?.length) {
          setListings(fetchedListings.value);
        }
        if (fetchedNegos.status === 'fulfilled' && fetchedNegos.value?.length) {
          setNegotiations(fetchedNegos.value);
        }
        if (fetchedReverseBids.status === 'fulfilled' && fetchedReverseBids.value?.length) {
          setReverseBids(fetchedReverseBids.value);
        }
        if (fetchedOrders.status === 'fulfilled' && fetchedOrders.value?.length) {
          setOrders(fetchedOrders.value);
        }
        if (fetchedDisputes.status === 'fulfilled' && fetchedDisputes.value?.length) {
          setDisputes(fetchedDisputes.value);
        }
        if (fetchedProjects.status === 'fulfilled' && fetchedProjects.value?.length) {
          setProcurementProjects(fetchedProjects.value);
        }
        if (fetchedCompanies.status === 'fulfilled' && fetchedCompanies.value?.length) {
          setCompanyProfiles(fetchedCompanies.value);
        }
        if (sessionRes.status === 'fulfilled' && sessionRes.value?.user) {
          setCurrentUser(sessionRes.value.user);
          setUserRole(sessionRes.value.user.role as UserRole);
        }
      } catch (err) {
        console.warn('API sync warning:', err);
      }
    };

    fetchApiData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const setLanguage = (lang: 'EN' | 'ID') => {
    setLanguageState(lang);
    showToast(lang === 'EN' ? 'Language switched to English (EN)' : 'Bahasa dialihkan ke Bahasa Indonesia (ID)');
  };

  const t = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS['ID'];
    return dict[key] || fallback || key;
  };

  // AI Natural Language Parser to Structured RFQ
  const parseNaturalLanguageToRFQ = (text: string) => {
    const lower = text.toLowerCase();

    let material = 'Heavy Melting Steel (HMS 1)';
    let category = 'Ferrous Metals';
    let suggestedPriceIDR = 7500;

    if (lower.includes('tembaga') || lower.includes('copper')) {
      material = 'Bare Bright Copper Wire (Millberry)';
      category = 'Copper';
      suggestedPriceIDR = 155000;
    } else if (lower.includes('aluminium') || lower.includes('aluminum')) {
      material = 'Aluminum Extrusion Scrap 6063';
      category = 'Aluminum';
      suggestedPriceIDR = 38000;
    } else if (lower.includes('cnc') || lower.includes('mesin') || lower.includes('machine')) {
      material = 'Industrial CNC Milling Center';
      category = 'Industrial Machinery';
      suggestedPriceIDR = 1200000000;
    }

    // Extract quantity e.g. "100 ton" or "50 mt"
    let qty = 100;
    const qtyMatch = text.match(/(\d+)\s*(ton|mt|kg)/i);
    if (qtyMatch) {
      qty = parseInt(qtyMatch[1], 10);
    }

    // Extract destination
    let dest = 'Karawang, Jawa Barat';
    if (lower.includes('bandung')) dest = 'Bandung, Jawa Barat';
    else if (lower.includes('bekasi')) dest = 'Bekasi, Jawa Barat';
    else if (lower.includes('cikarang')) dest = 'Cikarang, Jawa Barat';
    else if (lower.includes('cilegon')) dest = 'Cilegon, Banten';
    else if (lower.includes('surabaya')) dest = 'Surabaya, Jawa Timur';

    return {
      material,
      category,
      quantity: qty,
      unit: 'MT',
      destination: dest,
      requiredDate: '2026-10-20',
      purpose: lower.includes('furnace') || lower.includes('melting') || lower.includes('peleburan') ? 'Melting / Induction Furnace' : 'Manufacturing / Processing',
      condition: 'Industrial Scrap (ISRI 200)',
      suggestedPriceIDR,
    };
  };

  // Landed Cost Calculator
  const calculateLandedCost = (basePricePerUnit: number, distanceKm: number, unit = 'MT'): LandedCostBreakdown => {
    // Estimations: freight ~$0.35/km/MT, handling $3.50/MT, QC $2.00/MT, platform 1.5%
    const transportFreight = Math.round(distanceKm * 0.35 * 100) / 100;
    const handlingLoading = 3.50;
    const qcInspection = 2.00;
    const platformEscrowFee = Math.round(basePricePerUnit * 0.015 * 100) / 100;
    const insuranceCoverage = Math.round(basePricePerUnit * 0.003 * 100) / 100;
    const estimatedLandedCost = basePricePerUnit + transportFreight + handlingLoading + qcInspection + platformEscrowFee + insuranceCoverage;

    return {
      materialBasePrice: basePricePerUnit,
      transportFreight,
      handlingLoading,
      qcInspection,
      platformEscrowFee,
      insuranceCoverage,
      estimatedLandedCost: Math.round(estimatedLandedCost * 100) / 100,
      unit,
      distanceKm,
    };
  };

  // Split Order Execution
  const executeSplitOrder = async (
    requirementId: string,
    allocations: { supplierCompany: string; allocatedQty: number; unitPrice: number; pickupTerms: string }[]
  ) => {
    setReverseBids((prev) =>
      prev.map((r) => {
        if (r.id === requirementId) {
          return {
            ...r,
            isSplitFulfilled: true,
            status: 'AWARDED',
            splitOrderAllocations: allocations,
          };
        }
        return r;
      })
    );

    try {
      const res = await apiClient.reverseBids.executeSplitOrder(requirementId, allocations);
      if (res.createdOrders && res.createdOrders.length > 0) {
        setOrders((prev) => [...res.createdOrders, ...prev]);
      }
    } catch (err) {
      console.warn('API executeSplitOrder error:', err);
    }

    const totalAllocated = allocations.reduce((sum, a) => sum + a.allocatedQty, 0);
    showToast(`Split Order Confirmed! ${totalAllocated} MT fulfilled across ${allocations.length} verified suppliers.`);
  };

  const addProcurementProject = async (project: Partial<ProcurementProject>) => {
    const newProj: ProcurementProject = {
      id: `PRJ-SCR-${100 + procurementProjects.length + 1}`,
      projectCode: `SCR-2026-${100 + procurementProjects.length + 1}`,
      title: project.title || 'Factory Procurement Package',
      buyerCompany: currentCompany.name,
      deliveryDestination: project.deliveryDestination || 'Industrial Smelter Gate',
      deadline: project.deadline || '2026-11-15',
      items: project.items || [],
      totalBudgetUSD: project.totalBudgetUSD || 150000,
      status: 'AGGREGATING',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setProcurementProjects([newProj, ...procurementProjects]);
    try {
      await apiClient.procurementProjects.create(newProj);
    } catch (err) {
      console.warn('API addProcurementProject error:', err);
    }
    showToast(`Procurement Project ${newProj.projectCode} published for multi-supplier aggregation.`);
  };

  const allocateSupplyPool = (poolId: string, demandIdx: number) => {
    setSupplyPool((prev) =>
      prev.map((item) => {
        if (item.id === poolId) {
          const matched = item.matchedDemands[demandIdx];
          const allocated = Math.min(item.availableQty, matched ? matched.needQty : 50);
          return {
            ...item,
            availableQty: item.availableQty - allocated,
            status: item.availableQty - allocated <= 0 ? 'DEPLETED' : 'PARTIAL_ALLOCATED',
          };
        }
        return item;
      })
    );
    showToast('Supply inventory allocated to factory requirement through Scrava matching network.');
  };

  const openOffPlatformWarning = () => setIsOffPlatformWarningOpen(true);
  const closeOffPlatformWarning = () => setIsOffPlatformWarningOpen(false);

  // Helper for Rupiah formatting everywhere in the application
  const formatPrice = (amount: number, unit?: string) => {
    // If amount is from legacy mock data in USD (e.g. <= 100,000), convert using standard 16.000 rate
    const idrValue = amount <= 100000 ? Math.round(amount * 16000) : Math.round(amount);
    const formattedVal = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(idrValue);
    const priceText = `Rp ${formattedVal}`;
    return unit ? `${priceText}/${unit}` : priceText;
  };

  const auctions = listings.filter((l) => l.listingType === 'AUCTION');

  const addListing = (newListingData: Partial<Listing>): Listing => {
    const id = `LIST-${1000 + listings.length + 1}`;
    const newListing: Listing = {
      id,
      title: newListingData.title || 'Untitled Material',
      category: newListingData.category || 'Ferrous Metals',
      description: newListingData.description || '',
      quantity: Number(newListingData.quantity) || 10,
      unit: newListingData.unit || 'MT',
      pricePerUnit: Number(newListingData.pricePerUnit) || 100,
      currency: 'USD',
      totalPrice: (Number(newListingData.pricePerUnit) || 100) * (Number(newListingData.quantity) || 10),
      listingType: newListingData.listingType || 'FIXED_PRICE',
      condition: newListingData.condition || 'Clean',
      incoterm: newListingData.incoterm || 'EXW',
      location: newListingData.location || {
        country: 'Indonesia',
        city: 'Surabaya',
        address: 'Kawasan Industri Rungkut',
      },
      seller: {
        id: currentCompany.id,
        companyName: currentCompany.name,
        verified: currentCompany.verified,
        rating: currentCompany.rating,
        completedTx: currentCompany.completedTransactions,
        country: currentCompany.country,
        responseRate: currentCompany.responseRate,
      },
      photos: newListingData.photos && newListingData.photos.length > 0 ? newListingData.photos : [INITIAL_LISTINGS[0].photos[0]],
      specs: newListingData.specs || { 'Standard': 'Commercial Grade' },
      documents: newListingData.documents || ['Material Spec Sheet.pdf'],
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'Published',
      viewsCount: 1,
      minAskingPrice: newListingData.minAskingPrice,
      currentBid: newListingData.currentBid || newListingData.minAskingPrice,
      bidIncrement: newListingData.bidIncrement || 10,
      bidCount: 0,
      closingCountdown: '5d 00h 00m',
      isPaidPromotion: Boolean(newListingData.isPaidPromotion),
      promotionTier: newListingData.promotionTier || (newListingData.isPaidPromotion ? 'PREMIUM_FEATURED' : 'STANDARD_FREE'),
    };

    setListings([newListing, ...listings]);
    apiClient.listings.create(newListing).catch(console.warn);
    showToast(`Listing "${newListing.title.slice(0, 30)}..." published successfully!`);
    return newListing;
  };

  const updateListingStatus = (id: string, status: Listing['status']) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    apiClient.listings.updateStatus(id, status).catch(console.warn);
    showToast(`Listing status updated to ${status}`);
  };

  const placeBid = (listingId: string, amount: number) => {
    const target = listings.find((l) => l.id === listingId);
    if (!target) return { success: false, message: 'Listing not found' };

    const minAllowed = (target.currentBid || target.minAskingPrice || 0) + (target.bidIncrement || 10);
    if (amount < minAllowed) {
      return { success: false, message: `Minimum bid must be at least $${minAllowed}` };
    }

    setListings((prev) =>
      prev.map((l) => {
        if (l.id === listingId) {
          return {
            ...l,
            currentBid: amount,
            bidCount: (l.bidCount || 0) + 1,
          };
        }
        return l;
      })
    );

    apiClient.listings.placeBid(listingId, amount, currentCompany.name, currentCompany.country).catch(console.warn);

    // Add audit log
    const newLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: currentCompany.name,
      action: 'AUCTION_BID_PLACED',
      entity: 'Auction',
      entityId: listingId,
      ip: '103.245.38.12',
      status: 'SUCCESS',
      details: `Placed winning bid of $${amount}/unit on listing ${listingId}`,
    };
    setAuditLogs([newLog, ...auditLogs]);

    showToast(`Tawaran lelang sebesar ${formatPrice(amount)} berhasil dipasang! Anda adalah penawar tertinggi.`);
    return { success: true, message: 'Tawaran lelang berhasil dipasang' };
  };

  const sendNegotiationOffer = (
    negId: string,
    offer: { pricePerUnit: number; quantity: number; unit: string; incoterm: any; notes?: string },
    text: string
  ) => {
    setNegotiations((prev) =>
      prev.map((n) => {
        if (n.id === negId) {
          const isSellerInNeg = n.sellerCompany === currentCompany.name;
          const newMsg = {
            id: `MSG-${Date.now().toString().slice(-4)}`,
            senderCompany: isSellerInNeg ? n.sellerCompany : n.buyerCompany,
            senderRole: (isSellerInNeg ? 'seller' : 'buyer') as 'buyer' | 'seller',
            text,
            timestamp: 'Baru saja',
            offer: {
              ...offer,
              totalAmount: offer.pricePerUnit * offer.quantity,
            },
          };
          return {
            ...n,
            currentOfferPrice: offer.pricePerUnit,
            currentOfferQty: offer.quantity,
            incoterm: offer.incoterm,
            status: 'Countered',
            updatedAt: 'Baru saja',
            messages: [...n.messages, newMsg],
          };
        }
        return n;
      })
    );
    apiClient.negotiations.sendOffer(negId, offer, text).catch(console.warn);
    showToast('Tawaran balasan berhasil dikirim melalui kanal negosiasi resmi.');
  };

  const acceptNegotiation = async (negId: string) => {
    setNegotiations((prev) =>
      prev.map((n) => (n.id === negId ? { ...n, status: 'Accepted', updatedAt: 'Baru saja' } : n))
    );
    try {
      const res = await apiClient.negotiations.accept(negId);
      if (res.createdOrder) {
        setOrders((prev) => [res.createdOrder, ...prev]);
      }
    } catch (err) {
      console.warn('API acceptNegotiation error:', err);
    }
    showToast('Tawaran disepakati! Pesanan siap diproses ke checkout pembayaran.');
  };

  const addReverseBid = (reqData: Partial<ReverseBidRequirement>) => {
    const newId = `RFQ-${800 + reverseBids.length + 1}`;
    const newReq: ReverseBidRequirement = {
      id: newId,
      title: reqData.title || 'Kebutuhan Pasokan Material',
      category: reqData.category || 'Ferrous Metals',
      material: reqData.material || 'Material Scrap Industri',
      grade: reqData.grade || 'Standar',
      quantity: Number(reqData.quantity) || 50,
      unit: reqData.unit || 'MT',
      targetPrice: Number(reqData.targetPrice) || 350,
      currency: 'IDR',
      deliveryLocation: reqData.deliveryLocation || 'Pintu Jembatan Timbang Pabrik',
      requiredDate: reqData.requiredDate || '2026-10-30',
      incoterm: reqData.incoterm || 'DDP',
      specifications: reqData.specifications || 'Spesifikasi standar pabrik',
      deadline: reqData.deadline || '2026-10-15',
      buyerCompany: currentCompany.name,
      buyerCountry: currentCompany.country,
      buyerVerified: currentCompany.verified,
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'OPEN',
      responsesCount: 0,
      responses: [],
    };
    setReverseBids([newReq, ...reverseBids]);
    apiClient.reverseBids.create(newReq).catch(console.warn);
    showToast('Kebutuhan bahan berhasil diterbitkan! Pemasok akan segera diberi tahu.');
  };

  const submitRFQOffer = (reqId: string, offer: any) => {
    setReverseBids((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          const newResp = {
            id: `RESP-${Date.now().toString().slice(-4)}`,
            requirementId: reqId,
            sellerCompany: currentCompany.name,
            sellerCountry: currentCompany.country,
            sellerVerified: currentCompany.verified,
            pricePerUnit: Number(offer.pricePerUnit),
            quantityOffered: Number(offer.quantityOffered),
            unit: r.unit,
            incoterm: offer.incoterm || r.incoterm,
            deliveryTimeline: offer.deliveryTimeline || '7 hari kerja',
            notes: offer.notes || 'Kapasitas siap kirim dari gudang depo.',
            submittedAt: 'Baru saja',
            status: 'PENDING' as const,
          };
          return {
            ...r,
            responsesCount: r.responsesCount + 1,
            responses: [newResp, ...r.responses],
          };
        }
        return r;
      })
    );
    apiClient.reverseBids.submitOffer(reqId, offer).catch(console.warn);
    showToast('Penawaran Anda berhasil dikirim ke tim pengadaan pabrik.');
  };

  const addOrder = (orderData: Partial<Order>): Order => {
    const id = `ORD-${Date.now().toString().slice(-6)}`;
    const fullOrder: Order = {
      id,
      orderNumber: orderData.orderNumber || `SCR-${Math.floor(100000 + Math.random() * 900000)}`,
      listingId: orderData.listingId || '',
      productTitle: orderData.productTitle || 'Pesanan Bahan Baku Industri',
      productImage: orderData.productImage || '',
      category: orderData.category || 'Ferrous Metals',
      sellerCompany: orderData.sellerCompany || 'PT Nusantara Metalindo',
      sellerCountry: orderData.sellerCountry || 'Indonesia',
      buyerCompany: orderData.buyerCompany || currentCompany.name,
      buyerCountry: orderData.buyerCountry || currentCompany.country,
      quantity: orderData.quantity || 1,
      unit: orderData.unit || 'MT',
      agreedPricePerUnit: orderData.agreedPricePerUnit || 0,
      totalOriginalValue: orderData.totalOriginalValue || 0,
      currency: orderData.currency || 'IDR',
      incoterm: orderData.incoterm || 'EXW',
      status: orderData.status || 'PAYMENT_PENDING',
      paymentStatus: orderData.paymentStatus || 'PENDING',
      pickupDetails: orderData.pickupDetails || {
        scheduledDate: '2026-10-02',
        pickupAddress: 'Hub Logistik Resmi',
        transporter: 'Scrava Logistics',
        vehiclePlate: 'B 1234 CD',
        driverName: 'Sopir Truk Terverifikasi',
        status: 'Scheduled',
      },
      weighbridge: orderData.weighbridge || {
        expectedWeight: orderData.quantity || 0,
        actualGrossWeight: 0,
        tareWeight: 0,
        actualNetWeight: 0,
        unit: orderData.unit || 'MT',
        difference: 0,
        ticketNumber: `WB-${id}`,
        stationName: 'Jembatan Timbang Metrologi Resmi',
        dateRecorded: 'Menunggu',
        isVerified: false,
      },
      qc: orderData.qc || {
        inspector: 'Sucofindo',
        status: 'PENDING',
        notes: 'Menunggu kedatangan di pabrik',
        inspectionDate: 'Menunggu',
        samplePurityPercentage: 98,
      },
      settlement: orderData.settlement || {
        originalValue: orderData.totalOriginalValue || 0,
        actualWeight: orderData.quantity || 0,
        adjustedValue: orderData.totalOriginalValue || 0,
        platformFeeRate: 0.005,
        platformFee: 0,
        taxRate: 0.11,
        taxes: 0,
        transportCost: 0,
        finalSellerPayout: orderData.totalOriginalValue || 0,
        adjustmentDelta: 0,
        status: 'PENDING',
      },
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setOrders((prev) => [fullOrder, ...prev]);
    apiClient.orders.create(fullOrder).catch(console.warn);
    return fullOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = { ...o, status };
          if (status === 'COMPLETED') {
            updated.completedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
            updated.settlement = { ...updated.settlement, status: 'PAID' };
          }
          return updated;
        }
        return o;
      })
    );
    apiClient.orders.updateStatus(orderId, status).catch(console.warn);
    showToast(`Status pesanan diperbarui`);
  };

  const confirmSettlement = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'COMPLETED',
            settlement: {
              ...o.settlement,
              status: 'CONFIRMED',
            },
          };
        }
        return o;
      })
    );
    apiClient.orders.confirmSettlement(orderId).catch(console.warn);
    showToast('Pencairan dana dikonfirmasi dan transaksi selesai!');
  };

  const openDispute = (disputeData: Partial<Dispute>) => {
    const newDispute: Dispute = {
      id: `DSP-${9000 + disputes.length + 1}`,
      disputeNumber: `DISP-2026-${9000 + disputes.length + 1}`,
      orderId: disputeData.orderId || 'ORD-2026-000123',
      orderNumber: disputeData.orderNumber || 'SCR-2026-000123',
      productTitle: disputeData.productTitle || 'Pesanan Material Industri',
      raisedByCompany: currentCompany.name,
      raisedByRole: isBuyerVerified ? 'buyer' : 'seller',
      againstCompany: disputeData.againstCompany || 'Mitra Transaksi',
      reason: disputeData.reason || 'Weight discrepancy',
      description: disputeData.description || 'Selisih tonase diverifikasi pada tiket jembatan timbang resmi.',
      evidenceFiles: ['weighbridge_ticket.pdf'],
      claimAmount: disputeData.claimAmount || 500,
      currency: 'IDR',
      priority: disputeData.priority || 'MEDIUM',
      status: 'OPEN',
      createdAt: 'Baru saja',
    };
    setDisputes([newDispute, ...disputes]);
    if (disputeData.orderId) {
      updateOrderStatus(disputeData.orderId, 'DISPUTED');
    }
    apiClient.disputes.create(newDispute).catch(console.warn);
    showToast('Pengajuan sengketa berhasil dibuka. Mediator admin ditugaskan meninjau berkas.');
  };

  const resolveDispute = (disputeId: string, decision: string) => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === disputeId ? { ...d, status: 'RESOLVED', adminDecision: decision } : d))
    );
    apiClient.disputes.resolve(disputeId, decision).catch(console.warn);
    showToast('Sengketa berhasil diselesaikan oleh Admin Platform.');
  };

  const addPriceIndexItem = (item: Partial<PriceIndexItem>) => {
    const newItem: PriceIndexItem = {
      id: `PI-${priceIndex.length + 10}`,
      material: item.material || 'Material Baru',
      grade: item.grade || 'Standar',
      category: item.category || 'Ferrous Metals',
      price: Number(item.price) || 100,
      unit: item.unit || 'MT',
      currency: item.currency || 'IDR',
      country: item.country || 'Indonesia',
      location: item.location || 'Pelabuhan Merak',
      updated: 'Hari ini',
      change24h: Number(item.change24h) || 0.0,
      source: item.source || 'Indeks Transaksi Pasar Scrava',
      historicalRange: item.historicalRange || { min: 90, max: 120 },
    };
    setPriceIndex([newItem, ...priceIndex]);
    showToast(`Referensi harga untuk "${newItem.material}" berhasil ditambahkan.`);
  };

  const updatePriceIndexItem = (id: string, updated: Partial<PriceIndexItem>) => {
    setPriceIndex((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    showToast('Referensi indeks harga berhasil diperbarui.');
  };

  const deletePriceIndexItem = (id: string) => {
    setPriceIndex((prev) => prev.filter((p) => p.id !== id));
    showToast('Referensi harga dihapus.');
  };

  const updatePlatformFee = (id: string, fee: Partial<PlatformFeeConfig>) => {
    setPlatformFees((prev) => prev.map((f) => (f.id === id ? { ...f, ...fee } : f)));
    showToast('Konfigurasi biaya platform berhasil disimpan.');
  };

  const updateKycProgress = (step: number) => {
    setKycProgress(step);
    showToast(`Tahap verifikasi ${step}/6 berhasil disimpan.`);
  };

  const isBuyerVerified = currentUser?.isBuyerVerified ?? false;

  const verifyCustomerAsBuyer = (factoryData: { companyName: string; nib?: string; npwp?: string; phone?: string; picName?: string; businessType?: string; address?: string }) => {
    setCurrentUser((prev) => ({
      id: prev?.id || 'USR-CUSTOMER',
      name: factoryData.picName || prev?.name || 'Hendra Wijaya',
      email: prev?.email || 'pengadaan@pabrik.co.id',
      phone: factoryData.phone || prev?.phone || '0812-3456-7890',
      role: 'customer',
      companyName: factoryData.companyName,
      businessType: factoryData.businessType || 'Pabrik Peleburan / Smelter Baja',
      isGoogleAuth: prev?.isGoogleAuth ?? false,
      isVerified: true,
      isBuyerVerified: true,
      legalDocs: {
        nib: factoryData.nib || '0220001234567',
        npwp: factoryData.npwp || '01.992.112.8-041.000',
        companyLegalName: factoryData.companyName,
        status: 'VERIFIED',
        verifiedAt: 'Hari ini',
      },
    }));
    showToast(`Dokumen legalitas diverifikasi! Akses Pembeli Pabrik (${factoryData.companyName}) kini aktif.`);
  };

  const toggleBuyerVerification = (explicitState?: boolean) => {
    setCurrentUser((prev) => {
      const nextState = explicitState !== undefined ? explicitState : !prev?.isBuyerVerified;
      showToast(
        nextState
          ? 'Status Pembeli: TERVERIFIKASI (Akses Pembelian & RFQ Aktif)'
          : 'Status Pembeli: BELUM VERIFIKASI (Hanya Penjual/Depo)'
      );
      return {
        id: prev?.id || 'USR-CUSTOMER',
        name: prev?.name || 'Hendra Wijaya',
        email: prev?.email || 'zistex.team@gmail.com',
        phone: prev?.phone || '0812-3456-7890',
        role: 'customer',
        companyName: nextState ? 'PT Cilegon Precision Steel' : 'Depo Scrap Berkah Mandiri',
        businessType: nextState ? 'Pabrik Peleburan / Smelter Baja' : 'Depo Scrap & Pengepul Logam',
        isGoogleAuth: prev?.isGoogleAuth ?? false,
        isVerified: true,
        isBuyerVerified: nextState,
        legalDocs: {
          status: nextState ? 'VERIFIED' : 'UNVERIFIED',
          nib: nextState ? '0220001234567' : undefined,
          npwp: nextState ? '01.992.112.8-041.000' : undefined,
        },
      };
    });
  };

  const loginWithGoogle = (options?: { role?: 'customer' | 'admin' | string; name?: string; email?: string; companyName?: string }) => {
    const isAdmin = options?.role === 'admin' || options?.role === 'superadmin';
    const email = options?.email || (isAdmin ? 'admin@scrava.id' : 'hendra@scrava.id');
    const newUser: CurrentUser = {
      id: `USR-G-${Date.now()}`,
      name: options?.name || (isAdmin ? 'Admin Operasional Scrava' : 'Hendra Wijaya'),
      email,
      phone: '0812-9876-5432',
      role: isAdmin ? 'admin' : 'customer',
      customerPersona: 'all_in_one',
      companyName: isAdmin ? 'Scrava Operations HQ' : (options?.companyName || 'PT Logam Lestari Nusantara'),
      businessType: isAdmin ? 'Platform & Escrow Operator' : 'Pabrik & Pengepul Scrap Terpadu',
      isGoogleAuth: true,
      isVerified: true,
      isBuyerVerified: true,
      legalDocs: {
        status: 'VERIFIED',
        nib: '9120001234567',
        npwp: '01.234.567.8-012.000',
      },
    };
    setCurrentUser(newUser);
    setUserRole(isAdmin ? 'admin' : 'customer');
    apiClient.auth.login({ email, role: isAdmin ? 'admin' : 'customer' }).catch(console.warn);
    showToast(isAdmin ? 'Berhasil masuk sebagai Admin Scrava' : 'Berhasil masuk sebagai Customer (Pabrik & Pengepul)');
  };

  const upgradeToFactory = (factoryData: { companyName: string; phone?: string; picName?: string; businessType?: string; address?: string; nib?: string; npwp?: string }) => {
    verifyCustomerAsBuyer(factoryData);
    apiClient.auth.verifyBuyer(factoryData).catch(console.warn);
  };

  // Determine current active company by role
  const currentCompany: CompanyProfile =
    userRole === 'admin'
      ? {
          id: 'ADMIN-01',
          name: 'Scrava Admin Operations',
          logo: '👑',
          verified: true,
          country: 'Indonesia',
          businessType: 'Bursa Exchange & Escrow Operator',
          yearsActive: 5,
          completedTransactions: 1240,
          totalTradeVolume: 'Rp 680.000.000.000',
          rating: 5.0,
          responseRate: '100%',
          kycStatus: 'VERIFIED',
          kycProgress: 6,
          materialsTraded: ['All Categories'],
          address: 'Gedung Bursa Efek Indonesia, Tower 2, SCBD Jakarta',
          taxId: 'ID-NPWP-01.882.193.1-012.000',
          bankAccount: 'Bank Central Asia - Escrow Kustodi Resmi',
        }
      : {
          id: currentUser?.id || 'CUST-01',
          name: currentUser?.companyName || 'PT Nusantara Metal & Smelting',
          logo: '🏢',
          verified: true,
          country: 'Indonesia',
          businessType: currentUser?.businessType || 'Pabrik & Depo Scrap Logam Terpadu',
          yearsActive: 8,
          completedTransactions: 128,
          totalTradeVolume: 'Rp 42.500.000.000',
          rating: 4.9,
          responseRate: '98%',
          kycStatus: 'VERIFIED',
          kycProgress: 6,
          materialsTraded: ['HMS 1', 'HMS 2', 'Tembaga Millberry', 'Aluminium Extrusion', 'Mesin Bekas'],
          address: 'Kawasan Industri MM2100, Cikarang Barat, Bekasi, Jawa Barat',
          taxId: currentUser?.legalDocs?.npwp || 'ID-NPWP-01.992.112.8-041.000',
          bankAccount: 'Bank Central Asia / Bank Mandiri Escrow Verified',
        };

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        currentUser,
        setCurrentUser,
        isBuyerVerified,
        verifyCustomerAsBuyer,
        toggleBuyerVerification,
        loginWithGoogle,
        upgradeToFactory,
        activeCurrency,
        setActiveCurrency,
        formatPrice,
        searchQuery,
        setSearchQuery,
        listings,
        addListing,
        updateListingStatus,
        auctions,
        placeBid,
        negotiations,
        sendNegotiationOffer,
        acceptNegotiation,
        reverseBids,
        addReverseBid,
        submitRFQOffer,
        executeSplitOrder,
        procurementProjects,
        addProcurementProject,
        supplyPool,
        allocateSupplyPool,
        nearbySupplies,
        actualTransactions,
        factoryClearances,
        parseNaturalLanguageToRFQ,
        calculateLandedCost,
        orders,
        addOrder,
        updateOrderStatus,
        confirmSettlement,
        disputes,
        openDispute,
        resolveDispute,
        priceIndex,
        addPriceIndexItem,
        updatePriceIndexItem,
        deletePriceIndexItem,
        auditLogs,
        platformFees,
        updatePlatformFee,
        companyProfiles,
        currentCompany,
        kycProgress,
        updateKycProgress,
        isOffPlatformWarningOpen,
        openOffPlatformWarning,
        closeOffPlatformWarning,
        toastMessage,
        showToast,
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
