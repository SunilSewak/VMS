import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { HotelCategory } from "@/types/master";
import { useAuthStore } from "@/store/authStore";

export function HotelCategoriesList() {
  const { user } = useAuthStore();
  const canManageMasters = user?.role?.role_name === 'SUPER_ADMIN' || user?.role?.role_name === 'VMS_ADMIN';
  const [categories, setCategories] = useState<HotelCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('hotel_categories').select('*').order('name');
      if (data) setCategories(data);
      setLoading(false);
    }
    fetchCategories();
  }, []);

  if (loading) return <div>Loading hotel categories...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Hotel Categories Registry</h2>
        {canManageMasters && <button className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700">Add Category</button>}
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
          {categories.length === 0 ? (
            <tr><td colSpan={3} className="p-3 text-center text-gray-500">No categories found.</td></tr>
          ) : categories.map(cat => (
            <tr key={cat.id} className="border-b">
              <td className="p-3 text-sm text-gray-500">{cat.id}</td>
              <td className="p-3 font-medium">{cat.name}</td>
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
