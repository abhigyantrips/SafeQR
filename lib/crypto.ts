import CryptoJS from 'crypto-js';

export function encryptData(content: string, passkey: string): string {
  return CryptoJS.AES.encrypt(content, passkey).toString();
}

export function decryptData(ciphertext: string, passkey: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, passkey);
  return bytes.toString(CryptoJS.enc.Utf8);
}
