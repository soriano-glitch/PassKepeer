export const DEFAULT_CATEGORIES = [
  'Social Media',
  'Email',
  'Banking',
  'School',
  'Work',
  'Shopping',
  'Wi-Fi',
  'Other',
] as const;

export type DefaultCategory = (typeof DEFAULT_CATEGORIES)[number];

export function isDefaultCategory(name: string): name is DefaultCategory {
  return (DEFAULT_CATEGORIES as readonly string[]).includes(name);
}

export function normalizeCategoryName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  if (trimmed.length === 0 || trimmed.length > 40) {
    throw new Error('Category name must be 1-40 characters.');
  }
  return trimmed;
}
