export type IncidentStatus = "open" | "in_progress" | "resolved" | "escalated";

export type IncidentPriority = "low" | "medium" | "high" | "critical";

export type Incident = {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  assignee: string;
  center: string;
  createdAt: string;
  updatedAt: string;
};

