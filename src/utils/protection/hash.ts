export function generateKey(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i); // converts to unicode
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}
