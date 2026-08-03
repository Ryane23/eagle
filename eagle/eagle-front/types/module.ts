export type ModuleStatus = "active" | "inactive" | "maintenance";

export type Module = {
  id: string;
  name: string;
  description: string;
  version: string;
  status: ModuleStatus;
  lastUpdate: string;
  dependencies: string[];
};

export type Deployment = {
  id: string;
  module: string;
  version: string;
  centers: string[];
  scheduledAt: string;
  status: "scheduled" | "in_progress" | "completed" | "failed";
};

