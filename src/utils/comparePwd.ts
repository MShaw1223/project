export async function comparePasswords(password: string, dbPassword: string) {
  let isMatch;
  if (password !== dbPassword) {
    isMatch = false;
  }
  if (password === dbPassword) {
    isMatch = true;
  }
  return isMatch;
}
