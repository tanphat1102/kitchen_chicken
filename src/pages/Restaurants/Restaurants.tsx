import React, { useEffect, useMemo, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import { storeService, type Store } from '@/services/storeService';
import { geocodeMissing } from '@/lib/geocoding';

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
  const [stores, setStores] = useState<StoreWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const defaultTargetName = 'Chicken Kitchen High Technology bay';

  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await storeService.getAllStores();
        const normalized = (data as any[]).map((s) => ({
          ...s,
          latitude: s.latitude ?? s.lat ?? s.Latitude ?? s.location?.lat ?? s.geo?.lat ?? undefined,
          longitude: s.longitude ?? s.lng ?? s.lon ?? s.Lng ?? s.Lon ?? s.location?.lng ?? s.location?.lon ?? s.geo?.lng ?? s.geo?.lon ?? undefined,
        })) as StoreWithLocation[];
        if (mounted) setStores(normalized);

        if (mounted) {
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
            const target = filled.find((s: any) => (s.name || '').toLowerCase().includes(defaultTargetName.toLowerCase()));
            if (target) setSelectedId(target.id);
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
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const el = itemRefs.current[selectedId];
    if (el && listRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedId]);

  const selectedStore = useMemo(() => stores.find((s) => s.id === selectedId) || null, [stores, selectedId]);

  const defaultCenter: LatLngExpression = [21.0278, 105.8342]; 

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Our Restaurants</h1>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100">
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
          </div>

          <div className="lg:col-span-1">
            <div
              className="rounded-2xl bg-[#0b1220] text-white shadow-md p-5 sticky top-24 max-h-[480px] overflow-auto"
              ref={listRef}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">🕘</span>
                <h2 className="text-lg font-semibold">Store Info</h2>
              </div>

              {loading && <div className="text-gray-300">Loading stores...</div>}
              {!loading && !selectedStore && (
                <div className="text-gray-300">
                  Select a store on the map or from the list below to see details.
                </div>
              )}

              {selectedStore && (
                <div
                  className="rounded-xl p-4 bg-white/5 border border-white/10"
                  ref={(el) => {
                    if (selectedId && el) itemRefs.current[selectedId] = el;
                  }}
                >
                  <div className="font-semibold text-white/95 text-lg">{selectedStore.name}</div>
                  {selectedStore.address && (
                    <div className="text-sm text-gray-300 mt-1">{selectedStore.address}</div>
                  )}
                  {selectedStore.phone && (
                    <div className="text-sm text-gray-200 mt-1">📞 {selectedStore.phone}</div>
                  )}
                  {typeof selectedStore.isActive === 'boolean' && (
                    <div className="text-xs mt-2">
                      Status: {selectedStore.isActive ? (
                        <span className="text-emerald-400">Open</span>
                      ) : (
                        <span className="text-red-400">Closed</span>
                      )}
                    </div>
                  )}

                  {Array.isArray(selectedStore.openingHours) && selectedStore.openingHours.length > 0 && (
                    <div className="mt-3 border-t border-white/10 pt-3">
                      <div className="text-sm font-medium mb-2">Operational Times</div>
                      <ul className="space-y-1 text-sm text-gray-200">
                        {selectedStore.openingHours.map((t, idx) => (
                          <li key={idx} className="flex items-center justify-between gap-3">
                            <span className="text-gray-300">{t.day}</span>
                            <span>
                              {t.open} – {t.close}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {geocoding && (
                <div className="text-xs text-gray-400 mt-3">Resolving coordinates from address…</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">All Stores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow cursor-pointer"
                onClick={() => setSelectedId(s.id)}
              >
                <div className="font-semibold">{s.name}</div>
                {s.address && <div className="text-sm text-gray-600 mt-1">{s.address}</div>}
                {s.phone && <div className="text-sm mt-1">📞 {s.phone}</div>}
                {typeof s.isActive === 'boolean' && (
                  <div className="text-xs mt-2">Status: {s.isActive ? 'Open' : 'Closed'}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default RestaurantsPage;
