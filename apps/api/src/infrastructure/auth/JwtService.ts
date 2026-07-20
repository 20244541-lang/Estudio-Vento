import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  role: string;
}

export class JwtService {
  private static readonly ACCESS_SECRET = process.env.JWT_SECRET || 'secret';
  private static readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
  private static readonly ACCESS_EXPIRES_IN = '7d';
  private static readonly REFRESH_EXPIRES_IN = '7d';

  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.ACCESS_SECRET, { expiresIn: this.ACCESS_EXPIRES_IN });
  }

  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.REFRESH_SECRET, { expiresIn: this.REFRESH_EXPIRES_IN });
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, this.ACCESS_SECRET) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, this.REFRESH_SECRET) as TokenPayload;
  }
}
