import React from 'react';
import { MapPin } from 'lucide-react';

export default function MapView({ destination, driverLocation, height = 320 }) {
  if (!destination?.lat || !destination?.lng) {
    return (
      <div style={{ height }} className="rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-500">
        <MapPin size={28} />
        <p className="text-sm font-medium">No destination provided</p>
      </div>
    );
  }

  // OpenStreetMap embed via iframe
  const lat = destination.lat;
  const lng = destination.lng;
  // Bounding box slightly larger than the point
  const bbox = `${lng - 0.05},${lat - 0.05},${lng + 0.05},${lat + 0.05}`;

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden shadow-sm border border-gray-200 relative">
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight="0"
        marginWidth="0"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
        style={{ border: 'none' }}
        title="Delivery Map"
      />
      <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 text-[10px] text-gray-500 rounded shadow-sm">
        Powered by OpenStreetMap
      </div>
    </div>
  );
}
