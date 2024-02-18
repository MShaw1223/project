export default function comparePasswords(password: string, dbPassword: string) {
  let isMatch: boolean;
  if (password !== dbPassword) {
    isMatch = false;
  } else {
    isMatch = true;
  }
  return isMatch;
}
