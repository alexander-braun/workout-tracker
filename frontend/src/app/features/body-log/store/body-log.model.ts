import {
  type MeasurementEntryRequest,
  type MeasurementEntryResponse,
} from '../../../api/generated/api-types';

export interface BodyStore {
  currentMeasurement: MeasurementEntryResponse | null;
  measurementHistory: MeasurementEntryResponse[];
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
  request: MeasurementEntryRequest;
}

export interface GetMeasurementHistory {
  from?: string;
  to?: string;
}
