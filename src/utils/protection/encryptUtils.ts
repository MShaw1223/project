import crypto from 'crypto';
// this is the async version of the hashPassword function in crypto this should work
// better as its acc built into node and is async
export function hashPassword(password: string) {
  return new Promise<{ salt: string, hash: string }>((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(password, salt, 1000, 64, `sha512`, (err, derivedKey) => {
      if (err) reject(err);
      resolve({ salt, hash: derivedKey.toString('hex') });
    });
  });
}
export function comparePasswords(password: string, hashedPassword: string, salt: string) {
    return new Promise<boolean>((resolve, reject) => {
        crypto.pbkdf2(password, salt, 1000, 64, `sha512`, (err, derivedKey) => {
            if (err) reject(err);
            resolve(hashedPassword === derivedKey.toString('hex'));
          });
        });
      }
// Info:
// The `hashPassword` function, when successful, returns an object containing the `salt` used for hashing and the `hash` itself,
// which is the hashed password. If there's an error during the execution (for example, if the `crypto.pbkdf2` function fails),
// it will return a rejected Promise with the error.
// The `comparePasswords` function, when successful, returns a boolean indicating whether the provided password, when hashed with the provided salt,
// matches the provided hashed password. If the passwords match, it returns `true`; otherwise, it returns `false`.
// If there's an error during the execution (for example, if the `crypto.pbkdf2` function fails), it will return a rejected Promise with the error.

// - `hashPassword`:
//   - On success: Returns a Promise resolved with an object `{ salt: string, hash: string }`.
//   - On error: Returns a Promise rejected with the error.
// - `comparePasswords`:
//   - On success: Returns a Promise resolved with a boolean (`true` if the passwords match, `false` otherwise).
//   - On error: Returns a Promise rejected with the error.

      // this is the bcrypt method
      // import bcrypt from "bcryptjs";
      
      // export async function hashPassword(password: string) {
      //   const salt = await bcrypt.genSalt(10);
      //   const hashedPassword = await bcrypt.hash(password, salt);
      //   return hashedPassword;
      // }
      
      // export async function comparePasswords(
      //   password: string,
      //   hashedPassword: string
      // ) {
      //   const isMatch = await bcrypt.compare(password, hashedPassword);
      //   return isMatch;
      // }
