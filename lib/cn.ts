/**
 * Merges class strings, filtering falsy values.
 * Keeps the bundle zero-dependency — does not resolve Tailwind conflicts.
 * For conflict-free class composition, control specificity at the call site.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
