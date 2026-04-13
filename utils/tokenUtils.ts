import { Buffer } from 'buffer';

/**
 * Utility to parse JWT token and extract user information
 */
export const TokenUtils = {
  /**
   * Decode JWT token and return the payload
   */
  decode(token: string) {
    try {
      if (!token) return null;
      const payloadStr = token.split('.')[1];
      if (!payloadStr) return null;
      return JSON.parse(Buffer.from(payloadStr, 'base64').toString('utf8'));
    } catch (e) {
      console.error('TokenUtils: Failed to decode token', e);
      return null;
    }
  },

  /**
   * Extract User ID from JWT token
   */
  getUserId(token: string): string | null {
    const payload = this.decode(token);
    if (!payload) return null;
    return payload.id || payload.sub || null;
  }
};
