export type UserRole =
  | "EXECUTIVE"
  | "COMMERCIAL"
  | "LEGAL"
  | "MARKETING"
  | "OPERATIONS"
  | "ADMIN";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  title: string | null;
  department: string | null;
  is_active: boolean;
};
