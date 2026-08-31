/**
 * Phone number validation utilities for Promise Tracker.
 */

/**
 * Returns true if the value is a valid US phone number: after stripping
 * all non-digit characters it must be exactly 10 digits, or 11 digits
 * starting with 1. Anything else (too short, too long, letters only,
 * whitespace only) is invalid.
 */
export function isValidUSPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
}
