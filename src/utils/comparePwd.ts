export default function comparePasswords(password: string, dbPassword: string) {
  if (password !== dbPassword) {
    const isMatch = false;
    return isMatch;
  }
  if (password === dbPassword) {
    const isMatch = true;
    return isMatch;
  }
}
