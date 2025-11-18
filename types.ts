
export interface User {
  username: string;
}

export type LogAction = 'LOGIN' | 'LOGOUT' | 'CSV_UPLOAD' | 'API_KEY_GEN' | 'API_CALL_SUCCESS' | 'API_CALL_FAIL';

export interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: LogAction;
  details: string;
}

export type CsvData = Record<string, string>[];

export interface CsvFileInfo {
  name: string;
  uploadedAt: string;
}
