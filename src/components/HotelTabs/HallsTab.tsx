import React, { useState, useEffect } from 'react';
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
    if (!confirm('Are you sure you want to delete this hall?')) return;

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
        <p className="text-gray-500">Loading halls...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Configured Halls</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{halls.length}</p>
        </div>
        <button
          onClick={handleAddHall}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Add Hall
        </button>
      </div>

      {/* Halls Grid - Card Layout */}
      {halls.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">No halls configured</p>
          <p className="text-sm text-gray-400 mt-1">Add a hall to enable meeting space bookings</p>
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
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                    {hall.hall_type}
                  </span>
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
                </div>
              </div>

              {/* Card Body - Seating Capacities */}
              <div className="px-6 py-4 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  {hall.theater_capacity && (
                    <div className="bg-blue-50 rounded p-2">
                      <p className="text-xs text-gray-600 font-medium">Theatre</p>
                      <p className="text-lg font-bold text-blue-700">{hall.theater_capacity}</p>
                    </div>
                  )}
                  {hall.classroom_capacity && (
                    <div className="bg-green-50 rounded p-2">
                      <p className="text-xs text-gray-600 font-medium">Classroom</p>
                      <p className="text-lg font-bold text-green-700">{hall.classroom_capacity}</p>
                    </div>
                  )}
                  {hall.capacity && (
                    <div className="bg-purple-50 rounded p-2">
                      <p className="text-xs text-gray-600 font-medium">General</p>
                      <p className="text-lg font-bold text-purple-700">{hall.capacity}</p>
                    </div>
                  )}
                  {hall.round_table_capacity && (
                    <div className="bg-orange-50 rounded p-2">
                      <p className="text-xs text-gray-600 font-medium">Round Table</p>
                      <p className="text-lg font-bold text-orange-700">{hall.round_table_capacity}</p>
                    </div>
                  )}
                  {hall.cocktail_capacity && (
                    <div className="bg-pink-50 rounded p-2">
                      <p className="text-xs text-gray-600 font-medium">Cocktail</p>
                      <p className="text-lg font-bold text-pink-700">{hall.cocktail_capacity}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Details */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 space-y-2 text-xs">
                {hall.area && (
                  <p className="text-gray-600">
                    <span className="font-medium">Area:</span> {hall.area} sq.ft
                  </p>
                )}
                {hall.length && hall.width && (
                  <p className="text-gray-600">
                    <span className="font-medium">Dimensions:</span> {hall.length} × {hall.width}
                  </p>
                )}
                {hall.height && (
                  <p className="text-gray-600">
                    <span className="font-medium">Height:</span> {hall.height} ft
                  </p>
                )}
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span>{' '}
                  <span
                    className={`${
                      hall.status === 'ACTIVE'
                        ? 'text-green-700'
                        : 'text-red-700'
                    }`}
                  >
                    {hall.status}
                  </span>
                </p>
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
