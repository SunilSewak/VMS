import React from 'react';
import type { HotelWithRelations } from '../../features/venues/types';

interface OverviewTabProps {
  hotel: HotelWithRelations;
}

export function OverviewTab({ hotel }: OverviewTabProps) {
  return (
    <div className="space-y-6 p-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Hotel Name</label>
          <p className="mt-1 text-lg font-semibold text-gray-900">{hotel.hotel_name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {hotel.city?.city_name || 'N/A'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <p className="mt-1 text-gray-600">{hotel.address || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <p className="mt-1">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                hotel.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800'
                  : hotel.status === 'INACTIVE'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {hotel.status}
            </span>
          </p>
        </div>
      </div>

      {/* Contact Information */}
      {(hotel.contact_phone || hotel.contact_email || hotel.website) && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hotel.contact_phone && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-gray-600">{hotel.contact_phone}</p>
              </div>
            )}
            {hotel.contact_email && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-600">{hotel.contact_email}</p>
              </div>
            )}
            {hotel.website && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <p className="mt-1 text-blue-600 hover:underline">
                  <a href={hotel.website} target="_blank" rel="noopener noreferrer">
                    {hotel.website}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Operational Information */}
      {(hotel.total_rooms || hotel.check_in_time || hotel.check_out_time) && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Operational Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hotel.total_rooms && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Rooms</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{hotel.total_rooms}</p>
              </div>
            )}
            {hotel.check_in_time && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Check-in Time</label>
                <p className="mt-1 text-gray-600">{hotel.check_in_time}</p>
              </div>
            )}
            {hotel.check_out_time && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Check-out Time</label>
                <p className="mt-1 text-gray-600">{hotel.check_out_time}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Venue Statistics */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Venue Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-600">Halls</p>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {hotel.halls?.length || 0}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-600">Room Types</p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {hotel.accommodation_inventory?.length || 0}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-600">Occupancy Rules</p>
            <p className="mt-2 text-2xl font-bold text-purple-600">
              {hotel.occupancy_rules?.length || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
