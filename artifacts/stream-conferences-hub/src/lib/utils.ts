import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { SERVER_ORIGIN } from './constants';
import { Conference, Webinar } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const mediaUrl = (u: string): string =>
  !u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`;

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

export const registerLinkFor = (item: Conference | Webinar): string =>
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
