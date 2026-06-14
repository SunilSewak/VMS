import { isDemoModeActive } from '../../lib/demoMode';
import * as supabaseApi from './api';
import { demoRepository, DemoBooking } from '../../demo/demoRepository';
import type {
  Booking,
  BookingCreateInput,
  BookingQueryFilters,
  BookingUpdateInput,
} from './types';
import type { UserProfile } from '../../types';
import type { AppRole } from '../../auth/permissions';

async function convertDemoToBooking(data: DemoBooking): Promise<Booking> {
  const [meetingRequest, hotel] = await Promise.all([
    demoRepository.getMeetingRequestById(data.meeting_request_id ?? data.request_id ?? '').catch(() => null),
    demoRepository.getHotelById(data.hotel_id).catch(() => null),
  ]);
  const hallName = data.hall_id ? hotel?.halls?.find((hall) => hall.id === data.hall_id)?.hall_name ?? null : null;

  return {
    id: data.id,
    booking_reference: data.booking_reference ?? `DEMO-${data.id}`,
    meeting_request_id: data.meeting_request_id ?? data.request_id ?? '',
    hotel_id: data.hotel_id,
    hall_id: data.hall_id ?? null,
    status: data.status as Booking['status'],
    check_in_date: data.check_in,
    check_out_date: data.check_out,
    rooms_booked: data.rooms,
    halls_booked: data.halls_booked ?? 0,
    expected_pax: data.expected_pax ?? 0,
    special_requirements: data.special_requirements ?? null,
    amount: data.amount ?? null,
    currency: data.currency ?? null,
    confirmed_by: data.confirmed_by ?? null,
    confirmed_at: data.confirmed_at ?? null,
    created_by: data.created_by ?? null,
    created_at: data.created_at,
    updated_at: data.updated_at ?? null,
    meeting_requests: meetingRequest ? {
      request_number: meetingRequest.request_number,
      meeting_name: meetingRequest.meeting_name,
      status: meetingRequest.status,
    } : null,
    hotels: hotel ? {
      hotel_name: hotel.hotel_name,
      city_id: hotel.city_id,
      city_name: hotel.cities?.city_name,
    } : null,
    halls: hallName ? { hall_name: hallName } : null,
  };
}

const supabaseRepo = {
  getBookings: supabaseApi.getBookings,
  getBookingById: supabaseApi.getBookingById,
  createBooking: supabaseApi.createBooking,
  updateBooking: supabaseApi.updateBooking,
  confirmBooking: supabaseApi.confirmBooking,
  cancelBooking: supabaseApi.cancelBooking,
};

const demoRepo = {
  getBookings: async (userId: string, role: AppRole) => {
    const bookings = await demoRepository.getBookings();
    if (role === 'SALES_HEAD' || role === 'VIEWER') {
      return bookings.filter((booking) => booking.created_by === userId);
    }
    if (role === 'FINANCE') {
      return bookings.filter((booking) => booking.status === 'CONFIRMED' || booking.status === 'COMPLETED');
    }
    return bookings;
  },
  getBookingById: demoRepository.getBookingById,
  createBooking: (input: any, userId: string) =>
    demoRepository.createBooking({
      ...input,
      status: 'REQUESTED',
      created_by: userId,
      booking_reference: input.booking_reference,
      created_at: new Date().toISOString(),
    }),
  updateBooking: demoRepository.updateBooking,
  confirmBooking: (id: string, userId: string) => demoRepository.confirmBooking(id, userId),
  cancelBooking: (id: string, userId: string) => demoRepository.cancelBooking(id, userId),
};

function applyFilters(bookings: Booking[], filters?: BookingQueryFilters): Booking[] {
  if (!filters) {
    return bookings;
  }

  return bookings.filter((booking) => {
    if (filters.status && booking.status !== filters.status) return false;
    if (filters.meetingRequestId && booking.meeting_request_id !== filters.meetingRequestId) return false;
    if (filters.hotelId && booking.hotel_id !== filters.hotelId) return false;
    if (filters.createdBy && booking.created_by !== filters.createdBy) return false;
    return true;
  });
}

export const getBookings = async (user: UserProfile, filters?: BookingQueryFilters): Promise<Booking[]> => {
  if (isDemoModeActive()) {
    const bookings = await demoRepo.getBookings(user.id, user.role);
    const enriched = await Promise.all(bookings.map(convertDemoToBooking));
    return applyFilters(enriched, filters);
  }

  const bookings = await supabaseRepo.getBookings(user);
  return applyFilters(bookings, filters);
};

export const getBookingById = async (id: string): Promise<Booking> => {
  if (isDemoModeActive()) {
    try {
      const booking = await demoRepo.getBookingById(id);
      return convertDemoToBooking(booking);
    } catch (err) {
      console.warn(`[BookingService] Demo getBookingById failed for id="${id}":`, err);
      throw new Error(`Booking with ID "${id}" not found in demo data.`);
    }
  }

  try {
    return await supabaseRepo.getBookingById(id);
  } catch (err) {
    console.warn(`[BookingService] Supabase getBookingById failed for id="${id}":`, err);
    throw err;
  }
};

export const createBooking = async (input: BookingCreateInput, user: UserProfile): Promise<Booking> => {
  if (isDemoModeActive()) {
    const booking = await demoRepo.createBooking(
      {
        meeting_request_id: input.meeting_request_id,
        hotel_id: input.hotel_id,
        hall_id: input.hall_id,
        check_in: input.check_in_date,
        check_out: input.check_out_date,
        rooms: input.rooms_booked,
        halls_booked: input.halls_booked,
        expected_pax: input.expected_pax,
        special_requirements: input.special_requirements,
        amount: input.amount,
        currency: input.currency,
      },
      user.id
    );
    return convertDemoToBooking(booking);
  }

  return supabaseRepo.createBooking(input, user);
};

export const updateBooking = async (id: string, input: BookingUpdateInput, user: UserProfile): Promise<Booking> => {
  if (isDemoModeActive()) {
    const demoInput: any = {
      ...(input.meeting_request_id ? { meeting_request_id: input.meeting_request_id } : {}),
      ...(input.hotel_id ? { hotel_id: input.hotel_id } : {}),
      ...(input.hall_id !== undefined ? { hall_id: input.hall_id } : {}),
      ...(input.check_in_date ? { check_in: input.check_in_date } : {}),
      ...(input.check_out_date ? { check_out: input.check_out_date } : {}),
      ...(input.rooms_booked !== undefined ? { rooms: input.rooms_booked } : {}),
      ...(input.halls_booked !== undefined ? { halls_booked: input.halls_booked } : {}),
      ...(input.expected_pax !== undefined ? { expected_pax: input.expected_pax } : {}),
      ...(input.special_requirements !== undefined ? { special_requirements: input.special_requirements } : {}),
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.currency !== undefined ? { currency: input.currency } : {}),
      updated_by: user.id,
    };

    const booking = await demoRepo.updateBooking(id, demoInput);
    return convertDemoToBooking(booking);
  }

  return supabaseRepo.updateBooking(id, input, user);
};

export const confirmBooking = async (id: string, user: UserProfile): Promise<Booking> => {
  if (isDemoModeActive()) {
    const booking = await demoRepo.confirmBooking(id, user.id);
    return convertDemoToBooking(booking);
  }

  return supabaseRepo.confirmBooking(id, user);
};

export const cancelBooking = async (id: string, user: UserProfile): Promise<Booking> => {
  if (isDemoModeActive()) {
    const booking = await demoRepo.cancelBooking(id, user.id);
    return convertDemoToBooking(booking);
  }

  return supabaseRepo.cancelBooking(id, user);
};
