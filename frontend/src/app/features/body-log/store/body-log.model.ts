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