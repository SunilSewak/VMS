export interface RoomingSubmission {
  id: string;
  event_id: string;
  status: 'Draft' | 'Submitted' | 'Finalized';
  created_at?: string;
  created_by?: string;
  updated_at?: string;
}

export interface RoomingParticipant {
  id: string;
  submission_id: string;
  employee_name: string;
  designation: string;
  division?: string;
  state?: string;
  region?: string;
  occupancy_type: 'Single' | 'Double' | 'Triple' | 'Suite';
  check_in?: string;
  check_out?: string;
  nrc_flag: boolean;
  created_at?: string;
}

export interface RoomingSummary {
  participantCount: number;

  singleParticipants: number;
  doubleParticipants: number;
  tripleParticipants: number;
  suiteParticipants: number;

  singleRoomsConsumed: number;
  doubleRoomsConsumed: number;
  tripleRoomsConsumed: number;
  suiteRoomsConsumed: number;

  singleRoomsAvailable: number;
  doubleRoomsAvailable: number;
  tripleRoomsAvailable: number;
  suiteRoomsAvailable: number;

  validationPassed: boolean;
}
