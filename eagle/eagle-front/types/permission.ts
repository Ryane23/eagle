export type Permission = "none" | "read" | "write" | "admin";

export type ModulePermissions = {
  module: string;
  submodules: {
    name: string;
    permissions: Record<string, Permission>;
  }[];
};

export type PermissionAnomaly = {
  id: number;
  type: "warning" | "info" | "error";
  message: string;
  suggestion: string;
};

export type PermissionRequest = {
  id: number;
  user: string;
  currentRole: string;
  requestedPermission: string;
  date: string;
};

