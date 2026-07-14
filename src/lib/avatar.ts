// Deterministic avatar color + initials from a name, so the same person
// always renders with the same color across the app without storing one.
const PALETTE = [
  "#5b5bf6",
  "#e0645b",
  "#1f9254",
  "#d9932f",
  "#0f9db0",
  "#b34fc9",
];

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
