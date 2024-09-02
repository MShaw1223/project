export function encoder(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i); // converts to unicode
    hash = (hash << 5) - hash + char; //left shift the hash 5 places then - hash + unicode of username
    hash &= hash; // bitwise and to ensure the code remains 32 bit
  }
  return hash.toString(16); //converts to a hexadecimal string
}
