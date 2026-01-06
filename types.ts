
export interface SheetRow {
  [key: string]: any;
}

export interface SheetData {
  id: string;
  timestamp: number;
  fileName: string;
  headers: string[];
  rows: SheetRow[];
  originalRows: SheetRow[];
  query?: string;
}

export enum AppStatus {
  SPLASH = 'SPLASH',
  IDLE = 'IDLE',
  LOADING_FILE = 'LOADING_FILE',
  READY = 'READY',
  PROCESSING_AI = 'PROCESSING_AI',
  ERROR = 'ERROR'
}
