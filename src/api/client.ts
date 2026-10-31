import {
  Listing,
  Negotiation,
  ReverseBidRequirement,
  Order,
  Dispute,
  ProcurementProject,
  CompanyProfile,
  CurrentUser,
  AuditLog,
  OrderStatus,
  ProjectAuction,
  AuctionDeposit,
  ProjectBid,
  PlatformFeeConfig,
} from '../types';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorBody.message || errorBody.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const apiClient = {
  // Auth
  auth: {
    getMe: async (): Promise<{ user: CurrentUser | null }> => {
      return fetchJson('/api/auth/me');
    },
    login: async (credentials: { email?: string; password?: string; role?: string }): Promise<{ success: boolean; user: CurrentUser }> => {
      return fetchJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },
    register: async (data: {
      name: string;
      email: string;
      phone?: string;
      companyName?: string;
      businessType?: string;
      role?: string;
    }): Promise<{ success: boolean; user: CurrentUser }> => {
      return fetchJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    logout: async (): Promise<{ success: boolean }> => {
      return fetchJson('/api/auth/logout', { method: 'POST' });
    },
    verifyBuyer: async (data: any): Promise<{ success: boolean; user: CurrentUser }> => {
      return fetchJson('/api/auth/verify-buyer', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  // Listings & Auctions
  listings: {
    getAll: async (params?: { category?: string; type?: string; search?: string }): Promise<Listing[]> => {
      const q = new URLSearchParams();
      if (params?.category) q.append('category', params.category);
      if (params?.type) q.append('type', params.type);
      if (params?.search) q.append('search', params.search);
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return fetchJson(`/api/listings${queryString}`);
    },
    getById: async (id: string): Promise<Listing> => {
      return fetchJson(`/api/listings/${id}`);
    },
    create: async (data: Partial<Listing>): Promise<Listing> => {
      return fetchJson('/api/listings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    updateStatus: async (id: string, status: Listing['status']): Promise<Listing> => {
      return fetchJson(`/api/listings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    delete: async (id: string): Promise<{ success: boolean }> => {
      return fetchJson(`/api/listings/${id}`, { method: 'DELETE' });
    },
    placeBid: async (
      id: string,
      amount: number,
      bidderCompany?: string,
      bidderCountry?: string
    ): Promise<{ success: boolean; message: string; currentBid?: number; bidCount?: number }> => {
      return fetchJson(`/api/listings/${id}/bid`, {
        method: 'POST',
        body: JSON.stringify({ amount, bidderCompany, bidderCountry }),
      });
    },
  },

  // Negotiations
  negotiations: {
    getAll: async (): Promise<Negotiation[]> => {
      return fetchJson('/api/negotiations');
    },
    getById: async (id: string): Promise<Negotiation> => {
      return fetchJson(`/api/negotiations/${id}`);
    },
    sendOffer: async (
      id: string,
      offer: { pricePerUnit: number; quantity: number; unit?: string; incoterm?: any; notes?: string },
      text: string
    ): Promise<Negotiation> => {
      return fetchJson(`/api/negotiations/${id}/offer`, {
        method: 'POST',
        body: JSON.stringify({ offer, text }),
      });
    },
    accept: async (id: string): Promise<{ negotiation: Negotiation; createdOrder: Order }> => {
      return fetchJson(`/api/negotiations/${id}/accept`, { method: 'POST' });
    },
  },

  // Orders
  orders: {
    getAll: async (): Promise<Order[]> => {
      return fetchJson('/api/orders');
    },
    getById: async (id: string): Promise<Order> => {
      return fetchJson(`/api/orders/${id}`);
    },
    create: async (data: Partial<Order>): Promise<Order> => {
      return fetchJson('/api/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    updateStatus: async (
      id: string,
      status: OrderStatus,
      paymentStatus?: string,
      shippingStatus?: string
    ): Promise<Order> => {
      return fetchJson(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, paymentStatus, shippingStatus }),
      });
    },
    confirmSettlement: async (id: string): Promise<Order> => {
      return fetchJson(`/api/orders/${id}/settle`, { method: 'POST' });
    },
  },

  // Reverse Bids
  reverseBids: {
    getAll: async (): Promise<ReverseBidRequirement[]> => {
      return fetchJson('/api/reverse-bids');
    },
    getById: async (id: string): Promise<ReverseBidRequirement> => {
      return fetchJson(`/api/reverse-bids/${id}`);
    },
    create: async (data: Partial<ReverseBidRequirement>): Promise<ReverseBidRequirement> => {
      return fetchJson('/api/reverse-bids', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    submitOffer: async (id: string, offer: any): Promise<ReverseBidRequirement> => {
      return fetchJson(`/api/reverse-bids/${id}/offer`, {
        method: 'POST',
        body: JSON.stringify({ offer }),
      });
    },
    executeSplitOrder: async (
      id: string,
      allocations: { supplierCompany: string; allocatedQty: number; unitPrice: number; pickupTerms: string }[]
    ): Promise<{ success: boolean; createdOrders: Order[] }> => {
      return fetchJson(`/api/reverse-bids/${id}/split-order`, {
        method: 'POST',
        body: JSON.stringify({ allocations }),
      });
    },
  },

  // Disputes
  disputes: {
    getAll: async (): Promise<Dispute[]> => {
      return fetchJson('/api/disputes');
    },
    create: async (data: Partial<Dispute>): Promise<Dispute> => {
      return fetchJson('/api/disputes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    resolve: async (id: string, decision: string): Promise<Dispute> => {
      return fetchJson(`/api/disputes/${id}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ decision }),
      });
    },
  },

  // Procurement Projects
  procurementProjects: {
    getAll: async (): Promise<ProcurementProject[]> => {
      return fetchJson('/api/procurement-projects');
    },
    create: async (data: Partial<ProcurementProject>): Promise<ProcurementProject> => {
      return fetchJson('/api/procurement-projects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  // Companies & Admin
  companies: {
    getAll: async (): Promise<CompanyProfile[]> => {
      return fetchJson('/api/companies');
    },
    updateKyc: async (id: string, status: string): Promise<{ success: boolean; status: string }> => {
      return fetchJson(`/api/companies/${id}/kyc`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
  },

  admin: {
    getOverview: async (): Promise<any> => {
      return fetchJson('/api/admin/overview');
    },
    getAuditLogs: async (): Promise<AuditLog[]> => {
      return fetchJson('/api/admin/audit-logs');
    },
    getFees: async (): Promise<PlatformFeeConfig[]> => {
      return fetchJson('/api/admin/fees');
    },
    updateFee: async (id: string, fee: Partial<PlatformFeeConfig>): Promise<PlatformFeeConfig> => {
      return fetchJson(`/api/admin/fees/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(fee),
      });
    },
  },

  // Project Auctions (Lelang Proyek) & Bid History
  projectAuctions: {
    getAll: async (params?: { status?: string; includePending?: boolean }): Promise<ProjectAuction[]> => {
      const q = new URLSearchParams();
      if (params?.status) q.append('status', params.status);
      if (params?.includePending) q.append('includePending', 'true');
      const qs = q.toString() ? `?${q.toString()}` : '';
      return fetchJson(`/api/project-auctions${qs}`);
    },
    getById: async (id: string): Promise<{ project: ProjectAuction; bids: ProjectBid[]; deposits: AuctionDeposit[] }> => {
      return fetchJson(`/api/project-auctions/${id}`);
    },
    create: async (data: Partial<ProjectAuction>): Promise<ProjectAuction> => {
      return fetchJson('/api/project-auctions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    approve: async (id: string): Promise<{ success: boolean; message: string; project: ProjectAuction }> => {
      return fetchJson(`/api/project-auctions/${id}/approve`, { method: 'POST' });
    },
    reject: async (id: string): Promise<{ success: boolean; message: string }> => {
      return fetchJson(`/api/project-auctions/${id}/reject`, { method: 'POST' });
    },
    buyNow: async (id: string, buyerCompany?: string): Promise<{ success: boolean; message: string; order: any }> => {
      return fetchJson(`/api/project-auctions/${id}/buy-now`, {
        method: 'POST',
        body: JSON.stringify({ buyerCompany }),
      });
    },
    deposit: async (id: string, companyName?: string, autoVerify = false, bank = 'BCA'): Promise<{ success: boolean; deposit: AuctionDeposit; pinCode?: string }> => {
      return fetchJson(`/api/project-auctions/${id}/deposit`, {
        method: 'POST',
        body: JSON.stringify({ companyName, autoVerify, bank }),
      });
    },
    registerDeposit: async (id: string, companyName?: string, bank = 'BCA'): Promise<{ success: boolean; deposit: AuctionDeposit; pinCode?: string }> => {
      return fetchJson(`/api/project-auctions/${id}/deposit`, {
        method: 'POST',
        body: JSON.stringify({ companyName, bank }),
      });
    },
    verifyDeposit: async (id: string, depositId?: string, companyName?: string): Promise<{ success: boolean; message: string; deposit?: AuctionDeposit }> => {
      return fetchJson(`/api/project-auctions/${id}/verify-deposit`, {
        method: 'POST',
        body: JSON.stringify({ depositId, companyName }),
      });
    },
    requestOtp: async (id: string, companyName?: string): Promise<{ success: boolean; message: string; otp: string; otpCode: string; expiresInSeconds?: number }> => {
      const res = await fetchJson<{ success: boolean; message: string; otp?: string; otpCode?: string; expiresInSeconds?: number }>(`/api/project-auctions/${id}/request-otp`, {
        method: 'POST',
        body: JSON.stringify({ companyName }),
      });
      const code = res.otp || res.otpCode || '';
      return { ...res, otp: code, otpCode: code };
    },
    submitBid: async (id: string, amount: number, otp: string, companyName?: string): Promise<{ success: boolean; message: string; project: ProjectAuction; bids: ProjectBid[] }> => {
      return fetchJson(`/api/project-auctions/${id}/bid`, {
        method: 'POST',
        body: JSON.stringify({ amount, otp, companyName }),
      });
    },
    placeBid: async (id: string, companyName: string, amount: number, otp: string): Promise<{ success: boolean; message: string; project: ProjectAuction; bids: ProjectBid[] }> => {
      return fetchJson(`/api/project-auctions/${id}/bid`, {
        method: 'POST',
        body: JSON.stringify({ amount, otp, companyName }),
      });
    },
    awardWinner: async (id: string, companyName?: string, amount?: number): Promise<{ success: boolean; project: ProjectAuction; winner: any }> => {
      return fetchJson(`/api/project-auctions/${id}/award`, {
        method: 'POST',
        body: JSON.stringify({ companyName, amount }),
      });
    },
    settleWinner: async (id: string): Promise<{ success: boolean; message: string }> => {
      return fetchJson(`/api/project-auctions/${id}/settle-winner`, { method: 'POST' });
    },
    refundLoser: async (id: string, depositId: string): Promise<{ success: boolean; message: string; netRefund: number; deduction: number }> => {
      return fetchJson(`/api/project-auctions/${id}/refund-loser`, {
        method: 'POST',
        body: JSON.stringify({ depositId }),
      });
    },
  },
  system: {
    getServerTime: async (): Promise<{ iso: string; timestamp: number; formattedWIB: string }> => {
      return fetchJson('/api/server-time');
    },
  },
};
