/**
 * Input Sanitization & Validation Utilities
 * Prevents security vulnerabilities like XSS, SQL injection
 */

/**
 * Sanitize string input - removes dangerous characters and trims whitespace
 * @param input Raw user input string
 * @param maxLength Maximum allowed length
 * @returns Sanitized string
 */
export function sanitizeString(input: string, maxLength: number = 255): string {
  if (!input) return '';

  // Trim whitespace
  let sanitized = input.trim();

  // Remove HTML/script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/[<>]/g, '');

  // Remove SQL keywords in suspicious patterns
  sanitized = sanitized.replace(/('|(\")|(--)|(;)|(\/\*))/g, '');

  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim();
  }

  return sanitized;
}

/**
 * Validate and sanitize phone number
 * @param phone Raw phone input
 * @returns Sanitized phone number or throws error
 */
export function sanitizePhone(phone: string): string {
  const sanitized = sanitizeString(phone, 20);

  if (!sanitized) {
    throw new Error('Phone number is required');
  }

  // Allow only digits, +, -, spaces, ()
  if (!/^[\d+\-\s()]*$/.test(sanitized)) {
    throw new Error('Phone number contains invalid characters');
  }

  // Extract only digits to check minimum length
  const digitsOnly = sanitized.replace(/\D/g, '');
  if (digitsOnly.length < 10) {
    throw new Error('Phone number must have at least 10 digits');
  }

  if (digitsOnly.length > 15) {
    throw new Error('Phone number is too long');
  }

  return sanitized;
}

/**
 * Validate and sanitize name
 * @param name Raw name input
 * @returns Sanitized name or throws error
 */
export function sanitizeName(name: string): string {
  const sanitized = sanitizeString(name, 100);

  if (!sanitized) {
    throw new Error('Name is required');
  }

  if (sanitized.length < 2) {
    throw new Error('Name must be at least 2 characters');
  }

  // Allow letters, spaces, hyphens, apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(sanitized)) {
    throw new Error('Name contains invalid characters');
  }

  return sanitized;
}

/**
 * Validate and sanitize address
 * @param address Raw address input
 * @returns Sanitized address or throws error
 */
export function sanitizeAddress(address: string): string {
  const sanitized = sanitizeString(address, 500);

  if (!sanitized) {
    throw new Error('Address is required');
  }

  if (sanitized.length < 5) {
    throw new Error('Address must be at least 5 characters');
  }

  return sanitized;
}

/**
 * Validate and sanitize generic text field
 * @param text Raw text input
 * @param fieldName Name of field (for error messages)
 * @param minLength Minimum allowed length
 * @param maxLength Maximum allowed length
 * @returns Sanitized text or throws error
 */
export function sanitizeText(
  text: string,
  fieldName: string = 'Text',
  minLength: number = 0,
  maxLength: number = 1000
): string {
  const sanitized = sanitizeString(text, maxLength);

  if (minLength > 0 && sanitized.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters`);
  }

  if (sanitized.length > maxLength) {
    throw new Error(`${fieldName} must not exceed ${maxLength} characters`);
  }

  return sanitized;
}

/**
 * Validate email format (basic)
 * @param email Raw email input
 * @returns Sanitized email or throws error
 */
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeString(email, 255);

  if (!sanitized) {
    throw new Error('Email is required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }

  return sanitized;
}

/**
 * Batch validate form fields
 * @param formData Object with form fields
 * @returns Sanitized form data or throws error
 */
export function validateFormFields(formData: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(formData)) {
    if (typeof value !== 'string') {
      throw new Error(`Invalid field: ${key}`);
    }
    sanitized[key] = sanitizeString(value);
  }

  return sanitized;
}
