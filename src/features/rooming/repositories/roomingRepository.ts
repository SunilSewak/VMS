import { supabase } from "@/lib/supabase";
import { RoomingSubmission, RoomingParticipant } from "@/types/rooming";
import { logEventActivity } from "@/lib/eventLogger";

export const roomingRepository = {
  async getEventRoomingSubmissions(eventId: string) {
    const { data, error } = await supabase
      .from('rooming_submissions')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as RoomingSubmission[];
  },

  async getRoomingSubmission(submissionId: string) {
    const { data, error } = await supabase
      .from('rooming_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();
    if (error) throw error;
    return data as RoomingSubmission;
  },

  async getRoomingParticipants(submissionId: string) {
    const { data, error } = await supabase
      .from('rooming_participants')
      .select('*')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data as RoomingParticipant[];
  },

  async createDraftSubmission(eventId: string, userId: string, eventStatus: string) {
    const { data, error } = await supabase
      .from('rooming_submissions')
      .insert({
        event_id: eventId,
        status: 'Draft',
        created_by: userId
      })
      .select()
      .single();
    if (error) throw error;

    await logEventActivity(eventId, 'ROOMING_DRAFT_CREATED', userId, eventStatus, eventStatus);
    return data as RoomingSubmission;
  },

  async updateSubmissionStatus(submissionId: string, eventId: string, status: 'Submitted' | 'Finalized', userId: string, eventStatus: string) {
    const { error } = await supabase
      .from('rooming_submissions')
      .update({ status })
      .eq('id', submissionId);
    if (error) throw error;

    const newEventStatus = status === 'Submitted' ? 'ROOMING_SUBMITTED' : 'ROOMING_FINALIZED';
    const { error: evtErr } = await supabase
      .from('events')
      .update({ lifecycle_status: newEventStatus })
      .eq('id', eventId);
    if (evtErr) throw evtErr;

    const action = status === 'Submitted' ? 'ROOMING_SUBMITTED' : 'ROOMING_FINALIZED';
    await logEventActivity(eventId, action, userId, eventStatus, newEventStatus);
  },

  async createParticipant(participant: Omit<RoomingParticipant, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('rooming_participants')
      .insert(participant)
      .select()
      .single();
    if (error) throw error;
    return data as RoomingParticipant;
  },

  async updateParticipant(participantId: string, updates: Partial<RoomingParticipant>) {
    const { error } = await supabase
      .from('rooming_participants')
      .update(updates)
      .eq('id', participantId);
    if (error) throw error;
  },

  async deleteParticipant(participantId: string) {
    const { error } = await supabase
      .from('rooming_participants')
      .delete()
      .eq('id', participantId);
    if (error) throw error;
  }
};
