import jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';

const secret = process.env.JWT_SECRET || '123';

type JWTPayload = {
  userId: string;
  deviceId: string;
  iat: number;
  exp: number;
};

@Injectable()
export class JwtService {
  createJWT(userId: string): string {
    return jwt.sign({ userId }, secret, { expiresIn: '5m' });
  }

  createJWTRefreshToken(userId: string, deviceId: string): string {
    return jwt.sign({ userId, deviceId }, secret, { expiresIn: '10m' });
  }

  verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, secret) as unknown as JWTPayload;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
