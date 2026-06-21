import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { City } from "@/types/master";
import { useAuthStore } from "@/store/authStore";

export function CitiesList() {
  const { user } = useAuthStore();
  const canManageMasters = user?.role?.name === 'SUPER_ADMIN' || user?.role?.name === 'VMS_ADMIN';
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCities() {
      const { data } = await supabase.from('cities').select('*').order('name');
      if (data) setCities(data);
      setLoading(false);
    }
    fetchCities();
  }, []);

  if (loading) return <div>Loading cities...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Cities Registry</h2>
        {canManageMasters && <button className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700">Add City</button>}
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="p-3">ID</th>
            <th className="p-3">Name</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cities.length === 0 ? (
            <tr><td colSpan={3} className="p-3 text-center text-gray-500">No cities found.</td></tr>
          ) : cities.map(city => (
            <tr key={city.id} className="border-b">
              <td className="p-3 text-sm text-gray-500">{city.id}</td>
              <td className="p-3 font-medium">{city.name}</td>
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
