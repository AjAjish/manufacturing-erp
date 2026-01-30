import { format, formatDistance, parseISO } from 'date-fns';

// Format date
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '-';
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return format(parsed, formatStr);
  } catch {
    return date;
  }
};

// Format date time
export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

// Format relative time
export const formatRelativeTime = (date) => {
  if (!date) return '-';
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(parsed, new Date(), { addSuffix: true });
  } catch {
    return date;
  }
};

// Format currency
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format number
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('en-IN').format(num);
};

// Format percentage
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-';
  return `${Number(value).toFixed(decimals)}%`;
};

// Truncate text
export const truncate = (str, length = 50) => {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Check if object is empty
export const isEmpty = (obj) => {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Download file from URL
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};