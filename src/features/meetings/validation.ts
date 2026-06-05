import { z } from '../../lib/shims/zod';

export const meetingRequestSchema = z.object({
  meeting_name: z.string().min(3, 'Meeting name must be at least 3 characters'),
  division_id: z.string().min(1, 'Division is required'),
  meeting_type_id: z.string().min(1, 'Meeting type is required'),
  city_id: z.string().min(1, 'City is required'),
  zone: z.string().min(1, 'Zone is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  expected_pax: z.number().min(1, 'Expected PAX must be greater than 0'),
  guaranteed_pax: z.number().min(1, 'Guaranteed PAX must be greater than 0'),
  residential_flag: z.boolean().optional(),
  rooms_required: z.number().optional(),
  halls_required: z.number().optional(),
  seating_style: z.string().min(1, 'Seating style is required'),
  av_requirements: z.string().optional(),
  food_requirements: z.string().optional(),
  transfer_requirements: z.string().optional()
});

export type MeetingRequestInput = typeof meetingRequestSchema;
