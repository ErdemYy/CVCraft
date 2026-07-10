export type UserRole = "admin" | "user";

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  displayName: string;
}

const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
const adminDisplayName = process.env.ADMIN_DISPLAY_NAME || "Admin";
const userUsername = process.env.USER_USERNAME || "asrın";
const userAlias = process.env.USER_ALIAS || "asrin";
const userPassword = process.env.USER_PASSWORD || "asrin123";
const userDisplayName = process.env.USER_DISPLAY_NAME || "Asrın";
const localLegacyUserPasswords = userUsername === "asrın" && userPassword === "asrin123"
  ? ["asrın123"]
  : [];

const USERS: AuthUser[] = [
  { id: "1", username: adminUsername, role: "admin", displayName: adminDisplayName },
  { id: "2", username: userUsername, role: "user", displayName: userDisplayName },
];

const CREDENTIALS: Record<string, string[]> = {
  [adminUsername]: [adminPassword],
  [userUsername]: [userPassword, ...localLegacyUserPasswords],
  [userAlias]: [userPassword],
};

export function authenticate(username: string, password: string): AuthUser | null {
  const expected = CREDENTIALS[username];
  if (!expected?.includes(password)) return null;
  const normalizedUsername = username === userAlias ? userUsername : username;
  return USERS.find((u) => u.username === normalizedUsername) ?? null;
}

export function getUserById(id: string): AuthUser | null {
  return USERS.find((u) => u.id === id) ?? null;
}
