// Import History Service

import { supabase } from '../../../../lib/supabase';
import { ImportHistoryItem } from './types';

export async function createImportRecord(
  importSessionId: string,
  fileName: string,
  uploadedBy: string,
  rowsProcessed: number,
  status: ImportHistoryItem['status'] = 'UPLOADED'
) {
  const { data, error } = await (supabase as any)
    .from('venue_import_history')
    .insert({
      import_session_id: importSessionId,
      file_name: fileName,
      uploaded_by: uploadedBy,
      rows_processed: rowsProcessed,
      status: status
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create import record:', error);
    throw error;
  }

  return data as ImportHistoryItem;
}

export async function updateImportStatus(
  importSessionId: string,
  status: ImportHistoryItem['status'],
  counts: {
    hotelsCreated?: number;
    hotelsUpdated?: number;
    hallsCreated?: number;
    hallsUpdated?: number;
    rowsSkipped?: number;
  }
) {
  const updateData: any = { status };

  if (counts.hotelsCreated !== undefined) updateData.hotels_created = counts.hotelsCreated;
  if (counts.hotelsUpdated !== undefined) updateData.hotels_updated = counts.hotelsUpdated;
  if (counts.hallsCreated !== undefined) updateData.halls_created = counts.hallsCreated;
  if (counts.hallsUpdated !== undefined) updateData.halls_updated = counts.hallsUpdated;
  if (counts.rowsSkipped !== undefined) updateData.rows_skipped = counts.rowsSkipped;

  const { data, error } = await (supabase as any)
    .from('venue_import_history')
    .update(updateData)
    .eq('import_session_id', importSessionId)
    .select()
    .single();

  if (error) {
    console.error('Failed to update import status:', error);
    throw error;
  }

  return data as ImportHistoryItem;
}

export async function getImportHistory(
  limit: number = 50,
  offset: number = 0
): Promise<ImportHistoryItem[]> {
  const { data, error } = await (supabase as any)
    .from('venue_import_history')
    .select('*')
    .order('uploaded_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Failed to fetch import history:', error);
    return [];
  }

  return (data || []) as ImportHistoryItem[];
}

export async function getImportById(importSessionId: string): Promise<ImportHistoryItem | null> {
  const { data, error } = await (supabase as any)
    .from('venue_import_history')
    .select('*')
    .eq('import_session_id', importSessionId)
    .single();

  if (error) {
    console.error('Failed to fetch import by ID:', error);
    return null;
  }

  return data as ImportHistoryItem;
}

export async function downloadErrorReport(importSessionId: string): Promise<string> {
  // This would fetch the error report path and generate a download URL
  const { data, error } = await (supabase as any)
    .from('venue_import_history')
    .select('error_report_path')
    .eq('import_session_id', importSessionId)
    .single();

  if (error || !data?.error_report_path) {
    console.error('Failed to fetch error report path:', error);
    return '';
  }

  // Generate presigned URL for download
  const { data: presignedData, error: presignedError } = await supabase.storage
    .from('venue-imports')
    .createSignedUrl(data.error_report_path as string, 3600); // 1 hour expiry

  if (presignedError) {
    console.error('Failed to generate presigned URL:', presignedError);
    return '';
  }

  return presignedData.signedUrl;
}
