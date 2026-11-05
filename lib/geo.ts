export type LatLng = {
  lat: number;
  lng: number;
};

export type TrackPoint = LatLng & {
  timestamp: number;
  accuracy: number;
};

/**
 * Haversine distance antara dua koordinat, dalam meter.
 */
export function haversine(a: LatLng, b: LatLng): number {
  const R = 6371000; // radius bumi (meter)
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Akurasi GPS maksimum yang masih diterima (meter). */
export const MAX_ACCURACY_M = 25;

/** Kecepatan maksimum yang masuk akal untuk lari (km/jam). */
export const MAX_SPEED_KMH = 25;

/** Jarak minimum antar titik agar dianggap bergerak (meter). */
export const MIN_MOVE_M = 3;

/**
 * Menentukan apakah titik GPS baru layak diterima.
 * - Akurasi harus <= MAX_ACCURACY_M
 * - Jika ada titik sebelumnya: jarak harus > MIN_MOVE_M
 * - Jika ada titik sebelumnya: kecepatan implisit harus <= MAX_SPEED_KMH
 */
export function shouldAcceptPoint(
  prev: TrackPoint | null,
  next: TrackPoint,
): boolean {
  if (next.accuracy > MAX_ACCURACY_M) return false;
  if (!prev) return true;

  const dist = haversine(prev, next);
  if (dist < MIN_MOVE_M) return false;

  const dtSec = (next.timestamp - prev.timestamp) / 1000;
  if (dtSec <= 0) return false;

  const speedKmh = (dist / dtSec) * 3.6;
  if (speedKmh > MAX_SPEED_KMH) return false;

  return true;
}