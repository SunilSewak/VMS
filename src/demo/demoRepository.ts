/**
 * AVEMS Demo Repository Pattern
 *
 * Single repository that handles all demo data operations.
 * Each service layer simply routes to either SupabaseRepository or DemoRepository.
 *
 * Key Benefits:
 * - Single source of truth for demo data
 * - Easy to add new entity types (just add a collection key)
 * - Clean separation between data access and business logic
 * - Future-proof: new modules just need to add their entity types
 */

import { DEMO_COLLECTIONS, demoGet, demoSet, demoInsert, demoUpdate, demoDelete, demoFindById } from './demoStorage';

// ─── Types for all entity collections ──────────────────────────────────────────

// Meeting types
export interface DemoDivision {
  id: string;
  division_name: string;
  active: boolean;
}

export interface DemoCity {
  id: string;
  city_name: string;
  state: string;
  tier?: string;
}

export interface DemoMeetingType {
  id: string;
  meeting_type_name: string;
  active: boolean;
}

export interface DemoMeetingRequest {
  id: string;
  request_number: string;
  meeting_name: string;
  division_id: string;
  meeting_type_id: string;
  city_id: string;
  zone: string;
  start_date: string;
  end_date: string;
  expected_pax: number;
  guaranteed_pax: number;
  residential_flag: boolean;
  rooms_required: number;
  halls_required: number;
  seating_style: string;
  av_requirements: string;
  food_requirements: string;
  transfer_requirements: string;
  status: string;
  created_at: string;
  created_by?: string;
  divisions?: { division_name: string };
  meeting_types?: { meeting_type_name: string };
  cities?: { city_name: string };
}

// Venue types
export interface DemoHotelCategory {
  id: string;
  category_code: string;
  category_name: string;
}

export interface DemoHall {
  id: string;
  hotel_id: string;
  hall_name: string;
  capacity: number;
  area?: number;
  floor_name?: string;
  seating_types?: string;
}

export interface DemoHotel {
  id: string;
  hotel_name: string;
  category_id: string;
  city_id: string;
  address?: string;
  contact_person?: string;
  contact_number?: string;
  email?: string;
  remarks?: string;
  status: string;
  is_deleted?: boolean;
  largest_hall_capacity?: number;
  hotel_categories?: DemoHotelCategory;
  cities?: DemoCity;
  halls?: DemoHall[];
  venue_photos?: any[];
}

export interface DemoVenueShortlist {
  id: string;
  request_id: string;
  hotel_id: string;
  hall_id?: string;
  shortlisted_by: string;
  shortlisted_at: string;
  hotels?: DemoHotel;
}

// Commercial types
export interface DemoQuotation {
  id: string;
  request_id: string;
  hotel_id: string;
  amount: number;
  currency: string;
  status: string;
  submitted_at: string;
}

// Booking types
export interface DemoBooking {
  id: string;
  meeting_request_id: string;
  request_id?: string;
  hotel_id: string;
  hall_id?: string;
  booking_reference?: string;
  status: string;
  check_in: string;
  check_out: string;
  rooms: number;
  halls_booked?: number;
  expected_pax?: number;
  special_requirements?: string;
  amount?: number;
  currency?: string;
  confirmed_by?: string;
  confirmed_at?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  updated_by?: string;
}

// Finance types
export interface DemoInvoice {
  id: string;
  booking_id: string;
  invoice_number: string;
  invoice_date: string;
  invoice_amount: number;
  room_charges: number;
  hall_charges: number;
  food_charges: number;
  tax_amount: number;
  pax_billed: number;
  remarks?: string | null;
  status: string;
  verified_by?: string | null;
  verified_at?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  created_by?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
  is_deleted?: boolean;
  deleted_at?: string | null;
  deleted_by?: string | null;
}

export interface DemoInvoiceVariance {
  id: string;
  invoice_id: string;
  category: string;
  expected_value: number;
  actual_value: number;
  variance_amount: number;
  variance_percentage: number;
  severity: string;
  description: string;
  created_at: string;
}

export interface DemoPayment {
  id: string;
  invoice_id: string;
  amount: number;
  currency: string;
  payment_mode: string;
  reference: string;
  paid_at: string;
  status: string;
}

// ─── Repository Interface ─────────────────────────────────────────────────────
export interface DemoRepository {
  // Divisions
  getDivisions(): Promise<DemoDivision[]>;

  // Cities
  getCities(): Promise<DemoCity[]>;

