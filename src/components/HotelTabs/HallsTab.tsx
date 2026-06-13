import { useState, useEffect } from 'react';
import type { Hall, HotelWithRelations } from '../../features/venues/types';
import { getHallsByHotel, deleteHall } from '../../features/venues/venueService';
import { HallFormModal } from '../HallFormModal';

interface HallsTabProps {
  hotel: HotelWithRelations;
  onRefresh: () => void;
}

export function HallsTab({ hotel, onRefresh }: HallsTabProps) {
  const [halls, setHalls] = useState<Hall[]>(hotel.halls || []);
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);

  // Load halls
  useEffect(() => {
    loadHalls();
  }, [hotel.id]);

  async function loadHalls() {
    try {
      setLoading(true);
      const data = await getHallsByHotel(hotel.id);
      setHalls(data);
    } catch (error) {
      console.error('Error loading halls:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(hallId: string) {
    if (!confirm('Delete Conference Room?\n\nThis action cannot be undone.')) return;

    try {
      await deleteHall(hallId);
      await loadHalls();
      onRefresh();
    } catch (error) {
      console.error('Error deleting hall:', error);
      alert('Failed to delete hall');
    }
  }

  function handleAddHall() {
    setEditingHall(null);
    setShowFormModal(true);
  }

  function handleEditHall(hall: Hall) {
    setEditingHall(hall);
    setShowFormModal(true);
  }

  async function handleFormComplete() {
    setShowFormModal(false);
    setEditingHall(null);
    await loadHalls();
    onRefresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading conference rooms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Conference Rooms</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{halls.length}</p>
        </div>
        <button
          onClick={handleAddHall}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Add Room
        </button>
      </div>

      {/* Halls Grid - Card Layout */}
      {halls.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">No conference rooms configured</p>
          <p className="text-sm text-gray-400 mt-1">Add a conference room to enable meeting space bookings</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {halls.map((hall) => (
            <div
              key={hall.id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Card Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{hall.hall_name}</h3>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      hall.indoor_outdoor === 'INDOOR'
                        ? 'bg-green-100 text-green-700'
                        : hall.indoor_outdoor === 'OUTDOOR'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {hall.indoor_outdoor}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      hall.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {hall.status}
                  </span>
                </div>
              </div>

              {/* Card Body - Seating Capacities */}
              <div className="px-6 py-4 space-y-3">
                {/* Floor info */}
                {hall.floor && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Floor:</span>
                    <span className="font-medium text-gray-900">{hall.floor}</span>
                  </div>
                )}

                {/* Seating Capacities - 3 Formats */}
                <div className="grid grid-cols-3 gap-2">
                  {hall.classroom_capacity ? (
                    <div className="bg-blue-50 rounded p-2">
                      <p className="text-xs text-gray-600 font-medium">Classroom</p>
                      <p className="text-lg font-bold text-blue-700">{hall.classroom_capacity}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded p-2 opacity-50">
                      <p className="text-xs text-gray-600 font-medium">Classroom</p>
                      <p className="text-lg font-bold text-gray-400">—</p>
                    </div>
                  )}
                  {hall.u_shape_capacity ? (
                    <div className="bg-green-50 rounded p-2">
                      <p className="text-xs text-gray-600 font-medium">U-Shape</p>
                      <p className="text-lg font-bold text-green-700">{hall.u_shape_capacity}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded p-2 opacity-50">
                      <p className="text-xs text-gray-600 font-medium">U-Shape</p>
                      <p className="text-lg font-bold text-gray-400">—</p>
                    </div>
                  )}
                  {hall.cluster_capacity ? (
                    <div className="bg-purple-50 rounded p-2">
                      <p className="text-xs text-gray-600 font-medium">Cluster</p>
                      <p className="text-lg font-bold text-purple-700">{hall.cluster_capacity}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded p-2 opacity-50">
                      <p className="text-xs text-gray-600 font-medium">Cluster</p>
                      <p className="text-lg font-bold text-gray-400">—</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="px-6 py-3 border-t border-gray-200 flex gap-2">
                <button
                  onClick={() => handleEditHall(hall)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(hall.id)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hall Form Modal */}
      {showFormModal && (
        <HallFormModal
          hotel={hotel}
          hall={editingHall}
          onClose={() => {
            setShowFormModal(false);
            setEditingHall(null);
          }}
          onComplete={handleFormComplete}
        />
      )}
    </div>
  );
}
