export type UrgencyLevel = {
  level: number;
  name: string;
  color: string;
  maxWait: number;
  notification: boolean;
};

export type ConfigHistoryEntry = {
  id: number;
  date: string;
  user: string;
  changes: string;
};

