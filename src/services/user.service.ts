import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import type {
  CreateUserInput,
  UpdateUserInput,
  UpdateProfileInput,
  ChangePasswordInput,
  DeleteAccountInput,
  ListUsersQuery,
} from '../validators/user.validator.js';
import bcrypt from 'bcrypt';
import { toUserProfile } from '../utils/userProfile.js';

function getNameParts(name?: string | null) {
  if (!name) {
    return {
      firstName: '',
      lastName: '',
    };
  }

  const [first = '', ...rest] = name.trim().split(/\s+/);
  return {
    firstName: first,
    lastName: rest.join(' '),
  };
}

export class UserService {
  async create(data: CreateUserInput) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw AppError.conflict('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const fromName = getNameParts(data.name);
    const firstName = data.firstName ?? fromName.firstName;
    const lastName = data.lastName ?? fromName.lastName;
    const fullName = `${firstName} ${lastName}`.trim();

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: fullName || data.name || null,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: data.phone,
        deviceId: data.deviceId,
        password: hashedPassword,
      },
    });

    return toUserProfile(user);
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    return toUserProfile(user);
  }

  async findAll(query: ListUsersQuery) {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users.map(toUserProfile),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: UpdateUserInput) {
    await this.findById(id); // Throws if not found

    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
      });

      if (existing) {
        throw AppError.conflict('Email already in use');
      }
    }

    const fromName = getNameParts(data.name);
    const firstName = data.firstName ?? fromName.firstName ?? undefined;
    const lastName = data.lastName ?? fromName.lastName ?? undefined;
    const fullName = data.name ?? (firstName || lastName ? `${firstName ?? ''} ${lastName ?? ''}`.trim() : undefined);

    const user = await prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        name: fullName,
        firstName,
        lastName,
        phone: data.phone,
        deviceId: data.deviceId,
      },
    });

    return toUserProfile(user);
  }

  async delete(id: string) {
    await this.findById(id); // Throws if not found
    return prisma.user.delete({ where: { id } });
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    return toUserProfile(user);
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw AppError.notFound('User not found');
    }

    const firstName = data.firstName ?? currentUser.firstName ?? undefined;
    const lastName = data.lastName ?? currentUser.lastName ?? undefined;
    const nextName =
      firstName || lastName
        ? `${firstName ?? ''} ${lastName ?? ''}`.trim()
        : currentUser.name;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: nextName || null,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        avatar: data.avatar,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        gender: data.gender,
        deviceId: data.deviceId,
        addressStreet: data.address?.street,
        addressCity: data.address?.city,
        addressState: data.address?.state,
        addressCountry: data.address?.country,
        addressPostalCode: data.address?.postalCode,
        preferencesLanguage: data.preferences?.language,
        preferencesTheme: data.preferences?.theme,
        preferencesNotifications: data.preferences?.notifications,
      },
    });

    return toUserProfile(user);
  }

  async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw AppError.unauthorized('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async deleteAccount(userId: string, data: DeleteAccountInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Password is incorrect');
    }

    await prisma.user.delete({
      where: { id: userId },
    });
  }
}

export const userService = new UserService();
