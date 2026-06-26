export type SystemMetric = {
  current: number;
  peak: number;
  unit: string;
};

export type SystemMetrics = {
  cpu: SystemMetric;
  memory: SystemMetric;
  disk: SystemMetric;
  bandwidth: SystemMetric;
};

export type ConnectedUser = {
  id: number;
  name: string;
  role: string;
  center: string;
  activity: string;
  since: string;
};

export type ServiceStatus = "ok" | "degraded" | "down";

export type CenterStatus = {
  name: string;
  status: "online" | "degraded" | "offline";
  latency: number;
  load: number;
  services: {
    video: ServiceStatus;
    db: ServiceStatus;
    api: ServiceStatus;
  };
};

export type BackupEntry = {
  id: number;
  type: "Complet" | "Incrémental";
  date: string;
  size: string;
  status: "success" | "failed";
};

export type MaintenanceItem = {
  component: string;
  lastMaintenance: string;
  nextMaintenance: string;
  health: number;
};

