import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Derive a 32-byte key from environment secret or default fallback
const SECRET_KEY = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY || 'crown-saas-secure-token-vault-key-2026').digest();

export function encryptToken(text: string): string {
  if (!text) return text;
  if (text.startsWith('enc:')) return text; // already encrypted
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `enc:${iv.toString('hex')}:${encrypted}`;
}

export function decryptToken(encryptedText: string): string {
  if (!encryptedText || !encryptedText.startsWith('enc:')) {
    return encryptedText; // plaintext or empty
  }
  
  try {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error('Failed to decrypt token:', err);
    return encryptedText;
  }
}
