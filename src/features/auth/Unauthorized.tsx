import { Link } from "react-router-dom";

export function Unauthorized() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Unauthorized</h1>
      <p className="text-gray-700 mb-6">You do not have permission to access this module.</p>
      <Link to="/" className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700">
        Return to Dashboard
      </Link>
    </div>
  );
}
