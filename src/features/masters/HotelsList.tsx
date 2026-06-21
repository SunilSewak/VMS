import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Hotel } from "@/types/master";
import { useAuthStore } from "@/store/authStore";

export function HotelsList() {
  const { user } = useAuthStore();
  const canManageMasters = user?.role?.role_name === 'SUPER_ADMIN' || user?.role?.role_name === 'VMS_ADMIN';
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHotels() {
      const { data } = await supabase
        .from('hotels')
        .select('*, city:cities(name), category:hotel_categories(name)')
        .order('hotel_name');
      if (data) setHotels(data);
      setLoading(false);
    }
    fetchHotels();
  }, []);

  if (loading) return <div>Loading hotels...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Hotels Registry</h2>
        {canManageMasters && <button className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700">Add Hotel</button>}
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="p-3">Hotel Name</th>
            <th className="p-3">City</th>
            <th className="p-3">Category</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {hotels.length === 0 ? (
            <tr><td colSpan={5} className="p-3 text-center text-gray-500">No hotels found.</td></tr>
          ) : hotels.map(hotel => (
            <tr key={hotel.id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">{hotel.hotel_name}</td>
              <td className="p-3">{hotel.city?.name}</td>
              <td className="p-3">{hotel.category?.name}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs ${hotel.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {hotel.status}
                </span>
              </td>
              <td className="p-3 text-right">
                {canManageMasters && <span className="text-blue-600 cursor-pointer">Edit</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
