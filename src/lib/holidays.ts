import type { PublicHoliday } from '@/types/roster.d';

const RESOURCE_IDS = {
  2024: 'd_4e19214c3a5288eab7a27235f43da4fa',
  2025: 'd_3751791452397f1b1c80c451447e40b7'
};

interface ApiHolidayResponse {
  success: boolean;
  result: {
    records: Array<{
      date: string;
      day: string;
      holiday: string;  // This is the holiday name in the API response
    }>;
  };
}

export async function fetchHolidays(year: number): Promise<PublicHoliday[]> {
  const resourceId = RESOURCE_IDS[year as keyof typeof RESOURCE_IDS];
  if (!resourceId) throw new Error(`No resource ID for year ${year}`);

  const response = await fetch(
    `https://data.gov.sg/api/action/datastore_search?resource_id=${resourceId}`
  );
  const data: ApiHolidayResponse = await response.json();

  if (!data.success) throw new Error('Failed to fetch holidays');

  // Transform API response to our PublicHoliday type
  return data.result.records.map(record => ({
    date: record.date,
    day: record.day,
    holiday: record.holiday  // Changed from 'name' to 'holiday' to match PublicHoliday type
  }));
}

export function getStorageKey(year: number): string {
  return `publicHolidays_${year}`;
}

export function isPublicHoliday(date: Date, holidays: PublicHoliday[] = []): boolean {
  if (!holidays) return false;

  // Convert the input date to UTC midnight
  const utcDate = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ));
  const dateStr = utcDate.toISOString().split('T')[0];

  return holidays.some(holiday => holiday.date === dateStr);
}