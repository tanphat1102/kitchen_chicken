export interface GeoPoint { lat: number; lon: number }

export type GeocoderProvider = 'nominatim' | 'google';

const LS_KEY = 'geo_cache_v2';
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
type GeoCache = Record<string, { lat: number; lon: number; ts: number }>; // ts used for TTL

function loadCache(): GeoCache {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as GeoCache;
  } catch {
    return {};
  }
}

function saveCache(cache: GeoCache) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(cache));
  } catch {
  }
}

let cache: GeoCache = loadCache();
let lastCall = 0;
const inflight: Record<string, Promise<GeoPoint | null>> = {};

async function throttledDelay(minGapMs = 1100) {
  const now = Date.now();
  const wait = Math.max(0, minGapMs - (now - lastCall));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCall = Date.now();
}

export async function geocodeAddress(address: string, provider: GeocoderProvider = 'nominatim', ttlMs: number = DEFAULT_TTL_MS): Promise<GeoPoint | null> {
  const key = address.trim().toLowerCase();
  if (!key) return null;

  const cached = cache[key];
  if (cached && Date.now() - cached.ts < ttlMs) return { lat: cached.lat, lon: cached.lon };

  if (Object.prototype.hasOwnProperty.call(inflight, key)) return inflight[key];

  inflight[key] = (async () => {
    const point = provider === 'google'
      ? await geocodeAddressGoogle(address)
      : await geocodeAddressNominatim(address);
    if (point) {
      cache[key] = { ...point, ts: Date.now() };
      saveCache(cache);
    }
    delete inflight[key];
    return point;
  })();

  return inflight[key];
}

export async function geocodeMissing<T extends { address?: string; latitude?: number; longitude?: number }>(
  items: T[],
  onProgress?: (done: number, total: number) => void,
  provider: GeocoderProvider = 'nominatim',
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<T[]> {
  const total = items.length;
  let done = 0;
  const out: T[] = [];
  for (const item of items) {
    let result = item;
    if ((result as any).latitude == null && (result as any).longitude == null && result.address) {
      const geo = await geocodeAddress(result.address, provider, ttlMs);
      if (geo) {
        result = { ...result, latitude: geo.lat, longitude: geo.lon };
      }
    }
    out.push(result);
    done++;
    onProgress?.(done, total);
  }
  return out;
}

async function geocodeAddressNominatim(address: string): Promise<GeoPoint | null> {
  await throttledDelay();
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'json');
  url.searchParams.set('q', address);
  url.searchParams.set('limit', '1');

  const resp = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
  if (!resp.ok) return null;
  const json = (await resp.json()) as Array<{ lat: string; lon: string }>; 
  if (!Array.isArray(json) || json.length === 0) return null;
  return { lat: parseFloat(json[0].lat), lon: parseFloat(json[0].lon) };
}

async function geocodeAddressGoogle(address: string): Promise<GeoPoint | null> {
  const key = (import.meta as any)?.env?.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) return null; 
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', address);
  url.searchParams.set('key', key);
  const resp = await fetch(url.toString());
  if (!resp.ok) return null;
  const json = await resp.json();
  if (json.status !== 'OK' || !json.results?.[0]?.geometry?.location) return null;
  const loc = json.results[0].geometry.location;
  return { lat: loc.lat, lon: loc.lng };
}
