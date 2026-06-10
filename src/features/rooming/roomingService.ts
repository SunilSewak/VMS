import { isDemoModeActive } from '../../lib/demoMode';
import { demoRepository } from '../../demo/demoRepository';
import type { UserProfile } from '../../types';
import type {
  AccommodationFilters,
  AccommodationPlan,
  AccommodationPlanCreateInput,
  AccommodationPlanUpdateInput,
  AccommodationUtilizationUpdateInput,
} from './types';
import * as roomingRepository from './roomingRepository';

function ensureNonNegative(value: number, fieldName: string): void {
  if (value < 0) {
    throw new Error(`${fieldName} cannot be negative.`);
  }
}

function normalizePlan(plan: AccommodationPlan): AccommodationPlan {
  return {
    ...plan,
    utilization: {
      single_rooms_actual: plan.utilization?.single_rooms_actual ?? 0,
      double_rooms_actual: plan.utilization?.double_rooms_actual ?? 0,
      triple_rooms_actual: plan.utilization?.triple_rooms_actual ?? 0,
      actual_pax: plan.utilization?.actual_pax ?? 0,
      remarks: plan.utilization?.remarks ?? null,
    },
  };
}

export async function getAccommodationPlans(user: UserProfile, filters?: AccommodationFilters): Promise<AccommodationPlan[]> {
  if (isDemoModeActive()) {
    const plans = await demoRepository.getAccommodationPlans();
    return plans.filter((plan) => {
      if (!filters) return true;
      if (filters.status && plan.status !== filters.status) return false;
      if (filters.bookingId && plan.booking_id !== filters.bookingId) return false;
      if (filters.hotelId && plan.booking?.hotels?.hotel_name !== filters.hotelId) return false;
      return true;
    });
  }

  return roomingRepository.getAccommodationPlans(user, filters);
}

export async function getAccommodationPlanById(id: string): Promise<AccommodationPlan> {
  if (isDemoModeActive()) {
    const plan = await demoRepository.getAccommodationPlanById(id);
    return normalizePlan(plan);
  }

  return roomingRepository.getAccommodationPlanById(id);
}

export async function createAccommodationPlan(input: AccommodationPlanCreateInput, user: UserProfile): Promise<AccommodationPlan> {
  ensureNonNegative(input.expected_pax, 'Expected pax');
  ensureNonNegative(input.single_rooms_planned, 'Single rooms planned');
  ensureNonNegative(input.double_rooms_planned, 'Double rooms planned');
  ensureNonNegative(input.triple_rooms_planned, 'Triple rooms planned');

  if (isDemoModeActive()) {
    const plan = await demoRepository.createAccommodationPlan({
      ...input,
      created_by: user.id,
      updated_by: user.id,
    });
    return normalizePlan(plan);
  }

  return roomingRepository.createAccommodationPlan(input, user);
}

export async function updateAccommodationPlan(
  id: string,
  input: AccommodationPlanUpdateInput,
  user: UserProfile
): Promise<AccommodationPlan> {
  if (input.expected_pax !== undefined) {
    ensureNonNegative(input.expected_pax, 'Expected pax');
  }
  if (input.single_rooms_planned !== undefined) {
    ensureNonNegative(input.single_rooms_planned, 'Single rooms planned');
  }
  if (input.double_rooms_planned !== undefined) {
    ensureNonNegative(input.double_rooms_planned, 'Double rooms planned');
  }
  if (input.triple_rooms_planned !== undefined) {
    ensureNonNegative(input.triple_rooms_planned, 'Triple rooms planned');
  }

  if (isDemoModeActive()) {
    const plan = await demoRepository.updateAccommodationPlan(id, {
      ...input,
      updated_by: user.id,
    });
    return normalizePlan(plan);
  }

  return roomingRepository.updateAccommodationPlan(id, input, user);
}

export async function updateAccommodationUtilization(
  id: string,
  input: AccommodationUtilizationUpdateInput
): Promise<AccommodationPlan> {
  ensureNonNegative(input.single_rooms_actual, 'Single rooms actual');
  ensureNonNegative(input.double_rooms_actual, 'Double rooms actual');
  ensureNonNegative(input.triple_rooms_actual, 'Triple rooms actual');
  ensureNonNegative(input.actual_pax, 'Actual pax');

  if (isDemoModeActive()) {
    const plan = await demoRepository.updateAccommodationUtilization(id, input);
    return normalizePlan(plan);
  }

  return roomingRepository.updateAccommodationUtilization(id, input);
}

export async function deleteAccommodationPlan(id: string): Promise<void> {
  if (isDemoModeActive()) {
    await demoRepository.deleteAccommodationPlan(id);
    return;
  }

  await roomingRepository.deleteAccommodationPlan(id);
}

export async function getAccommodationPlanByBookingId(bookingId: string): Promise<AccommodationPlan | null> {
  if (isDemoModeActive()) {
    const plans = await demoRepository.getAccommodationPlans();
    const plan = plans.find((p) => p.booking_id === bookingId);
    return plan ? normalizePlan(plan) : null;
  }

  return roomingRepository.getAccommodationPlanByBookingId(bookingId);
}
