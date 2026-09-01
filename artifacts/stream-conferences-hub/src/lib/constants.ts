export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:7867/api';
export const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || API_BASE.replace(/\/api$/, '');

export const MONTHS_ABBREV = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];
