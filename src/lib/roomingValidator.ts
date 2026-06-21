import { RoomingParticipant, RoomingSummary } from "@/types/rooming";
import { RoomRequirement } from "@/types/booking";

export function buildRoomingSummary(
  participants: RoomingParticipant[],
  requirements: RoomRequirement
): RoomingSummary {
  
  const singleParticipants = participants.filter(p => p.occupancy_type === 'Single').length;
  const doubleParticipants = participants.filter(p => p.occupancy_type === 'Double').length;
  const tripleParticipants = participants.filter(p => p.occupancy_type === 'Triple').length;
  const suiteParticipants = participants.filter(p => p.occupancy_type === 'Suite').length;

  const singleRoomsConsumed = singleParticipants;
  const doubleRoomsConsumed = Math.ceil(doubleParticipants / 2);
  const tripleRoomsConsumed = Math.ceil(tripleParticipants / 3);
  const suiteRoomsConsumed = suiteParticipants;

  const validationPassed = 
    singleRoomsConsumed <= requirements.single_rooms &&
    doubleRoomsConsumed <= requirements.double_rooms &&
    tripleRoomsConsumed <= requirements.triple_rooms &&
    suiteRoomsConsumed <= requirements.suites;

  return {
    participantCount: participants.length,
    singleParticipants,
    doubleParticipants,
    tripleParticipants,
    suiteParticipants,
    singleRoomsConsumed,
    doubleRoomsConsumed,
    tripleRoomsConsumed,
    suiteRoomsConsumed,
    singleRoomsAvailable: requirements.single_rooms,
    doubleRoomsAvailable: requirements.double_rooms,
    tripleRoomsAvailable: requirements.triple_rooms,
    suiteRoomsAvailable: requirements.suites,
    validationPassed
  };
}

export function validateRoomingSubmission(
  participants: RoomingParticipant[],
  requirements: RoomRequirement
): { valid: boolean; errors: string[]; summary: RoomingSummary } {
  
  const summary = buildRoomingSummary(participants, requirements);
  const errors: string[] = [];

  if (summary.singleRoomsConsumed > summary.singleRoomsAvailable) {
    errors.push(`Single Room Allocation Exceeds Blocked Inventory\n\nRequired: ${summary.singleRoomsConsumed}\nAvailable: ${summary.singleRoomsAvailable}`);
  }
  if (summary.doubleRoomsConsumed > summary.doubleRoomsAvailable) {
    errors.push(`Double Room Allocation Exceeds Blocked Inventory\n\nRequired: ${summary.doubleRoomsConsumed}\nAvailable: ${summary.doubleRoomsAvailable}`);
  }
  if (summary.tripleRoomsConsumed > summary.tripleRoomsAvailable) {
    errors.push(`Triple Room Allocation Exceeds Blocked Inventory\n\nRequired: ${summary.tripleRoomsConsumed}\nAvailable: ${summary.tripleRoomsAvailable}`);
  }
  if (summary.suiteRoomsConsumed > summary.suiteRoomsAvailable) {
    errors.push(`Suite Allocation Exceeds Blocked Inventory\n\nRequired: ${summary.suiteRoomsConsumed}\nAvailable: ${summary.suiteRoomsAvailable}`);
  }

  return {
    valid: summary.validationPassed,
    errors,
    summary
  };
}