  // Meeting Types
  getMeetingTypes(): Promise<DemoMeetingType[]>;

  // Meeting Requests
  getMeetingRequests(userId: string, userRole: string): Promise<DemoMeetingRequest[]>;
  getMeetingRequestById(id: string): Promise<DemoMeetingRequest>;
  createMeetingRequest(data: any, userId: string, status: string): Promise<DemoMeetingRequest>;
  updateMeetingRequest(id: string, data: any, status?: string): Promise<DemoMeetingRequest>;
  deleteMeetingRequest(id: string): Promise<void>;

  // Hotels
  getHotels(): Promise<DemoHotel[]>;
  getHotelById(id: string): Promise<DemoHotel>;

  // Halls
  getHotelHalls(hotelId: string): Promise<DemoHall[]>;

  // Categories
  getHotelCategories(): Promise<DemoHotelCategory[]>;

  // Shortlists
  getShortlistedIds(requestId: string): Promise<string[]>;
  addToShortlist(requestId: string, hotelId: string, userId: string): Promise<void>;
  removeFromShortlist(requestId: string, hotelId: string): Promise<void>;
  getMyShortlists(userId: string): Promise<any[]>;

  // Quotations
  getQuotations(): Promise<DemoQuotation[]>;
  createQuotation(data: any): Promise<DemoQuotation>;

  // Bookings
  getBookings(): Promise<DemoBooking[]>;
  getBookingById(id: string): Promise<DemoBooking>;
  createBooking(data: any): Promise<DemoBooking>;
  updateBooking(id: string, data: any): Promise<DemoBooking>;
  confirmBooking(id: string, confirmedBy: string): Promise<DemoBooking>;
  cancelBooking(id: string, cancelledBy: string): Promise<DemoBooking>;

  // Invoices
  getInvoices(): Promise<DemoInvoice[]>;
  getInvoiceById(id: string): Promise<DemoInvoice>;
  createInvoice(data: any): Promise<DemoInvoice>;
  updateInvoice(id: string, data: any): Promise<DemoInvoice>;
  verifyInvoice(id: string, verifiedBy: string): Promise<DemoInvoice>;
  approveInvoice(id: string, approvedBy: string): Promise<DemoInvoice>;
  rejectInvoice(id: string, reason: string): Promise<DemoInvoice>;
  getInvoiceVariances(invoiceId: string): Promise<DemoInvoiceVariance[]>;

  // Payments
  getPayments(): Promise<DemoPayment[]>;
  createPayment(data: any): Promise<DemoPayment>;
}

// ─── Implementation ───────────────────────────────────────────────────────────

