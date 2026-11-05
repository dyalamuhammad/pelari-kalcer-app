/**
 * Format detik ke "HH:MM:SS" atau "MM:SS" jika di bawah 1 jam.
 */
export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(sec)}`;
  return `${pad(m)}:${pad(sec)}`;
}

/**
 * Format pace (menit per km) dari kecepatan km/jam.
 * Mengembalikan "--:--" jika kecepatan 0 / tidak valid.
 */
export function formatPace(speedKmh: number): string {
  if (!isFinite(speedKmh) || speedKmh <= 0.1) return "--:--";

  const paceMinPerKm = 60 / speedKmh;
  const min = Math.floor(paceMinPerKm);
  const sec = Math.round((paceMinPerKm - min) * 60);

  // handle pembulatan 60 detik
  const finalMin = sec === 60 ? min + 1 : min;
  const finalSec = sec === 60 ? 0 : sec;

  return `${finalMin}:${finalSec.toString().padStart(2, "0")}`;
}

/**
 * Format jarak meter ke km dengan 2 desimal.
 */
export function formatDistance(meters: number): string {
  return (meters / 1000).toFixed(2);
}

/**
 * Format kecepatan km/jam dengan 1 desimal.
 */
export function formatSpeed(speedKmh: number): string {
  if (!isFinite(speedKmh) || speedKmh < 0) return "0.0";
  return speedKmh.toFixed(1);
}