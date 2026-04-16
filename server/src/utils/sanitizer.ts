/**
 * Sanitizes request body fields to ensure Mongoose validation doesn't fail on "empty" values.
 * 
 * Common fixes:
 * 1. Empty strings in Date fields ("") -> null
 * 2. Empty strings in Enum fields ("") -> undefined (lets Mongoose use default or triggers required)
 * 3. Ensuring array fields are actually arrays.
 */
export function sanitizeField(value: any): any {
  if (value === '') return null;
  return value;
}

export function sanitizeEnum(value: any): any {
  if (value === '') return undefined;
  return value;
}

export function sanitizeArray(value: any): any[] {
  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (typeof item === 'object' && item !== null) {
          const sanitizedItem: any = {};
          let hasData = false;
          for (const key in item) {
            const val = item[key];
            if (val !== '' && val !== null && val !== undefined) {
              sanitizedItem[key] = val;
              // If it's a string, ensure it's not just whitespace
              if (typeof val === 'string' && val.trim().length > 0) hasData = true;
              else if (typeof val === 'number') hasData = true;
              else if (val instanceof Date) hasData = true;
            } else {
              sanitizedItem[key] = (typeof val === 'number') ? 0 : null;
            }
          }
          return hasData ? sanitizedItem : null;
        }
        return item === '' ? null : item;
      })
      .filter(item => item !== null);
  }
  return [];
}

/**
 * Normalizes common shooting/event form fields.
 */
export function sanitizeCommonBody(body: any, dateFields: string[] = [], enumFields: string[] = [], arrayFields: string[] = []): void {
  // Handle Dates
  dateFields.forEach(field => {
    if (body[field] === '') body[field] = null;
  });

  // Handle Enums
  enumFields.forEach(field => {
    if (body[field] === '') body[field] = undefined;
  });

  // Handle Arrays (Extras, Payments, etc.)
  arrayFields.forEach(field => {
    body[field] = sanitizeArray(body[field]);
  });
}
