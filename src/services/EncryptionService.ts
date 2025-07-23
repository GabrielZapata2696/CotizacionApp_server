import * as CryptoJS from 'crypto-js';
import { config } from '../config';

export class EncryptionService {
  private readonly semilla: string = config.encryption.seed;

  /**
   * Encrypt text using the same method as frontend
   * Matches frontend seguridad.service.ts cifrar() method
   */
  cifrar(valorACifrar: string): string {
    return CryptoJS.AES.encrypt(valorACifrar, this.semilla.trim()).toString();
  }

  /**
   * Decrypt text using the same method as frontend
   * Matches frontend seguridad.service.ts descifrar() method
   */
  descifrar(textoADescifrar: string): string {
    return CryptoJS.AES.decrypt(textoADescifrar, this.semilla.trim()).toString(CryptoJS.enc.Utf8);
  }

  /**
   * Generate random password matching frontend logic
   * From tab1.page.ts generarPassword() method
   */
  generarPassword(tamano: number, seed: string): string {
    let text = "";
    for (let i = 0; i < tamano; i++) {
      text += seed.charAt(Math.floor(Math.random() * seed.length));
    }
    return text;
  }

  /**
   * Generate default password for new users (matching frontend)
   */
  generarPasswordDefault(): string {
    const seed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    return this.generarPassword(10, seed);
  }
}
