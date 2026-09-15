import 'server-only';

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// ─── Key Derivation ──────────────────────────────────
// Uses SESSION_SECRET (or a dedicated ENCRYPTION_KEY if set) as the AES key.
// We take the first 32 bytes of the base64-decoded secret for AES-256.

function getEncryptionKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY || process.env.SESSION_SECRET;
  if (!raw) {
    throw new Error('ENCRYPTION_KEY or SESSION_SECRET must be set for encryption');
  }

  // If it looks like base64, decode it; otherwise hash it to get 32 bytes
  try {
    const decoded = Buffer.from(raw, 'base64');
    if (decoded.length >= 32) {
      return decoded.subarray(0, 32);
    }
  } catch {
    // Not valid base64, fall through
  }

  // Fallback: use raw bytes padded/truncated to 32
  const buf = Buffer.alloc(32, 0);
  Buffer.from(raw, 'utf-8').copy(buf);
  return buf;
}

// ─── Encrypt ─────────────────────────────────────────

export function encryptValue(plaintext: string): { encrypted: string; iv: string } {
  const key = getEncryptionKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encrypted: encrypted + ':' + authTag,
    iv: iv.toString('hex'),
  };
}

// ─── Decrypt ─────────────────────────────────────────

export function decryptValue(encrypted: string, iv: string): string {
  const key = getEncryptionKey();
  const [data, authTag] = encrypted.split(':');

  if (!data || !authTag) {
    throw new Error('Invalid encrypted value format');
  }

  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
