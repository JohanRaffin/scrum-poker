/**
 * Gets the initials from a user name (max 2 characters)
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Validates and sanitizes a user name
 */
export function sanitizeUserName(name: string): string {
  return name.trim().slice(0, 20);
}

/**
 * Checks if a user name is valid
 */
export function isValidUserName(name: string): boolean {
  const sanitized = sanitizeUserName(name);
  return sanitized.length > 0 && sanitized.length <= 20;
}
