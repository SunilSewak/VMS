import { useEffect, useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ImportRecord {
  id: string;
  import_date: string;
  user_email: string;
  status: string;
  records_processed: number;
  records_failed: number;
  duration_seconds: number;
  notes?: string;
}

interface ImportHistoryTabProps {
  refreshTrigger: number;
}

export function ImportHistoryTab({ refreshTrigger }: ImportHistoryTabProps) {
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadImportHistory();
  }, [refreshTrigger]);

  async function loadImportHistory() {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: queryError } = await supabase
        .from('venue_import_history')
        .select('*')
        .order('import_date', { ascending: false })
        .limit(50);

      if (queryError) throw queryError;
      setImports(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load import history');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Import History</h2>
        <p className="text-gray-600 text-sm mt-1">Track all venue data imports</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">User</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">Processed</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">Failed</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {imports.map(record => (
              <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(record.import_date).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{record.user_email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    record.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-700'
                      : record.status === 'FAILED'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                  {record.records_processed}
                </td>
                <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                  {record.records_failed}
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                    {record.duration_seconds}s
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {imports.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No import history available</p>
          </div>
        )}
      </div>
    </div>
  );
}
