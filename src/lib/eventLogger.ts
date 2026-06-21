import { supabase } from "@/lib/supabase";

export async function logEventActivity(
  eventId: string,
  action: string,
  userId: string,
  oldStatus?: string,
  newStatus?: string
) {
  const { error } = await supabase.from('event_activity_log').insert({
    event_id: eventId,
    action,
    performed_by: userId,
    old_status: oldStatus,
    new_status: newStatus
  });
  if (error) {
    console.error("Failed to log event activity:", error);
  }
}
