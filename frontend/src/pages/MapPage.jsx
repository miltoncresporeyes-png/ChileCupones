import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Fix for default marker icon in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle "Locate Me"
function LocationMarker() {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

export default function MapPage() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBank, setSelectedBank] = useState('Todos');
  
  // Santiago Center coordinates
  const center = [-33.4489, -70.6693];

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/discounts`);
        // Filter discounts that have coordinates
        const geoDiscounts = response.data.filter(d => d.latitude && d.longitude);
        setDiscounts(geoDiscounts);
      } catch (error) {
        console.error("Error fetching discounts", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  // Extract unique payment methods
  const banks = ['Todos', ...new Set(discounts.map(d => d.paymentMethod).filter(Boolean))];

  // Filter discounts
  const filteredDiscounts = selectedBank === 'Todos' 
    ? discounts 
    : discounts.filter(d => d.paymentMethod === selectedBank);

  return (
    <div className="h-[calc(100vh-64px)] w-full relative">
      {/* Floating Filter */}
      <div className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-lg shadow-lg max-w-xs">
        <h4 className="text-sm font-bold mb-2 px-2">Filtrar por Banco</h4>
        <div className="flex flex-wrap gap-2">
          {banks.map(bank => (
            <button
              key={bank}
              onClick={() => setSelectedBank(bank)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors
                ${selectedBank === bank 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {bank}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      ) : (
        <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
          {filteredDiscounts.map((discount) => (
            <Marker 
              key={discount._id || discount.externalId} 
              position={[discount.latitude, discount.longitude]}
            >
              <Popup className="custom-popup">
                <div className="w-64 p-1">
                  <div className="relative h-32 mb-2 rounded-lg overflow-hidden">
                    <img 
                      src={discount.imageUrl || "https://via.placeholder.com/400x200?text=Oferta"} 
                      alt={discount.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                      {discount.discountPercentage}% OFF
                    </div>
                  </div>
                  <h3 className="font-bold text-sm mb-1 line-clamp-2">{discount.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">{discount.store?.name || discount.store_name}</p>
                  <a 
                    href={`${API_URL}/api/track/${discount._id || discount.externalId}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-gray-900 text-white text-xs font-bold py-2 rounded hover:bg-primary transition-colors"
                  >
                    Ir a la Oferta
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}
