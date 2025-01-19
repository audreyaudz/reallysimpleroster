import type { StaffMember, StaffPreferences, RosterData, StaffDutyCounts, RosterRules } from '@/types/roster.d';
import _ from 'lodash';
import type { PublicHoliday } from '@/types/roster';
import { isPublicHoliday } from '@/lib/holidays';

/**
 * Calculate duty counts for each staff member
 */
export const calculateDutyCounts = (
  roster: RosterData,
  rules: RosterRules,
  holidays: PublicHoliday[] = []
): StaffDutyCounts => {
  const counts: StaffDutyCounts = {};

  // Initialize counts for current staff
  rules.staff.forEach(staff => {
    counts[staff] = {
      total: 0,
      weekday: 0,
      weekend: 0
    };
  });

  // Process roster entries, skipping any staff that no longer exists
  Object.entries(roster).forEach(([date, staff]) => {
    if (staff && counts[staff]) {  // Only count if staff still exists
      const dateObj = new Date(date);
      const day = dateObj.getDay();
      const isWeekendOrHoliday = day === 0 || day === 6 || isPublicHoliday(dateObj, holidays);

      counts[staff].total++;
      if (isWeekendOrHoliday) {
        counts[staff].weekend++;
      } else {
        counts[staff].weekday++;
      }
    }
  });

  return counts;
};

/**
 * Check if a date is valid for a staff member based on rest days and declined dates
 */
const isValidDutyDate = (
  staff: StaffMember,
  date: string,
  roster: RosterData,
  preferences: StaffPreferences,
  rules: RosterRules
): boolean => {
  // Check if date is blocked
  if (preferences[staff]?.blockedDates.includes(date)) return false;

  // Check if date is pre-assigned to someone else
  const preAssignedStaff = Object.entries(preferences).find(([_, prefs]) =>
    prefs.preAssignedDates.includes(date)
  )?.[0];
  if (preAssignedStaff && preAssignedStaff !== staff) return false;

  // Check if date is declined
  if (preferences[staff]?.declinedDates.includes(date)) return false;

  // Use UTC methods when working with dates
  const dateObj = new Date(date + 'T00:00:00Z');
  for (let i = 1; i <= rules.minRestDays; i++) {
    const prevDate = new Date(dateObj);
    prevDate.setUTCDate(prevDate.getUTCDate() - i);
    const prevDateStr = prevDate.toISOString().split('T')[0];

    const nextDate = new Date(dateObj);
    nextDate.setUTCDate(nextDate.getUTCDate() + i);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    if (roster[prevDateStr] === staff || roster[nextDateStr] === staff) {
      return false;
    }
  }

  return true;
};

/**
 * Generate a roster for the given month
 */
export const generateRoster = (
  dates: Date[],
  preferences: StaffPreferences,
  rules: RosterRules,
  holidays: PublicHoliday[] = []
): RosterData => {
  const roster: RosterData = {};

  // Create a Set of valid date strings for quick lookup
  const validDateSet = new Set(dates.map(date => date.toISOString().split('T')[0]));
  console.log(dates, validDateSet)

  // Initialize all dates within the selected month
  dates.forEach(date => {
    roster[date.toISOString().split('T')[0]] = null;
  });

  // First pass: Assign pre-assigned duties only if the date is valid
  Object.entries(preferences).forEach(([staff, prefs]) => {
    prefs.preAssignedDates.forEach(date => {
      if (validDateSet.has(date)) { // Validation added here
        roster[date] = staff as StaffMember;
      }
    });
  });

  // Second pass: Assign preferred dates where possible, ensuring date validity
  const preferredDateAssignments = new Map<string, StaffMember[]>();

  // Group all staff preferences by date
  Object.entries(preferences).forEach(([staff, prefs]) => {
    prefs.preferredDates.forEach(date => {
      if (validDateSet.has(date)) { // Validation added here
        if (!preferredDateAssignments.has(date)) {
          preferredDateAssignments.set(date, []);
        }
        preferredDateAssignments.get(date)?.push(staff as StaffMember);
      }
    });
  });

  // Try to assign preferred dates, prioritizing dates with fewer requests
  [...preferredDateAssignments.entries()]
    .sort(([, a], [, b]) => a.length - b.length)
    .forEach(([date, staffList]) => {
      if (!roster[date]) {  // If date isn't already assigned
        // Find the first valid staff member who requested this date
        const validStaff = staffList.find(staff =>
          isValidDutyDate(staff, date, roster, preferences, rules)
        );
        if (validStaff) {
          roster[date] = validStaff;
        }
      }
    });

  // Third pass: Fill remaining dates
  const unassignedDates = Object.keys(roster).filter(date => !roster[date]);
  const shuffledStaff = _.shuffle(rules.staff);

  unassignedDates.forEach(date => {
    const dateObj = new Date(date);
    const isWeekendOrHoliday = dateObj.getDay() === 0 || dateObj.getDay() === 6 || isPublicHoliday(dateObj, holidays);
    const validStaff = shuffledStaff.filter(staff =>
      isValidDutyDate(staff, date, roster, preferences, rules)
    );

    if (validStaff.length > 0) {
      const counts = calculateDutyCounts(roster, rules, holidays);
      // Sort staff by weekend count for weekend days, total count for weekdays
      const staffByDuty = _.sortBy(validStaff, staff =>
        isWeekendOrHoliday
          ? counts[staff].weekend * 2 + counts[staff].total  // Prioritize weekend balance
          : counts[staff].total
      );
      roster[date] = staffByDuty[0];
    }
  });

  return roster;
};