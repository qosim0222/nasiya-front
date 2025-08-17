export const API = import.meta.env.VITE_API_URL || '';

export function toImgUrl(input?: string) {
  if (!input) return undefined;
  if (input.startsWith('http')) return input;
  const path = input.startsWith('/') ? input : `/${input}`;
  return `${API}${path}`;
}
