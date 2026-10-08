const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "MANAGER"] as const;

type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(role: string | null | undefined): role is AdminRole {
  return ADMIN_ROLES.includes(role as AdminRole);
}