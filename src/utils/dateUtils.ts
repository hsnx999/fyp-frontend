/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Formats a date to DD-MM-YYYY format
 */
export const formatDateToDDMMYYYY = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}-${month}-${year}`;
};

/**
 * Converts DD-MM-YYYY format to ISO date string for database storage
 */
export const convertDDMMYYYYToISO = (dateString: string): string => {
  if (!dateString) return '';
  
  const parts = dateString.split('-');
  if (parts.length !== 3) return '';
  
  const [day, month, year] = parts;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  if (isNaN(date.getTime())) return '';
  
  return date.toISOString().split('T')[0];
};

/**
 * Converts ISO date string to DD-MM-YYYY format for display
 */
export const convertISOToDDMMYYYY = (isoString: string): string => {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  return formatDateToDDMMYYYY(date);
};

/**
 * Validates DD-MM-YYYY date format
 */
export const isValidDDMMYYYYFormat = (dateString: string): boolean => {
  const regex = /^\d{2}-\d{2}-\d{4}$/;
  if (!regex.test(dateString)) return false;
  
  const parts = dateString.split('-');
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const year = parseInt(parts[2]);
  
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > new Date().getFullYear() + 100) return false;
  
  // Check if the date is valid
  const date = new Date(year, month - 1, day);
  return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
};

/**
 * Gets current date in DD-MM-YYYY format
 */
export const getCurrentDateDDMMYYYY = (): string => {
  return formatDateToDDMMYYYY(new Date());
};