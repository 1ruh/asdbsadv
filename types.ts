export interface SearchResult {
  id: string;
  database: string;
  identity: string;
  password?: string;
  extraInfo: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export interface ChartData {
  name: string;
  value: number;
}

export enum AppState {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD'
}

export interface User {
  name: string;
  role: string;
  status: 'Active' | 'Scanning' | 'Idle';
}

export interface DatabaseSource {
  id: string;
  name: string;
  records: string;
  status: 'Online' | 'Offline' | 'Syncing';
  type: string;
  lastUpdate: string;
}

export type View = 'dashboard' | 'search' | 'databases';