import type { UserRole } from "@/types/database";

export function isReadOnlyRole(role: string): boolean {
  return role === "EXECUTIVE";
}

export function canManageUsers(role: string | null | undefined): boolean {
  return role === "ADMIN";
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  COMMERCIAL: "Commercial",
  EXECUTIVE: "Executive",
  LEGAL: "Legal",
  MARKETING: "Marketing",
  OPERATIONS: "Operations",
};

export function roleLabel(role: string | null | undefined): string {
  if (!role) return "—";
  return ROLE_LABELS[role as UserRole] ?? role;
}

// Roles that currently have working access policies and can be assigned in the
// team management UI. Specialist roles (LEGAL/MARKETING/OPERATIONS) remain in
// the enum but are reserved until per-role policies are built.
export const ASSIGNABLE_ROLES: { value: UserRole; label: string; description: string }[] = [
  {
    value: "COMMERCIAL",
    label: "Commercial",
    description: "Creates and owns deals, partnerships, documents and tasks.",
  },
  {
    value: "EXECUTIVE",
    label: "Executive",
    description: "Read-only visibility across all records and dashboards.",
  },
  {
    value: "ADMIN",
    label: "Admin",
    description: "Full access plus user and team management.",
  },
];
