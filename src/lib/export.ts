import type { RosterData, StaffMember, StaffPreferences } from '@/types/roster';
import type { PublicHoliday } from '@/types/roster';

export const generateCsvContent = (
  dates: Date[],
  roster: RosterData,
  staff: StaffMember[],
  preferences: StaffPreferences,
  holidays: PublicHoliday[]
) => {
  const headers = ['Staff', ...dates.map(d =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  )];

  const rows = staff.map(staffMember => {
    const duties = dates.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isHoliday = holidays.some(h => h.date === dateStr);
      const isRequested = preferences[staffMember]?.preferredDates.includes(dateStr);
      const isBlocked = preferences[staffMember]?.blockedDates.includes(dateStr);

      if (roster[dateStr] === staffMember) {
        const tags = [];
        if (isWeekend || isHoliday) {
          tags.push(isHoliday ? 'PH' : 'W');
        }
        return `DUTY[${tags.join('/')}]`;
      }

      const prefTags = [];
      if (isRequested) prefTags.push('REQUESTED');
      if (isBlocked) prefTags.push('BLOCKED');

      return prefTags.length ? `[${prefTags.join('/')}]` : '';
    });
    return [staffMember, ...duties];
  });

  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
};