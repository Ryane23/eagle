export type UserStatus = "active" | "inactive" | "suspended";

export type UserRole = 
  | "secondary_secretary" 
  | "primary_secretary" 
  | "nurse"
  | "superior_nurse"
  | "doctor" 
  | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  center: string;
  status: UserStatus;
  lastLogin: string;
  createdAt: string;
};

export type SessionUser = {
  name: string;
  email: string;
  role: UserRole;
  center?: string;
};

