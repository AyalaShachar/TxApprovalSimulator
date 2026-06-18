export interface SimulationRequest {
  region: string;
  /** The exact moment the user picked, as an ISO 8601 instant (e.g. the result of Date.toISOString()). */
  timestamp: string;
}

export type TransactionStatus = 'Approved' | 'Rejected';

export interface TransactionResult {
  id: number;
  region: string;
  /** Local time in the region, formatted "HH:mm". */
  localTime: string;
  status: TransactionStatus;
}
