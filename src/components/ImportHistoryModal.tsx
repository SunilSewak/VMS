import { useState, useEffect } from 'react';
import { X, ChevronRight, Calendar, User, CheckCircle, AlertCircle } from 'lucide-react';
import { getImportHistory, getImportDetails } from '../features/venues/importService';
import type { VenueImportHistory } from '../features/venues/types';
import { Modal } from './Modal';

interface ImportHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportHistoryModal({ isOpen, onClose }: ImportHistoryModalProps) {
  const [history, setHistory] = useState<VenueImportHistory[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [details, setDetails] = useState<VenueImportHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  async function loadHistory() {
    setLoading(true);
    setSelectedId(null);
    setDetails(null);
    try {
      const data = await getImportHistory(10, currentPage * 10);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleViewDetails(importSessionId: string) {
    setLoading(true);
    try {
      const data = await getImportDetails(importSessionId);
      setDetails(data);
      setSelectedId(importSessionId);
    } catch (err) {
      console.error('Failed to load details:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col" style={{ width: '896px' }}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between text-white">
          <div>
            <h2 className="text-2xl font-bold">Import History</h2>
            <p className="text-blue-100 text-sm mt-1">View past venue bulk import sessions</p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : selectedId && details ? (
            // Details View
            <div>
              <button
                onClick={() => {
                  setSelectedId(null);
                  setDetails(null);
                }}
                className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors"
              >
                ← Back to List
              </button>

              <div className="space-y-6">
                {/* Header Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">File Name</p>
                      <p className="text-lg font-semibold text-gray-900">{details.file_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        {details.status === 'SUCCESS' ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-green-600">Success</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                            <span className="font-semibold text-orange-600">Partial</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Uploaded By</p>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <p className="font-medium text-gray-900">{details.uploaded_by}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Uploaded At</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="font-medium text-gray-900">
                          {new Date(details.uploaded_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Import Results Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">{details.hotels_created}</p>
                    <p className="text-xs text-gray-600 mt-2">Hotels Created</p>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                    <p className="text-3xl font-bold text-blue-600">{details.hotels_updated}</p>
                    <p className="text-xs text-gray-600 mt-2">Hotels Updated</p>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                    <p className="text-3xl font-bold text-purple-600">{details.halls_created}</p>
                    <p className="text-xs text-gray-600 mt-2">Halls Created</p>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                    <p className="text-3xl font-bold text-indigo-600">{details.halls_updated}</p>
                    <p className="text-xs text-gray-600 mt-2">Halls Updated</p>
                  </div>

                  <div className="bg-white rounded-lg border border-red-200 p-4 text-center">
                    <p className="text-3xl font-bold text-red-600">{details.rows_skipped}</p>
                    <p className="text-xs text-gray-600 mt-2">Rows Skipped</p>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Total Rows</p>
                      <p className="text-2xl font-bold text-gray-900">{details.rows_processed}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold text-green-600">
                        {details.rows_processed > 0
                          ? Math.round(
                              ((details.rows_processed - details.rows_skipped) / details.rows_processed) * 100
                            )
                          : 0}
                        %
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Import ID</p>
                      <p className="text-xs font-mono text-gray-600 mt-2 break-all">
                        {details.import_session_id.substring(0, 16)}...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // History List
            <div>
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 font-medium">No import history yet</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Start by uploading your first bulk venue file
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.import_session_id}
                      onClick={() => handleViewDetails(item.import_session_id)}
                      className="border rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            {item.status === 'SUCCESS' ? (
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate">{item.file_name}</p>
                              <p className="text-sm text-gray-500 flex items-center gap-4 mt-1">
                                <span>{new Date(item.uploaded_at).toLocaleString()}</span>
                                <span className="text-gray-400">|</span>
                                <span>{item.rows_processed} rows</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {item.hotels_created} hotels
                          </p>
                          <p
                            className={`text-xs font-medium mt-1 ${
                              item.status === 'SUCCESS' ? 'text-green-600' : 'text-orange-600'
                            }`}
                          >
                            {item.status === 'SUCCESS' ? 'Completed' : 'Partial'}
                          </p>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors mt-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {history.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                  <button
                    onClick={() => {
                      setCurrentPage(Math.max(0, currentPage - 1));
                      loadHistory();
                    }}
                    disabled={currentPage === 0}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    ← Previous
                  </button>
                  <span className="text-sm text-gray-600 font-medium">Page {currentPage + 1}</span>
                  <button
                    onClick={() => {
                      setCurrentPage(currentPage + 1);
                      loadHistory();
                    }}
                    disabled={history.length < 10}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
