/**
 * Encodes a 192.168.x.y LAN IP into a 4-letter room code (A-Z).
 * Returns null for non-192.168 addresses.
 */
export function ipToRoomCode(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts[0] !== 192 || parts[1] !== 168) return null;
  if (parts.some((p) => isNaN(p) || p < 0 || p > 255)) return null;

  let value = parts[2] * 256 + parts[3];
  const chars = [];
  for (let i = 0; i < 4; i++) {
    chars.unshift(String.fromCharCode(65 + (value % 26)));
    value = Math.floor(value / 26);
  }
  return chars.join('');
}

/**
 * Decodes a 4-letter room code back to a 192.168.x.y IP.
 * Returns null if the code is invalid.
 */
export function roomCodeToIP(code) {
  if (!isValidRoomCode(code)) return null;

  const upper = code.toUpperCase();
  let value = 0;
  for (let i = 0; i < 4; i++) {
    value = value * 26 + (upper.charCodeAt(i) - 65);
  }

  if (value > 65535) return null;

  const x = Math.floor(value / 256);
  const y = value % 256;
  return `192.168.${x}.${y}`;
}

/**
 * Validates that a string is a valid 4-letter room code.
 */
export function isValidRoomCode(str) {
  if (!str || typeof str !== 'string') return false;
  return /^[A-Za-z]{4}$/.test(str.trim());
}
