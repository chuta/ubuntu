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

// Roles assignable in the team management UI, with a short description of the
// access each grants.
export const ASSIGNABLE_ROLES: { value: UserRole; label: string; description: string }[] = [
  {
    value: "COMMERCIAL",
    label: "Commercial",
    description: "Owns the pipeline — creates deals, partnerships, organizations and documents.",
  },
  {
    value: "LEGAL",
    label: "Legal",
    description: "Sees all records; drafts and edits documents, tasks, notes and activities.",
  },
  {
    value: "OPERATIONS",
    label: "Operations",
    description: "Sees all records; runs tasks, milestones, partnership execution and events.",
  },
  {
    value: "MARKETING",
    label: "Marketing",
    description: "Sees all records; owns events and contributes documents, tasks and notes.",
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
