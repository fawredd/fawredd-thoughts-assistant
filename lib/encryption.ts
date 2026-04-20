import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

/**
 * Encrypts a string using AES-256-GCM.
 * Returns a string in the format: iv:authTag:encryptedData (all base64)
 */
export function encrypt(text: string): string {
    if (!ENCRYPTION_KEY) {
        // Fallback for development if key is missing, though we should warn
        if (process.env.NODE_ENV === 'production') {
            throw new Error('ENCRYPTION_KEY is required in production');
        }
        return text;
    }

    // Ensure key is 32 bytes
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a string formatted as iv:authTag:encryptedData.
 */
export function decrypt(encryptedText: string): string {
    if (!ENCRYPTION_KEY) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('ENCRYPTION_KEY is required in production');
        }
        return encryptedText;
    }

    if (typeof encryptedText !== 'string') {
        // If it's not a string, it might be old JSON data or null
        return typeof encryptedText === 'object' ? JSON.stringify(encryptedText) : String(encryptedText);
    }

    if (!encryptedText.includes(':')) {
        // Likely not encrypted or old data
        return encryptedText;
    }

    try {
        const [ivHex, authTagHex, encryptedDataHex] = encryptedText.split(':');
        const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedDataHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        return '[Encrypted Content - Decryption Failed]';
    }
}

/**
 * Encrypts an object by converting it to JSON first.
 */
export function encryptJson(obj: unknown): string {
    return encrypt(JSON.stringify(obj));
}

/**
 * Decrypts a string into an object.
 */
export function decryptJson(encryptedText: string): unknown {
    const decrypted = decrypt(encryptedText);
    try {
        return JSON.parse(decrypted);
    } catch {
        return decrypted;
    }
}
