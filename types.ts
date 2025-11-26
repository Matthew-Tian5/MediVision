

export enum SourceType {
  HOSPITAL = 'HOSPITAL', // From discharge summary
  HOME = 'HOME'          // From home pill bottles
}

export type MedicationCategory = 'OTC' | 'Rx';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  source: SourceType;
  category: MedicationCategory; // New field for OTC vs Prescription
  reasoning?: string; // AI explanation for the chosen frequency
}

export type TimeSlot = 'morning' | 'noon' | 'evening' | 'bedtime';

export interface DailySchedule {
  morning: string[]; // List of medication IDs or Names
  noon: string[];
  evening: string[];
  bedtime: string[];
}

export interface Warning {
  description: string;
  relatedMedicationIds: string[];
}

export interface AnalysisResult {
  medications: Medication[];
  schedule: DailySchedule;
  warnings: Warning[];
}

export interface User {
  name: string;
  id: string;
}

export interface HistoryRecord {
  id: string;
  date: string;
  scheduleName: string;
  data: AnalysisResult;
}

export enum AppStatus {
  IDLE = 'IDLE',
  DASHBOARD = 'DASHBOARD',
  ANALYZING = 'ANALYZING',
  REVIEW_PENDING = 'REVIEW_PENDING',
  APPROVED = 'APPROVED'
}

export interface UILabels {
  reportTitle: string;
  reportSubtitle: string;
  scheduleNameLabel: string;
  dateLabel: string;
  clinicalAlertsTitle: string;
  morning: string;
  morningTime: string;
  noon: string;
  noonTime: string;
  evening: string;
  eveningTime: string;
  night: string;
  nightTime: string;
  tableMedication: string;
  tableType: string;
  tableInstructions: string;
  tableAdministered: string;
  disclaimer: string;
  signature: string;
  labelOTC: string;
  labelRx: string;
}

export interface TranslatedContent {
  medications: Medication[];
  warnings: Warning[];
  labels: UILabels;
}
