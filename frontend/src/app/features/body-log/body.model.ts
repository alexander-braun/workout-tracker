export interface MeasurementEntry {
  id: string | null;
  date: string;
  chest: number | null;
  waist: number | null;
  neck: number | null;
  bicepsLeft: number | null;
  bicepsRight: number | null;
  thighLeft: number | null;
  thighRight: number | null;
  calfLeft: number | null;
  calfRight: number | null;
}

export type SaveMeasurementRequest = Omit<MeasurementEntry, 'id' | 'date'>;

export interface MeasurementDatesResponse {
  dates: string[];
}
