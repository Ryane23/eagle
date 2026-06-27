import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { FirebaseService } from '../../../config/firebase';
import { User, UserCollection } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private firebaseService: FirebaseService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { sub: userId } = payload;

    // Fetch user from Firestore
    const userDoc = await this.firebaseService
      .collection(UserCollection)
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      throw new UnauthorizedException('User not found');
    }

    const user = { id: userDoc.id, ...userDoc.data() } as User;

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    // Remove password from user object before returning
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
}
