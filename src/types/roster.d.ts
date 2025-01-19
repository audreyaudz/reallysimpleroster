export type StaffMember = string;

export type DutyState = 'preAssigned' | 'blocked' | 'requested' | null;

export interface DutyPreferences {
  preferredDates: string[];  // ISO date strings
  declinedDates: string[];   // ISO date strings
  preAssignedDates: string[];  // ISO date strings
  blockedDates: string[];      // ISO date strings
}

export interface StaffPreferences {
  [key: string]: DutyPreferences;
}

export interface DutyCounts {
  total: number;
  weekday: number;
  weekend: number;
}

export interface StaffDutyCounts {
  [key: string]: DutyCounts;
}

export interface RosterData {
  [date: string]: StaffMember | null;
}

export interface WeeklyDistributionData {
  week: string;
  [key: string]: number | string;
}

export interface WeekdayWeekendData {
  name: StaffMember;
  Weekday: number;
  Weekend: number;
}

export type PaintMode = 'requested' | 'blocked' | 'preAssigned' | 'clear' | 'assign' | null;

export interface PublicHoliday {
  date: string;

  day: string;
  holiday: string;
  observance?: string;
}

export interface RosterRules {
  minDuties: number;
  minRestDays: number;
  staff: StaffMember[];
}