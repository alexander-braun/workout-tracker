import { type SaveMeasurementRequest, type MeasurementEntry } from '../body.model';

export interface BodyStore {
  currentMeasurement: MeasurementEntry | null;
  measurementHistory: MeasurementEntry[];
  measurementHistoryLoading: boolean;
  measurementHistoryStale: boolean;
  measurementsLoading: boolean;
  measurementSaveInProgress: boolean;
  measurementDates: string[];
}

export interface DeleteMeasurement {
  date: string;
}

export interface SaveMeasurement {
  date: string;
  request: SaveMeasurementRequest;
}

export interface GetMeasurementHistory {
  from?: string;
  to?: string;
}
