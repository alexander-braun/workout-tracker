import { type SaveMeasurementRequest } from "../body-api.service";
import { type MeasurementEntry } from "../body.model";

export interface BodyStore {
  currentMeasurement: MeasurementEntry | null;
  measurementHistory: MeasurementEntry[];
  measurementHistoryLoading: boolean;
  measurementHistoryStale: boolean;
  measurementsLoading: boolean;
  measurementSaveInProgress: boolean;
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