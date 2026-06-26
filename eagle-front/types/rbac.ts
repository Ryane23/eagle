export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  inheritedPermissions: string[];
  userCount: number;
  children?: Role[];
};

export type AuditLogEntry = {
  id: number;
  action: string;
  role: string;
  detail: string;
  user: string;
  date: string;
};

