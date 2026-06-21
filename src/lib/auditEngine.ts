import { RoomingParticipant } from "@/types/rooming";
import { CommercialVersion, AuditSummary } from "@/types/finance";

export function determineAuditStatus(expectedTotalCost: number, actualTotalCost: number): AuditSummary['auditStatus'] {
  const variance = actualTotalCost - expectedTotalCost;
  if (variance <= 0) return 'Pass';
  
  const percentage = (variance / expectedTotalCost) * 100;
  
  if (percentage === 0) return 'Pass';
  if (percentage <= 5) return 'Warning';
  if (percentage <= 10) return 'Review Required';
  return 'Critical';
}

export function buildExpectedCost(
  participants: RoomingParticipant[],
  commercialVersion: CommercialVersion,
  eventDays: number
): Omit<AuditSummary, 'actualTotalCost' | 'varianceAmount' | 'auditStatus'> {
  
  // Room Consumptions
  let singleRooms = 0, doubleParticipants = 0, tripleParticipants = 0, suites = 0;
  let totalNrc = 0;

  for (const p of participants) {
    if (p.occupancy_type === 'Single') singleRooms++;
    else if (p.occupancy_type === 'Double') doubleParticipants++;
    else if (p.occupancy_type === 'Triple') tripleParticipants++;
    else if (p.occupancy_type === 'Suite') suites++;

    if (p.nrc_flag) totalNrc++;
  }

  const doubleRooms = Math.ceil(doubleParticipants / 2);
  const tripleRooms = Math.ceil(tripleParticipants / 3);
  
  const totalRoomsConsumed = singleRooms + doubleRooms + tripleRooms + suites;
  
  // Assuming room_rate applies to all rooms equally based on instructions.
  // Room Nights = Rooms Consumed * Stay Nights
  // Here Stay Nights is approximated to eventDays or based on individual participant checkin/checkout
  // The instruction said: Stay duration: check_out - check_in.
  let totalRoomNights = 0;
  for (const p of participants) {
    if (p.check_in && p.check_out) {
      const inDate = new Date(p.check_in);
      const outDate = new Date(p.check_out);
      const diffTime = Math.abs(outDate.getTime() - inDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // Add individual fractional room night based on occupancy
      if (p.occupancy_type === 'Single' || p.occupancy_type === 'Suite') {
        totalRoomNights += diffDays;
      } else if (p.occupancy_type === 'Double') {
        totalRoomNights += diffDays / 2;
      } else if (p.occupancy_type === 'Triple') {
        totalRoomNights += diffDays / 3;
      }
    } else {
      // Fallback to event days if no check_in/check_out
      if (p.occupancy_type === 'Single' || p.occupancy_type === 'Suite') {
        totalRoomNights += eventDays;
      } else if (p.occupancy_type === 'Double') {
        totalRoomNights += eventDays / 2;
      } else if (p.occupancy_type === 'Triple') {
        totalRoomNights += eventDays / 3;
      }
    }
  }

  const expectedRoomCost = Math.ceil(totalRoomNights) * commercialVersion.room_rate;

  // Food Cost
  const expectedFoodCost = participants.length * commercialVersion.food_rate * eventDays;

  // Hall Cost
  const expectedHallCost = commercialVersion.hall_rate * eventDays;

  // NRC Cost (No commercial logic yet)
  const expectedNRCCost = 0;

  const expectedTotalCost = expectedRoomCost + expectedFoodCost + expectedHallCost + expectedNRCCost;

  return {
    expectedRoomCost,
    expectedFoodCost,
    expectedHallCost,
    expectedNRCCost,
    expectedTotalCost
  };
}

export function runAudit(
  participants: RoomingParticipant[],
  commercialVersion: CommercialVersion,
  eventDays: number,
  actualTotalCost: number
): AuditSummary {
  
  const expectedCosts = buildExpectedCost(participants, commercialVersion, eventDays);
  
  const varianceAmount = actualTotalCost - expectedCosts.expectedTotalCost;
  const auditStatus = determineAuditStatus(expectedCosts.expectedTotalCost, actualTotalCost);

  return {
    ...expectedCosts,
    actualTotalCost,
    varianceAmount,
    auditStatus
  };
}

export function calculateVariance(expected: number, actual: number) {
  return actual - expected;
}
