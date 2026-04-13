/**
 * Utility functions for date and time formatting
 */

/**
 * Formats an hour string (e.g., "9 AM") into a range (e.g., "09:00 - 10:00")
 */
export const formatTimeRange = (hourStr: string) => {
  const parts = hourStr.split(' ');
  const val = parts[0];
  const period = parts[1];
  let hour = parseInt(val);
  
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  
  const start = hour.toString().padStart(2, '0') + ':00';
  const end = (hour + 1 === 24 ? 0 : hour + 1).toString().padStart(2, '0') + ':00';
  return `${start} - ${end}`;
};

/**
 * Formats an ISO string into HH:mm format
 */
export const formatLocalTime = (isoStr?: string) => {
  if (!isoStr) return '--:--';
  const date = new Date(isoStr);
  return date.getUTCHours().toString().padStart(2, '0') + ':' + 
         date.getUTCMinutes().toString().padStart(2, '0');
};

/**
 * Extracts a label like "9 AM" from an ISO string
 */
export const getHourLabel = (dateStr?: string) => {
  if (!dateStr) return '9 AM'; 
  const date = new Date(dateStr);
  let hours = date.getUTCHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  return `${hours} ${ampm}`;
};
