import type { HotelWithRelations } from '../../features/venues/types';

interface OverviewTabProps {
  hotel: HotelWithRelations;
}

// PHASE 4: Map occupancy numbers to labels
function getOccupancyLabel(num?: number | null): string {
  const mapping: Record<number, string> = {
    1: 'Single',
    2: 'Double',
    3: 'Triple',
    4: 'Quad',
  };
  return num ? mapping[num] || 'Unknown' : 'Not configured';
}

// PHASE 4: Get occupancy rule value for a designation
function getOccupancyForDesignation(hotel: HotelWithRelations, designationCode: string): string {
  const rule = hotel.occupancy_rules?.find(r => r.rule_type === designationCode);
  return getOccupancyLabel(rule?.min_occupancy);
}

export function OverviewTab({ hotel }: OverviewTabProps) {
  const designations = [
    { code: 'SO', label: 'Sales Officer' },
    { code: 'DM', label: 'District Manager' },
    { code: 'RSM', label: 'Regional Sales Manager' },
    { code: 'Senior Manager', label: 'Senior Manager' },
  ];

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

      {/* PHASE 5 SIMPLIFIED: Conference Room Summary */}
      {(hotel.halls && hotel.halls.length > 0) && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conference Rooms Summary</h3>
          <p className="text-sm text-gray-600 mb-4">Meeting space configuration overview (read-only)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600">Conference Rooms</p>
              <p className="mt-2 text-2xl font-bold text-blue-700">{hotel.halls.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600">Largest Classroom</p>
              <p className="mt-2 text-2xl font-bold text-green-700">
                {Math.max(...(hotel.halls.filter(h => h.classroom_capacity).map(h => h.classroom_capacity || 0) || [0])) || '—'}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600">Largest U-Shape</p>
              <p className="mt-2 text-2xl font-bold text-purple-700">
                {Math.max(...(hotel.halls.filter(h => h.u_shape_capacity).map(h => h.u_shape_capacity || 0) || [0])) || '—'}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600">Largest Cluster</p>
              <p className="mt-2 text-2xl font-bold text-yellow-700">
                {Math.max(...(hotel.halls.filter(h => h.cluster_capacity).map(h => h.cluster_capacity || 0) || [0])) || '—'}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            ℹ️ To edit conference rooms, use the <strong>Halls</strong> tab
          </p>
        </div>
      )}

      {/* PHASE 4: Occupancy Policy Summary */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Occupancy Policy</h3>
        <p className="text-sm text-gray-600 mb-4">Room occupancy assignments by designation (read-only)</p>
        <div className="bg-gray-50 rounded-lg divide-y">
          {designations.map(des => (
            <div key={des.code} className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{des.label} ({des.code})</span>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                {getOccupancyForDesignation(hotel, des.code)}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500">
          ℹ️ To edit occupancy assignments, use the <strong>Occupancy Rules</strong> tab
        </p>
      </div>

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
