import { prisma } from '../config/database.js';
import { config } from '../config/index.js';
import { AppError } from '../utils/AppError.js';
import type { RegistrationInput, LoginInput, RefreshTokenInput } from '../validators/auth.validator.js';
import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { toUserProfile } from '../utils/userProfile.js';
import { generateSecureToken, hashToken } from '../utils/token.js';
import { emailService } from './email.service.js';

interface TokenPayload {
  userId: string;
  email: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export class AuthService {
  private getTokenMetadata() {
    return {
      expiresIn: 3600,
      tokenType: 'Bearer' as const,
    };
  }

  private getUserNames(data: RegistrationInput) {
    if (data.firstName) {
      return {
        firstName: data.firstName.trim(),
        lastName: data.lastName?.trim() || '',
      };
    }

    const [first = '', ...rest] = (data.name ?? '').trim().split(/\s+/);
    return {
      firstName: first,
      lastName: rest.join(' '),
    };
  }

  private generateTokens(userId: string, email: string): AuthTokens {
    const payload: TokenPayload = { userId, email };

    const accessTokenOptions: SignOptions = {
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    };

    const refreshTokenOptions: SignOptions = {
      expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, accessTokenOptions);
    const refreshToken = jwt.sign(payload, config.jwt.secret, refreshTokenOptions);
    const metadata = this.getTokenMetadata();

    return {
      accessToken,
      refreshToken,
      expiresIn: metadata.expiresIn,
      tokenType: metadata.tokenType,
    };
  }

  async register(data: RegistrationInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw AppError.conflict('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const { firstName, lastName } = this.getUserNames(data);
    const name = `${firstName} ${lastName}`.trim();

    // Generate email verification token
    const verificationToken = generateSecureToken();
    const hashedVerificationToken = hashToken(verificationToken);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await prisma.user.create({
      data: {
        name: name || null,
        firstName: firstName || null,
        lastName: lastName || null,
        email: data.email,
        phone: data.phone,
        deviceId: data.deviceId,
        password: hashedPassword,
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    const tokens = this.generateTokens(user.id, user.email);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    // Send verification email (don't await to avoid blocking response)
    emailService.sendVerificationEmail(user.email, verificationToken).catch((err) => {
      console.error('Failed to send verification email:', err);
    });

    return {
      user: toUserProfile(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      tokenType: tokens.tokenType,
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const tokens = this.generateTokens(user.id, user.email);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: tokens.refreshToken,
        deviceId: data.deviceId ?? user.deviceId,
      },
    });

    return {
      user: toUserProfile(updatedUser),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      tokenType: tokens.tokenType,
    };
  }

  async refreshToken(data: RefreshTokenInput) {
    try {
      const decoded = jwt.verify(data.refreshToken, config.jwt.secret) as TokenPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.refreshToken !== data.refreshToken) {
        throw AppError.unauthorized('Invalid refresh token');
      }

      const tokens = this.generateTokens(user.id, user.email);

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_in: tokens.expiresIn,
        token_type: tokens.tokenType,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        tokenType: tokens.tokenType,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.unauthorized('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async sendVerificationEmail(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    if (user.emailVerified) {
      throw AppError.badRequest('Email is already verified');
    }

    const token = generateSecureToken();
    const hashedToken = hashToken(token);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: expires,
      },
    });

    await emailService.sendVerificationEmail(user.email, token);

    return { message: 'Verification email sent' };
  }

  async verifyEmail(token: string) {
    const hashedToken = hashToken(token);

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw AppError.badRequest('Invalid or expired verification token');
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    // Send welcome email
    const name = updatedUser.firstName || updatedUser.name || 'User';
    await emailService.sendWelcomeEmail(updatedUser.email, name);

    return {
      message: 'Email verified successfully',
      user: toUserProfile(updatedUser),
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If an account exists with this email, a verification link has been sent' };
    }

    if (user.emailVerified) {
      throw AppError.badRequest('Email is already verified');
    }

    const token = generateSecureToken();
    const hashedToken = hashToken(token);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: expires,
      },
    });

    await emailService.sendVerificationEmail(user.email, token);

    return { message: 'If an account exists with this email, a verification link has been sent' };
  }
}

export const authService = new AuthService();
