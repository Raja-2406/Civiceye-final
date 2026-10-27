import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Search, CheckCircle2, Crosshair } from 'lucide-react';

// Fix Leaflet's default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to handle marker dragging and map clicks
function MarkerController({ position, setPosition, onLocationChange }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      onLocationChange(e.latlng.lat, e.latlng.lng);
      map.panTo(newPos);
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend(e) {
        const marker = e.target;
        if (marker != null) {
          const latlng = marker.getLatLng();
          const newPos = [latlng.lat, latlng.lng];
          setPosition(newPos);
          onLocationChange(latlng.lat, latlng.lng);
          map.panTo(newPos);
        }
      },
    }),
    [map, setPosition, onLocationChange]
  );

  return (
    <>
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={position}
      />
      {/* 10-meter duplicate detection circle around location */}
      <Circle
        center={position}
        radius={10}
        pathOptions={{
          color: '#0284c7',
          fillColor: '#38bdf8',
          fillOpacity: 0.2,
          weight: 2,
          dashArray: '3, 3',
        }}
      />
    </>
  );
}

// Controller to smoothly pan map when position changes programmatically
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function LocationPicker({
  initialLat = 11.5034,
  initialLng = 77.2764,
  onLocationSelected,
}) {
  const [position, setPosition] = useState([initialLat, initialLng]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(8);
  const [address, setAddress] = useState('Sathy – Athani – Bhavani Road, Satyamangalam');
  const [isLocating, setIsLocating] = useState(false);

  // Reverse Geocoding helper (OpenStreetMap Nominatim with offline fallback)
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      if (res.ok) {
        const data = await res.json();
        const formatted = data.display_name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        const locality = data.address?.suburb || data.address?.neighbourhood || data.address?.road || 'Local Area';
        const city = data.address?.city || data.address?.town || data.address?.county || 'Satyamangalam';
        const pincode = data.address?.postcode || '638401';

        setAddress(formatted);
        onLocationSelected({
          latitude: lat,
          longitude: lng,
          formattedAddress: formatted,
          locality,
          city,
          pincode,
          gpsAccuracy,
        });
        return;
      }
    } catch (err) {
      // Offline fallback
    }

    const fallbackAddr = `Sathy – Athani – Bhavani Road, Sathyamangalam (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`;
    setAddress(fallbackAddr);
    onLocationSelected({
      latitude: lat,
      longitude: lng,
      formattedAddress: fallbackAddr,
      locality: 'Athani Road',
      city: 'Satyamangalam',
      pincode: '638401',
      gpsAccuracy,
    });
  };

  const handleLocationChange = (lat, lng) => {
    reverseGeocode(lat, lng);
  };

  // Browser GPS Location Hook
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setPosition([latitude, longitude]);
        const acc = Math.round(accuracy) || 6;
        setGpsAccuracy(acc);
        reverseGeocode(latitude, longitude);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Address search query
  const handleSearchAddress = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setPosition([lat, lon]);
        reverseGeocode(lat, lon);
      } else {
        alert('Location not found. Please try dragging the map marker.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Notify parent on initial load
  useEffect(() => {
    reverseGeocode(initialLat, initialLng);
  }, []);

  return (
    <div className="space-y-3">
      {/* Top search & GPS controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearchAddress} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search street, landmark, city, or pincode..."
            className="w-full pl-9 pr-20 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
          >
            {isSearching ? 'Finding...' : 'Search'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 rounded-lg text-xs font-semibold transition shrink-0"
        >
          <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Locating...' : 'Use My Current Location'}</span>
        </button>
      </div>

      {/* Leaflet Interactive Map */}
      <div className="h-64 sm:h-72 w-full rounded-xl overflow-hidden border border-slate-200 relative shadow-sm">
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <ChangeView center={position} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MarkerController
            position={position}
            setPosition={setPosition}
            onLocationChange={handleLocationChange}
          />
        </MapContainer>

        {/* GPS Fix Accuracy Badge overlay */}
        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm border border-slate-200 text-slate-700 text-[10px] font-medium px-2.5 py-1 rounded-md shadow-sm z-[400] flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>GPS Fix Accuracy: ±{gpsAccuracy}m</span>
        </div>

        {/* Radius note overlay */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-600 text-[10px] px-2.5 py-1 rounded-md shadow-sm z-[400]">
          Blue dashed ring: 10m Duplicate Analysis Buffer
        </div>
      </div>

      {/* Formatted Address and Coordinates Box (Figure 5.2 in Report) */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
        <div className="flex items-center space-x-1.5 text-slate-600 font-medium">
          <MapPin className="w-3.5 h-3.5 text-brand-600" />
          <span>Formatted Location Address:</span>
        </div>
        <p className="text-slate-800 font-semibold pl-5">{address}</p>
        <div className="text-[11px] text-slate-500 pl-5 flex items-center space-x-3">
          <span>Latitude: <strong className="text-slate-700">{position[0].toFixed(5)}</strong></span>
          <span>Longitude: <strong className="text-slate-700">{position[1].toFixed(5)}</strong></span>
        </div>
      </div>
    </div>
  );
}
