import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;
const ENCRYPTION_KEY = process.env.NEXTAUTH_SECRET || 'your-fallback-secret-key-min-32-chars!!';

export function encrypt(text: string): string {
  const iv = randomBytes(IV_LENGTH);
  const salt = randomBytes(SALT_LENGTH);
  
  // Create cipher with key, iv, and algorithm
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  
  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get the auth tag
  const tag = cipher.getAuthTag();
  
  // Combine the IV, salt, encrypted text, and auth tag
  const result = Buffer.concat([
    iv,
    salt,
    Buffer.from(encrypted, 'hex'),
    tag
  ]);
  
  return result.toString('base64');
}

export function decrypt(encryptedText: string): string {
  const buf = Buffer.from(encryptedText, 'base64');
  
  // Extract the IV, salt, encrypted text, and auth tag
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(buf.length - TAG_LENGTH);
  const ciphertext = buf.subarray(
    IV_LENGTH + SALT_LENGTH,
    buf.length - TAG_LENGTH
  );
  
  // Create decipher
  const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  decipher.setAuthTag(tag);
  
  // Decrypt the text
  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString('utf8');
}
