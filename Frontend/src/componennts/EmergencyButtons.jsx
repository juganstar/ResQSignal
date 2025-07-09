// src/components/EmergencyButtons.jsx
import { MapPin, Settings } from "lucide-react";

export default function EmergencyButtons({ userToken }) {
  if (!userToken) return null;

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 mb-8">
      <h3 className="text-xl font-semibold mb-4">Emergency Buttons</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href={`${backendURL}/test/${userToken}/`}
          className="bg-yellow-600 hover:bg-yellow-700 text-black font-medium px-4 py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <Settings size={18} /> Test Emergency
        </a>
        <a
          href={`${backendURL}/public/${userToken}/`}
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <MapPin size={18} /> Real Emergency
        </a>
      </div>
    </div>
  );
}
