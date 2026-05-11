import { DEFAULT_ACCOUNT_TYPE } from '../account-types.js';

export function toPublicUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl || null,
    role: user.role,
    accountType: user.accountType || DEFAULT_ACCOUNT_TYPE,
    status: user.status,
    profile: user.profile || user.studentProfile || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
