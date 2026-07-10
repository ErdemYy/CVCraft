export function nanoid(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}
