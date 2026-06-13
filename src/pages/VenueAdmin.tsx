import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Hotel } from '../features/venues/types';
import { getHotels, deleteHotel } from '../features/venues/venueService';
import { HotelFormModal } from '../components/HotelFormModal';

export function VenueAdmin() {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  // Load hotels
  useEffect(() => {
    loadHotels();
  }, []);

  async function loadHotels() {
    try {
      setLoading(true);
      const data = await getHotels();
      setHotels(data);
    } catch (error) {
      console.error('Error loading hotels:', error);
      alert('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(hotelId: string) {
    if (!confirm('Are you sure you want to delete this hotel? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteHotel(hotelId);
      await loadHotels();
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert('Failed to delete hotel');
    }
  }

  function handleCreateHotel() {
    setEditingHotel(null);
    setShowFormModal(true);
  }

  function handleEditHotel(hotel: Hotel) {
    setEditingHotel(hotel);
    setShowFormModal(true);
  }

  async function handleFormComplete() {
    setShowFormModal(false);
    setEditingHotel(null);
    await loadHotels();
  }

  // Filter hotels
  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.hotel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.city?.city_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || hotel.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Venue Repository</h1>
              <p className="text-gray-600 text-sm mt-1">Manage all hotels, halls, and accommodations</p>
            </div>
            <button
              onClick={handleCreateHotel}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              + Create Hotel
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Hotel or City
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredHotels.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{hotels.length}</span> hotels
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hotels List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredHotels.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500 text-lg font-medium">
              {hotels.length === 0 ? 'No hotels created yet' : 'No hotels match your search'}
            </p>
            {hotels.length === 0 && (
              <button
                onClick={handleCreateHotel}
                className="mt-4 px-4 py-2 text-blue-600 hover:underline font-medium"
              >
                Create the first hotel
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredHotels.map(hotel => (
              <div
                key={hotel.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Card Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {hotel.hotel_name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {hotel.city?.city_name || 'N/A'}
                  </p>
                </div>

                {/* Card Body */}
                <div className="px-6 py-4 space-y-3">
                  {/* Status Badge */}
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        hotel.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : hotel.status === 'INACTIVE'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {hotel.status}
                    </span>
                  </div>

                  {/* Hotel Details */}
                  <div className="space-y-2 text-sm">
                    {hotel.contact_email && (
                      <div>
                        <p className="text-gray-500 text-xs">Email</p>
                        <p className="text-gray-900 truncate">{hotel.contact_email}</p>
                      </div>
                    )}
                    {hotel.contact_phone && (
                      <div>
                        <p className="text-gray-500 text-xs">Phone</p>
                        <p className="text-gray-900">{hotel.contact_phone}</p>
                      </div>
                    )}
                    {hotel.total_rooms && (
                      <div>
                        <p className="text-gray-500 text-xs">Total Rooms</p>
                        <p className="text-gray-900">{hotel.total_rooms}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={() => navigate(`/administration/masters/venues/${hotel.id}`)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleEditHotel(hotel)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-200 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(hotel.id)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hotel Form Modal */}
      {showFormModal && (
        <HotelFormModal
          hotel={editingHotel}
          onClose={() => {
            setShowFormModal(false);
            setEditingHotel(null);
          }}
          onComplete={handleFormComplete}
        />
      )}
    </div>
  );
}
