/**
 * Formatting Utilities
 * Helper functions for formatting dates, addresses, and text
 */

import { format, formatDistance, parseISO } from 'date-fns';

/**
 * Format a full date string
 */
export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

/**
 * Format a date with time
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  } catch {
    return dateString;
  }
}

/**
 * Format as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return formatDistance(date, new Date(), { addSuffix: true });
  } catch {
    return dateString;
  }
}

/**
 * Truncate Sui address for display
 * e.g., "0x1234...5678"
 */
export function formatAddress(address: string, prefixLength = 6, suffixLength = 4): string {
  if (!address) return '';
  if (address.length <= prefixLength + suffixLength) return address;
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * Truncate long text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Convert enum to readable label
 */
export function formatEnumLabel(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format due date from milliseconds timestamp
 * e.g., "Jan 15, 2024"
 */
export function formatDueDate(timestampMs: string | number): string {
  try {
    const ms = typeof timestampMs === 'string' ? parseInt(timestampMs) : timestampMs;
    if (!ms || ms === 0) return 'No due date';
    const date = new Date(ms);
    return format(date, 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
}

/**
 * Check if due date is overdue
 */
export function isDueDateOverdue(timestampMs: string | number): boolean {
  try {
    const ms = typeof timestampMs === 'string' ? parseInt(timestampMs) : timestampMs;
    if (!ms || ms === 0) return false;
    return new Date(ms) < new Date();
  } catch {
    return false;
  }
}
