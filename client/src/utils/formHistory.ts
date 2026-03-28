const HISTORY_PREFIX = 'form_history_';

/**
 * Saves form data to localStorage for history/autocomplete purposes.
 * @param formId Unique identifier for the form (e.g., 'maternity', 'lead')
 * @param data The form data object to save
 */
export const saveFormHistory = (formId: string, data: any) => {
  try {
    localStorage.setItem(`${HISTORY_PREFIX}${formId}`, JSON.stringify(data));
  } catch (e) {
    console.error(`[FormHistory] Failed to save for ${formId}`, e);
  }
};

/**
 * Retrieves the last saved form data for a given formId.
 * @param formId Unique identifier for the form
 * @returns The saved data object or null
 */
export const getFormHistory = (formId: string) => {
  try {
    const data = localStorage.getItem(`${HISTORY_PREFIX}${formId}`);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error(`[FormHistory] Failed to retrieve for ${formId}`, e);
    return null;
  }
};

/**
 * --- Field Level History (Last 5 unique entries) ---
 */

export const saveFieldHistory = (formId: string, fieldName: string, value: any) => {
  if (value === undefined || value === null || value === "") return;
  const valStr = String(value).trim();
  if (!valStr) return;

  try {
    const key = `field_history_${formId}_${fieldName}`;
    const existing = localStorage.getItem(key);
    let list: string[] = existing ? JSON.parse(existing) : [];

    // Remove if already exists and add to front (most recent)
    list = list.filter((v) => v !== valStr);
    list.unshift(valStr);

    // Keep last 5
    localStorage.setItem(key, JSON.stringify(list.slice(0, 5)));
  } catch (e) {
    console.error(`[FormHistory] Failed to save field history for ${fieldName}`, e);
  }
};

export const getFieldHistory = (formId: string, fieldName: string): string[] => {
  try {
    const data = localStorage.getItem(`field_history_${formId}_${fieldName}`);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};
