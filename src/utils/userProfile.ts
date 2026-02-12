import type { User } from '@prisma/client';

function splitLegacyName(name?: string | null): { firstName: string; lastName: string } {
  if (!name) {
    return { firstName: '', lastName: '' };
  }

  const [first = '', ...rest] = name.trim().split(/\s+/);
  return {
    firstName: first,
    lastName: rest.join(' '),
  };
}

function hasAddress(user: User): boolean {
  return Boolean(
    user.addressStreet ||
      user.addressCity ||
      user.addressState ||
      user.addressCountry ||
      user.addressPostalCode
  );
}

export function toUserProfile(user: User) {
  const legacyName = splitLegacyName(user.name);
  const firstName = user.firstName ?? legacyName.firstName;
  const lastName = user.lastName ?? legacyName.lastName;
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    id: user.id,
    email: user.email,
    firstName,
    lastName,
    fullName,
    avatar: user.avatar ?? undefined,
    phone: user.phone ?? undefined,
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : undefined,
    gender: user.gender ?? undefined,
    address: hasAddress(user)
      ? {
          street: user.addressStreet ?? undefined,
          city: user.addressCity ?? undefined,
          state: user.addressState ?? undefined,
          country: user.addressCountry ?? undefined,
          postalCode: user.addressPostalCode ?? undefined,
        }
      : undefined,
    preferences: {
      language: user.preferencesLanguage,
      theme: user.preferencesTheme as 'light' | 'dark' | 'system',
      notifications: user.preferencesNotifications,
    },
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    deviceId: user.deviceId ?? undefined,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
