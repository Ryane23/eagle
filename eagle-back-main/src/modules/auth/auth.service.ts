import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { FirebaseService } from '../../config/firebase';
import {
  User,
  UserCollection,
} from '../users/entities/user.entity';
import {
  AuthToken,
  AuthTokenCollection,
} from './entities/auth-token.entity';
import { LoginDto, RegisterDto, RefreshTokenDto, AuthResponseDto } from './dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { UpdateProfileDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private firebaseService: FirebaseService,
  ) {}

  /**
   * Register a new user (Admin only)
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, ...userData } = registerDto;

    // Check if user already exists in Firestore
    const existingUser = await this.firebaseService
      .collection(UserCollection)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const auth = this.firebaseService.getAuth();

    let createdUid: string | undefined;

    try {
      // 1) Create Firebase Authentication user
      const authUser = await auth.createUser({
        email,
        password,
        displayName: userData.name,
        disabled: false,
      });

      createdUid = authUser.uid;

      // 2) Create Firestore user doc using the SAME uid
      const userRef = this.firebaseService.collection(UserCollection).doc(createdUid);
      const now = new Date();

      const newUser: User = {
        id: createdUid,
        email,
        password: hashedPassword, // keep because your login uses bcrypt+Firestore today
        ...userData,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      await userRef.set(newUser);

      // 3) Return tokens like before
      return this.generateTokens(newUser);
    } catch (error: any) {
      // Roll back Auth user if Firestore write fails
      if (createdUid) {
        await auth.deleteUser(createdUid).catch(() => undefined);
      }

      if (error?.code === 'auth/email-already-exists') {
        throw new ConflictException('User with this email already exists');
      }
      if (typeof error?.code === 'string' && error.code.startsWith('auth/')) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const userSnapshot = await this.firebaseService
      .collection(UserCollection)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userDoc = userSnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() } as User;

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    return this.generateTokens(user);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    const { refreshToken } = refreshTokenDto;

    // Find refresh token in database
    const tokenSnapshot = await this.firebaseService
      .collection(AuthTokenCollection)
      .where('refreshToken', '==', refreshToken)
      .where('isRevoked', '==', false)
      .limit(1)
      .get();

    if (tokenSnapshot.empty) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenDoc = tokenSnapshot.docs[0];
    const authToken = { id: tokenDoc.id, ...tokenDoc.data() } as AuthToken;

    // Check if token is expired
    if (new Date() > authToken.expiresAt) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Get user
    const userDoc = await this.firebaseService
      .collection(UserCollection)
      .doc(authToken.userId)
      .get();

    if (!userDoc.exists) {
      throw new NotFoundException('User not found');
    }

    const user = { id: userDoc.id, ...userDoc.data() } as User;

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    // Revoke old refresh token
    await tokenDoc.ref.update({ isRevoked: true });

    // Generate new tokens
    return this.generateTokens(user);
  }

  /**
   * Logout user (revoke refresh token)
   */
  async logout(refreshToken: string): Promise<{ message: string }> {
    const tokenSnapshot = await this.firebaseService
      .collection(AuthTokenCollection)
      .where('refreshToken', '==', refreshToken)
      .limit(1)
      .get();

    if (!tokenSnapshot.empty) {
      await tokenSnapshot.docs[0].ref.update({ isRevoked: true });
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Generate JWT access token and refresh token
   */
  private async generateTokens(user: User): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Generate access token
    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token (longer expiration)
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
    });

    // Store refresh token in database
    const tokenRef = this.firebaseService.collection(AuthTokenCollection).doc();
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + 7 * 24 * 60 * 60 * 1000, // 7 days
    );

    const authToken: AuthToken = {
      id: tokenRef.id,
      userId: user.id,
      refreshToken,
      expiresAt,
      isRevoked: false,
      createdAt: now,
      updatedAt: now,
    };

    await tokenRef.set(authToken);

    // Remove password from user object
    const { password, ...userWithoutPassword } = user;

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
      expiresIn: 3600, // 1 hour in seconds
    };
  }

  /**
   * Validate user (used by JWT strategy)
   */
  async validateUser(userId: string): Promise<User | null> {
    const userDoc = await this.firebaseService
      .collection(UserCollection)
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      return null;
    }

    const user = { id: userDoc.id, ...userDoc.data() } as User;
    return user.isActive ? user : null;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Omit<User, 'password'>> {
    const updates: Partial<User> = {};

    if (updateProfileDto.name !== undefined) updates.name = updateProfileDto.name;
    if (updateProfileDto.phone !== undefined) updates.phone = updateProfileDto.phone;

    if (Object.keys(updates).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    updates.updatedAt = new Date();

    const userRef = this.firebaseService.collection(UserCollection).doc(userId);
    const existing = await userRef.get();

    if (!existing.exists) {
      throw new NotFoundException('User not found');
    }

    await userRef.update(updates);

    const updatedDoc = await userRef.get();
    const updatedUser = { id: updatedDoc.id, ...updatedDoc.data() } as User;

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}
