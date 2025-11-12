import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import { storeService, type Store } from '@/services/storeService';
import { geocodeMissing } from '@/lib/geocoding';
import { FaMapMarkerAlt, FaPhone, FaClock, FaSearch } from 'react-icons/fa';
import { MdStore } from 'react-icons/md';

import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const redSvg = encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' width='32' height='48' viewBox='0 0 32 48'>
    <defs>
      <filter id='shadow' x='-50%' y='-50%' width='200%' height='200%'>
        <feGaussianBlur in='SourceAlpha' stdDeviation='2' result='blur'/>
        <feOffset dy='2' result='offset'/>
        <feMerge>
          <feMergeNode in='offset'/>
          <feMergeNode in='SourceGraphic'/>
        </feMerge>
      </filter>
    </defs>
    <path d='M16 1C8.82 1 3 6.82 3 14c0 9.54 12.02 31.4 12.52 32.32a.6.6 0 0 0 1.0 0C16.98 45.4 29 23.54 29 14 29 6.82 23.18 1 16 1z' fill='#ef4444' filter='url(#shadow)'/>
    <circle cx='16' cy='14' r='5' fill='white'/>
  </svg>
`);
const redIcon = L.icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${redSvg}`,
  iconSize: [30, 44],
  iconAnchor: [15, 44],
  popupAnchor: [0, -38],
  shadowUrl: markerShadow,
  shadowSize: [36, 16],
  shadowAnchor: [11, 16],
});

export type StoreWithLocation = Store & {
  latitude?: number;
  longitude?: number;
  openingHours?: Array<{
    day: string; 
    open: string; 
    close: string; 
  }>;
};

function FitOrFocus({ stores, selected }: { stores: StoreWithLocation[]; selected?: StoreWithLocation | null }) {
  const map = useMap();
  useEffect(() => {
    const points = stores
      .filter((s) => typeof s.latitude === 'number' && typeof s.longitude === 'number')
      .map((s) => [s.latitude!, s.longitude!] as [number, number]);

    if (selected && selected.latitude && selected.longitude) {
      map.flyTo([selected.latitude, selected.longitude], 15, { duration: 0.8 });
      return;
    }

    if (points.length >= 2) {
      const bounds = L.latLngBounds(points as LatLngExpression[]);
      map.fitBounds(bounds.pad(0.2));
    } else if (points.length === 1) {
      map.setView(points[0] as LatLngExpression, 14);
    }
  }, [map, stores, selected]);
  return null;
}

const RestaurantsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [stores, setStores] = useState<StoreWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const defaultTargetName = 'Chicken Kitchen High Technology bay';

  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await storeService.getAll();
        const normalized = (data as any[]).map((s) => ({
          ...s,
          latitude: s.latitude ?? s.lat ?? s.Latitude ?? s.location?.lat ?? s.geo?.lat ?? undefined,
          longitude: s.longitude ?? s.lng ?? s.lon ?? s.Lng ?? s.Lon ?? s.location?.lng ?? s.location?.lon ?? s.geo?.lng ?? s.geo?.lon ?? undefined,
        })) as StoreWithLocation[];
        if (mounted) setStores(normalized);

        // Check if storeId is in URL params
        const storeIdParam = searchParams.get('storeId');
        if (storeIdParam && mounted) {
          const storeId = parseInt(storeIdParam, 10);
          if (!isNaN(storeId)) {
            setSelectedId(storeId);
          }
        } else if (mounted) {
          const target = normalized.find((s: any) => (s.name || '').toLowerCase().includes(defaultTargetName.toLowerCase()));
          if (target) setSelectedId(target.id);
        }

        const needGeo = normalized.some((s) => s.address && (s.latitude == null || s.longitude == null));
        if (mounted && needGeo) {
          setGeocoding(true);
          const provider = ((import.meta as any)?.env?.VITE_GEOCODER as 'google' | 'nominatim') || 'nominatim';
          const filled = await geocodeMissing(normalized, undefined, provider);
          if (mounted) setStores(filled);
          if (mounted && !selectedId) {
            const storeIdParam = searchParams.get('storeId');
            if (storeIdParam) {
              const storeId = parseInt(storeIdParam, 10);
              if (!isNaN(storeId)) {
                setSelectedId(storeId);
              }
            } else {
              const target = filled.find((s: any) => (s.name || '').toLowerCase().includes(defaultTargetName.toLowerCase()));
              if (target) setSelectedId(target.id);
            }
          }
          setGeocoding(false);
        }
      } catch (e: any) {
        console.error('Failed to load stores:', e);
        if (mounted) setError(e?.message || 'Failed to load stores');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [searchParams]);

  useEffect(() => {
    if (!selectedId) return;
    const el = itemRefs.current[selectedId];
    if (el && listRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedId]);

  const selectedStore = useMemo(() => stores.find((s) => s.id === selectedId) || null, [stores, selectedId]);

  const filteredStores = useMemo(() => {
    if (!searchTerm) return stores;
    const term = searchTerm.toLowerCase();
    return stores.filter(s => 
      s.name.toLowerCase().includes(term) || 
      s.address?.toLowerCase().includes(term)
    );
  }, [stores, searchTerm]);

  const defaultCenter: LatLngExpression = [21.0278, 105.8342]; 

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-3 mt-10">
              Our Restaurants
            </h1>
            <p className="text-gray-600 text-lg">Find your nearest Chicken Kitchen location</p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 rounded-2xl bg-red-50 border-2 border-red-200 p-4 text-red-700 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white relative group z-0">
                <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <MdStore className="text-red-500 text-xl" />
                    <span>{stores.length} Locations</span>
                  </div>
                </div>
                
              <MapContainer
                center={
                  selectedStore && selectedStore.latitude != null && selectedStore.longitude != null
                    ? ([selectedStore.latitude, selectedStore.longitude] as LatLngExpression)
                    : defaultCenter
                }
                zoom={13}
                scrollWheelZoom
                style={{ height: 480, width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {stores
                  .filter((s) => typeof s.latitude === 'number' && typeof s.longitude === 'number')
                  .map((s) => (
                    <Marker
                      key={s.id}
                      position={[s.latitude!, s.longitude!]}
                      icon={redIcon}
                      eventHandlers={{
                        click: () => setSelectedId(s.id),
                      }}
                    >
                      <Popup>
                        <div className="space-y-1">
                          <div className="font-semibold">{s.name}</div>
                          {typeof s.isActive === 'boolean' && (
                            <div className="text-xs">Status: {s.isActive ? 'Open' : 'Closed'}</div>
                          )}
                          {s.phone && <div className="text-sm">📞 {s.phone}</div>}
                          <button
                            className="mt-2 text-sm text-emerald-600 hover:underline"
                            onClick={() => setSelectedId(s.id)}
                          >
                            View details
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                <FitOrFocus stores={stores} selected={selectedStore ?? undefined} />
              </MapContainer>
              </div>
            </motion.div>

            {/* Store Info Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-1"
            >
              <div
                className="rounded-3xl bg-white border-2 border-red-200 text-gray-800 shadow-2xl p-6 sticky top-24 max-h-[600px] overflow-hidden flex flex-col"
                ref={listRef}
              >
                <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-red-100">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-md"
                  >
                    <FaClock className="text-xl" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-red-500">Store Info</h2>
                </div>

                <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
                  {loading && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-red-200 border-t-red-500 rounded-full"
                      />
                      <p className="mt-4 text-gray-600">Loading stores...</p>
                    </div>
                  )}
                  
                  {!loading && !selectedStore && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-gray-600 text-center py-8"
                    >
                      <FaMapMarkerAlt className="text-5xl mx-auto mb-4 opacity-30 text-red-300" />
                      <p>Select a store on the map or from the list below to see details.</p>
                    </motion.div>
                  )}

                  <AnimatePresence mode="wait">
                    {selectedStore && (
                      <motion.div
                        key={selectedStore.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-2xl p-5 bg-red-50 border border-red-200 shadow-lg"
                        ref={(el) => {
                          if (selectedId && el) itemRefs.current[selectedId] = el;
                        }}
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center flex-shrink-0 text-white shadow-md">
                            <MdStore className="text-2xl" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 text-xl leading-tight">{selectedStore.name}</div>
                            {typeof selectedStore.isActive === 'boolean' && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold"
                                style={{
                                  backgroundColor: selectedStore.isActive ? '#10b981' : '#ef4444',
                                  color: 'white'
                                }}
                              >
                                <span className={`w-2 h-2 rounded-full ${selectedStore.isActive ? 'bg-white animate-pulse' : 'bg-white/70'}`} />
                                {selectedStore.isActive ? 'Open Now' : 'Closed'}
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {selectedStore.address && (
                          <div className="flex items-start gap-3 mb-3 text-gray-700">
                            <FaMapMarkerAlt className="text-lg mt-0.5 flex-shrink-0 text-red-500" />
                            <p className="text-sm leading-relaxed">{selectedStore.address}</p>
                          </div>
                        )}
                        
                        {selectedStore.phone && (
                          <div className="flex items-center gap-3 mb-3 text-gray-700">
                            <FaPhone className="text-base text-red-500" />
                            <a href={`tel:${selectedStore.phone}`} className="text-sm hover:text-red-600 transition-colors">
                              {selectedStore.phone}
                            </a>
                          </div>
                        )}

                        {Array.isArray(selectedStore.openingHours) && selectedStore.openingHours.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-red-200">
                            <div className="flex items-center gap-2 text-sm font-semibold mb-3 text-gray-900">
                              <FaClock className="text-red-500" />
                              <span>Opening Hours</span>
                            </div>
                            <ul className="space-y-2">
                              {selectedStore.openingHours.map((t, idx) => (
                                <motion.li
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2 border border-red-100"
                                >
                                  <span className="font-medium text-gray-900">{t.day}</span>
                                  <span className="text-gray-600">
                                    {t.open} – {t.close}
                                  </span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {geocoding && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-gray-500 mt-4 text-center"
                    >
                      📍 Resolving coordinates...
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* All Stores Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">All Stores</h2>
              
              {/* Search Bar */}
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors w-64 bg-white shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredStores.map((s, idx) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    onClick={() => setSelectedId(s.id)}
                    className={`rounded-2xl border-2 p-6 shadow-lg cursor-pointer transition-all duration-300 bg-white ${
                      selectedId === s.id 
                        ? 'border-red-500 shadow-red-200 shadow-xl' 
                        : 'border-gray-200 hover:border-red-300 hover:shadow-xl'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white flex-shrink-0 shadow-md"
                        >
                          <MdStore className="text-2xl" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{s.name}</h3>
                          {typeof s.isActive === 'boolean' && (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${s.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                              {s.isActive ? 'Open' : 'Closed'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {s.address && (
                      <div className="flex items-start gap-2 text-gray-600 mb-2">
                        <FaMapMarkerAlt className="text-red-500 mt-1 flex-shrink-0" />
                        <p className="text-sm line-clamp-2">{s.address}</p>
                      </div>
                    )}
                    
                    {s.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaPhone className="text-red-500" />
                        <p className="text-sm">{s.phone}</p>
                      </div>
                    )}

                    <motion.div
                      whileHover={{ x: 5 }}
                      className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-red-500 font-semibold text-sm"
                    >
                      <span>View on map</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredStores.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 text-gray-500"
              >
                <FaSearch className="text-6xl mx-auto mb-4 opacity-30" />
                <p className="text-lg">No stores found matching "{searchTerm}"</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </>
  );
};

export default RestaurantsPage;
