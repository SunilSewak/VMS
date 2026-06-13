import { useEffect, useState } from 'react';
import { History, Check, AlertCircle, Clock, Users, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { VenueImportHistory } from '../features/venues/types';

interface VenueImportHistoryPanelProps {
  limit?: number;
}

export function VenueImportHistoryPanel({ limit = 10 }: VenueImportHistoryPanelProps) {
  const [history, setHistory] = useState<VenueImportHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setLoading(true);
      const { data, error: queryError } = await supabase
        .from('venue_import_history')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(limit);

      if (queryError) throw queryError;
      setHistory(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load import history');
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'SUCCESS':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'FAILED':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'IMPORTING':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-50 border-green-200';
      case 'FAILED':
        return 'bg-red-50 border-red-200';
      case 'PARTIAL':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'SUCCESS':
        return 'Completed Successfully';
      case 'FAILED':
        return 'Failed';
      case 'PARTIAL':
        return 'Partial Success';
      case 'IMPORTING':
        return 'Importing...';
      case 'VALIDATED':
        return 'Validated';
      case 'UPLOADED':
        return 'Uploaded';
      default:
        return status;
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function calculateDuration(startDate: string): string {
    const start = new Date(startDate);
    const now = new Date();
    const seconds = Math.round((now.getTime() - start.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Import History</h2>
          <span className="ml-auto text-sm text-gray-500">Last {limit} imports</span>
        </div>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="p-6 text-center">
          <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No import history available</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {history.map((item) => (
            <div
              key={item.id}
              className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${
                item.status === 'SUCCESS'
                  ? 'border-l-green-600'
                  : item.status === 'FAILED'
                  ? 'border-l-red-600'
                  : 'border-l-yellow-600'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left Side: Status and Details */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">{getStatusIcon(item.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 truncate">{item.file_name}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'SUCCESS'
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'FAILED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {formatDate(item.uploaded_at)}
                    </div>
                    
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-gray-50 px-2 py-1 rounded">
                        <p className="text-gray-500">Hotels Created</p>
                        <p className="font-medium text-gray-900">{item.hotels_created}</p>
                      </div>
                      <div className="bg-gray-50 px-2 py-1 rounded">
                        <p className="text-gray-500">Hotels Updated</p>
                        <p className="font-medium text-gray-900">{item.hotels_updated}</p>
                      </div>
                      <div className="bg-gray-50 px-2 py-1 rounded">
                        <p className="text-gray-500">Halls Created</p>
                        <p className="font-medium text-gray-900">{item.halls_created}</p>
                      </div>
                      <div className="bg-gray-50 px-2 py-1 rounded">
                        <p className="text-gray-500">Records Processed</p>
                        <p className="font-medium text-gray-900">{item.rows_processed}</p>
                      </div>
                    </div>

                    {/* Failure Summary */}
                    {item.rows_skipped > 0 && (
                      <div className="mt-2 text-xs">
                        <span className="text-red-600 font-medium">{item.rows_skipped} records skipped</span>
                        <span className="text-gray-500"> (validation errors)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Quick Actions */}
                <div className="flex items-center gap-1">
                  {item.error_report_path && (
                    <button
                      title="Download error report"
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <button
          onClick={loadHistory}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Refresh History
        </button>
      </div>
    </div>
  );
}