export const demoRepository: DemoRepository = {
  // Divisions
  async getDivisions() {
    return demoGet<DemoDivision>(DEMO_COLLECTIONS.DIVISIONS);
  },

  // Cities
  async getCities() {
    return demoGet<DemoCity>(DEMO_COLLECTIONS.CITIES);
  },

  // Meeting Types
  async getMeetingTypes() {
    return demoGet<DemoMeetingType>(DEMO_COLLECTIONS.MEETING_TYPES);
  },

  // Meeting Requests
  async getMeetingRequests(userId: string, userRole: string) {
    const all = demoGet<DemoMeetingRequest>(DEMO_COLLECTIONS.MEETINGS);
    if (userRole === 'SALES_HEAD') {
      return all.filter((r) => r.created_by === userId);
    }
    return all.sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
  },

  async getMeetingRequestById(id: string) {
    const item = demoFindById<DemoMeetingRequest>(DEMO_COLLECTIONS.MEETINGS, id);
    if (!item) throw new Error('Meeting request not found');
    return item;
  },

  async createMeetingRequest(data: any, userId: string, status: string) {
    const cities = demoGet<DemoCity>(DEMO_COLLECTIONS.CITIES);
    const divisions = demoGet<DemoDivision>(DEMO_COLLECTIONS.DIVISIONS);
    const meetingTypes = demoGet<DemoMeetingType>(DEMO_COLLECTIONS.MEETING_TYPES);

    const record: DemoMeetingRequest = {
      ...(data as any),
      id: 'demo' + Math.random().toString(36).slice(2, 11),
      request_number: `DEMO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status,
      created_at: new Date().toISOString(),
      created_by: userId,
      divisions: { division_name: divisions.find(d => d.id === data.division_id)?.division_name ?? '' },
      meeting_types: { meeting_type_name: meetingTypes.find(mt => mt.id === data.meeting_type_id)?.meeting_type_name ?? '' },
      cities: { city_name: cities.find(c => c.id === data.city_id)?.city_name ?? data.target_city_name ?? '' },
    };
    return demoInsert(DEMO_COLLECTIONS.MEETINGS, record);
  },

  async updateMeetingRequest(id: string, data: any, status?: string): Promise<DemoMeetingRequest> {
    const patch = { ...data, ...(status ? { status } : {}) };
    const updated = demoUpdate<DemoMeetingRequest>(DEMO_COLLECTIONS.MEETINGS, id, patch);
    if (!updated) throw new Error('Meeting request not found');
    return updated;
  },

  async deleteMeetingRequest(id: string) {
    demoDelete(DEMO_COLLECTIONS.MEETINGS, id);
  },

  // Hotels
  async getHotels() {
    return demoGet<DemoHotel>(DEMO_COLLECTIONS.HOTELS);
  },

  async getHotelById(id: string) {
    const item = demoFindById<DemoHotel>(DEMO_COLLECTIONS.HOTELS, id);
    if (!item) throw new Error('Venue not found');
    return item;
  },

  // Halls
  async getHotelHalls(hotelId: string) {
    const hotels = demoGet<DemoHotel>(DEMO_COLLECTIONS.HOTELS);
    const hotel = hotels.find(h => h.id === hotelId);
    return (hotel?.halls ?? []) as DemoHall[];
  },

  // Categories
  async getHotelCategories() {
    return demoGet<DemoHotelCategory>(DEMO_COLLECTIONS.HOTEL_CATEGORIES);
  },

  // Shortlists
  async getShortlistedIds(requestId: string) {
    const all = demoGet<{ request_id: string; hotel_id: string }>(DEMO_COLLECTIONS.SHORTLISTS);
    return all.filter((s) => s.request_id === requestId).map((s) => s.hotel_id);
  },

  async addToShortlist(requestId: string, hotelId: string, userId: string) {
    const existing = demoGet<{ request_id: string; hotel_id: string }>(DEMO_COLLECTIONS.SHORTLISTS);
    const alreadyExists = existing.some((s) => s.request_id === requestId && s.hotel_id === hotelId);
    if (alreadyExists) return;
    demoInsert(DEMO_COLLECTIONS.SHORTLISTS, {
      id: 'demo' + Math.random().toString(36).slice(2, 11),
      request_id: requestId,
      hotel_id: hotelId,
      shortlisted_by: userId,
      shortlisted_at: new Date().toISOString(),
    });
  },

  async removeFromShortlist(requestId: string, hotelId: string) {
    const all = demoGet<{ id: string; request_id: string; hotel_id: string }>(DEMO_COLLECTIONS.SHORTLISTS);
    const filtered = all.filter((s) => !(s.request_id === requestId && s.hotel_id === hotelId));
    demoSet(DEMO_COLLECTIONS.SHORTLISTS, filtered);
  },

  async getMyShortlists(userId: string) {
    const all = demoGet<DemoVenueShortlist & { shortlisted_by: string }>(DEMO_COLLECTIONS.SHORTLISTS);
    const hotels = demoGet<DemoHotel>(DEMO_COLLECTIONS.HOTELS);
    return all
      .filter((s) => s.shortlisted_by === userId)
      .map((s) => ({
        ...s,
        hotels: hotels.find((h) => h.id === s.hotel_id) ?? null,
      }))
      .sort((a, b) => (a.shortlisted_at > b.shortlisted_at ? -1 : 1));
  },

  // Quotations
  async getQuotations() {
    return demoGet<DemoQuotation>(DEMO_COLLECTIONS.QUOTATIONS);
  },

  async createQuotation(data: any) {
    return demoInsert<DemoQuotation>(DEMO_COLLECTIONS.QUOTATIONS, { ...data, id: 'demo' + Math.random().toString(36).slice(2, 11) });
  },

  // Bookings
  async getBookings() {
    return demoGet<DemoBooking>(DEMO_COLLECTIONS.BOOKINGS);
  },

  async getBookingById(id: string) {
    const item = demoFindById<DemoBooking>(DEMO_COLLECTIONS.BOOKINGS, id);
    if (!item) throw new Error('Booking not found');
    return item;
  },

  async createBooking(data: any) {
    const record: DemoBooking = {
      ...data,
      meeting_request_id: data.meeting_request_id ?? data.request_id,
      id: 'demo' + Math.random().toString(36).slice(2, 11),
      booking_reference: data.booking_reference ?? `DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
      status: data.status ?? 'REQUESTED',
      created_at: data.created_at ?? new Date().toISOString(),
      confirmed_by: data.confirmed_by ?? undefined,
      confirmed_at: data.confirmed_at ?? undefined,
      updated_at: data.updated_at ?? undefined,
      updated_by: data.updated_by ?? undefined,
    };
    return demoInsert<DemoBooking>(DEMO_COLLECTIONS.BOOKINGS, record);
  },

  async updateBooking(id: string, data: any) {
    const updated = demoUpdate<DemoBooking>(DEMO_COLLECTIONS.BOOKINGS, id, {
      ...data,
      updated_at: new Date().toISOString(),
      updated_by: data.updated_by ?? undefined,
    });
    if (!updated) throw new Error('Booking not found');
    return updated;
  },

  async confirmBooking(id: string, confirmedBy: string) {
    const updated = demoUpdate<DemoBooking>(DEMO_COLLECTIONS.BOOKINGS, id, {
      status: 'CONFIRMED',
      confirmed_by: confirmedBy,
      confirmed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: confirmedBy,
    });
    if (!updated) throw new Error('Booking not found');
    return updated;
  },

  async cancelBooking(id: string, cancelledBy: string) {
    const updated = demoUpdate<DemoBooking>(DEMO_COLLECTIONS.BOOKINGS, id, {
      status: 'CANCELLED',
      updated_at: new Date().toISOString(),
      updated_by: cancelledBy,
    });
    if (!updated) throw new Error('Booking not found');
    return updated;
  },

  // Invoices
  async getInvoices() {
    return demoGet<DemoInvoice>(DEMO_COLLECTIONS.INVOICES).filter((inv) => !inv.is_deleted);
  },

  async getInvoiceById(id: string) {
    const item = demoFindById<DemoInvoice>(DEMO_COLLECTIONS.INVOICES, id);
    if (!item || item.is_deleted) throw new Error('Invoice not found');
    return item;
  },

  async createInvoice(data: any) {
    const record: DemoInvoice = {
      ...data,
      id: 'demo' + Math.random().toString(36).slice(2, 11),
      status: data.status ?? 'RECEIVED',
      created_at: data.created_at ?? new Date().toISOString(),
      is_deleted: false,
    };
    return demoInsert<DemoInvoice>(DEMO_COLLECTIONS.INVOICES, record);
  },

  async updateInvoice(id: string, data: any) {
    const updated = demoUpdate<DemoInvoice>(DEMO_COLLECTIONS.INVOICES, id, {
      ...data,
      updated_at: new Date().toISOString(),
    });
    if (!updated || updated.is_deleted) throw new Error('Invoice not found');
    return updated;
  },

  async verifyInvoice(id: string, verifiedBy: string) {
    const updated = demoUpdate<DemoInvoice>(DEMO_COLLECTIONS.INVOICES, id, {
      status: 'VERIFIED',
      verified_by: verifiedBy,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (!updated || updated.is_deleted) throw new Error('Invoice not found');
    return updated;
  },

  async approveInvoice(id: string, approvedBy: string) {
    const updated = demoUpdate<DemoInvoice>(DEMO_COLLECTIONS.INVOICES, id, {
      status: 'APPROVED',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (!updated || updated.is_deleted) throw new Error('Invoice not found');
    return updated;
  },

  async rejectInvoice(id: string, reason: string) {
    const updated = demoUpdate<DemoInvoice>(DEMO_COLLECTIONS.INVOICES, id, {
      status: 'REJECTED',
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    });
    if (!updated || updated.is_deleted) throw new Error('Invoice not found');
    return updated;
  },

  async getInvoiceVariances(invoiceId: string) {
    const all = demoGet<DemoInvoiceVariance>(DEMO_COLLECTIONS.INVOICES);
    return (all.filter((v: any) => v.invoice_id === invoiceId) ?? []) as DemoInvoiceVariance[];
  },

  // Payments
  async getPayments() {
    return demoGet<DemoPayment>(DEMO_COLLECTIONS.PAYMENTS);
  },

  async createPayment(data: any) {
    return demoInsert<DemoPayment>(DEMO_COLLECTIONS.PAYMENTS, { ...data, id: 'demo' + Math.random().toString(36).slice(2, 11) });
  },
};
