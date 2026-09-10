import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { SERVER_ORIGIN, ROOT_DOMAIN } from './constants';
import { Conference, Webinar } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const mediaUrl = (u: string): string =>
  !u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`;

// Compress an image file client-side so it stays under `maxSizeBytes` (default 2MB).
// Non-image files are returned unchanged. Uses Canvas to downscale + re-encode.
export const compressImage = async (
  file: File,
  maxSizeBytes: number = 2 * 1024 * 1024,
): Promise<File> => {
  if (!file.type.startsWith('image/')) return file;
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
  if (file.size <= maxSizeBytes) return file;

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = dataUrl;
  });

  let width = img.naturalWidth;
  let height = img.naturalHeight;
  const MAX_DIM = 2048;
  if (width > MAX_DIM || height > MAX_DIM) {
    const scale = Math.min(MAX_DIM / width, MAX_DIM / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, width, height);

  const originalType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  let quality = 0.85;
  let blob: Blob | null = null;

  // Iteratively reduce quality until under target size (min quality 0.5).
  while (quality >= 0.5) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, originalType, quality),
    );
    if (blob && blob.size <= maxSizeBytes) break;
    quality -= 0.1;
  }

  if (!blob) return file;

  const ext = originalType === 'image/png' ? 'png' : 'jpg';
  const name = file.name.replace(/\.[^.]+$/, '') || 'image';
  return new File([blob], `${name}.${ext}`, { type: originalType });
};

export const dateToString = (date: Date | undefined): string => {
  if (!date) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const stringToDate = (str: string): Date | undefined => {
  if (!str) return undefined;
  const parts = str.split('-');
  if (parts.length !== 3) return undefined;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);
  return isNaN(d.getTime()) ? undefined : d;
};

export const formatDisplayDate = (str: string): string => {
  if (!str) return 'mm/dd/yyyy';
  const parts = str.split('-');
  if (parts.length !== 3) return 'mm/dd/yyyy';
  return `${parts[1]}/${parts[2]}/${parts[0]}`;
};

export const subdomainUrlFor = (item: Conference | Webinar): string | null => {
  if (!item.subdomain) return null;
  const protocol = ROOT_DOMAIN === 'localhost' ? 'http' : 'https';
  return `${protocol}://${item.subdomain}.${ROOT_DOMAIN}`;
};

export const cohortSubdomainUrlFor = (subdomain: string | null | undefined): string | null => {
  if (!subdomain) return null;
  const protocol = ROOT_DOMAIN === 'localhost' ? 'http' : 'https';
  return `${protocol}://${subdomain}.${ROOT_DOMAIN}`;
};

// Build the public site URL for a specific cohort. Cohorts are path-scoped under
// the parent event's subdomain, e.g. https://event.localhost/2026 and /2026/2.
export const cohortSiteUrlFor = (
  eventSubdomain: string | null | undefined,
  cohort: { year: number; batchNo: number; isCurrent?: boolean },
): string | null => {
  if (!eventSubdomain) return null;
  const protocol = ROOT_DOMAIN === 'localhost' ? 'http' : 'https';
  const base = `${protocol}://${eventSubdomain}.${ROOT_DOMAIN}`;
  if (cohort.isCurrent) return `${base}/${cohort.year}`;
  return `${base}/${cohort.year}/${cohort.batchNo}`;
};

export const registerLinkFor = (item: Conference | Webinar): string =>
  subdomainUrlFor(item) ||
  item.registrationLink ||
  `${window.location.origin}/register?event=${item.eventId || item.slug || item._id}`;

export const parseStartAndEndDates = (
  eventDateStr: string,
  dayRangeStr: string,
): { start: string; end: string } => {
  if (!eventDateStr) return { start: '', end: '' };
  const baseDate = new Date(eventDateStr);
  if (isNaN(baseDate.getTime())) return { start: '', end: '' };

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  let startDay = baseDate.getDate();
  let endDay = startDay;

  if (dayRangeStr) {
    const parts = dayRangeStr.split(/[-–—]/).map((p) => p.trim());
    if (parts.length > 0 && !isNaN(parseInt(parts[0], 10))) {
      startDay = parseInt(parts[0], 10);
    }
    if (parts.length > 1 && !isNaN(parseInt(parts[1], 10))) {
      endDay = parseInt(parts[1], 10);
    } else {
      endDay = startDay;
    }
  }

  const formatLocalISO = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return {
    start: formatLocalISO(new Date(year, month, startDay)),
    end: formatLocalISO(new Date(year, month, endDay)),
  };
};

export const computeDayAndMonth = (
  startDateStr: string,
  endDateStr: string,
): { day: string; month: string } => {
  const monthsAbbrev = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ];
  if (!startDateStr) return { day: '', month: '' };

  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) return { day: '', month: '' };

  const monthName = monthsAbbrev[start.getMonth()];
  const yearSuffix = String(start.getFullYear()).slice(-2);
  const monthVal = `${monthName} ${yearSuffix}`;

  let dayVal = String(start.getDate());
  if (endDateStr && endDateStr !== startDateStr) {
    const end = new Date(endDateStr);
    if (!isNaN(end.getTime())) {
      dayVal = `${start.getDate()}–${end.getDate()}`;
    }
  }

  return { day: dayVal, month: monthVal };
};
