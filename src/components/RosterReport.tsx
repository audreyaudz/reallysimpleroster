import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StaffMember, RosterData, StaffPreferences } from '@/types/roster';
import type { PublicHoliday } from '@/types/roster';
import { isPublicHoliday } from '@/lib/holidays';
import { Calendar } from "lucide-react";

interface RosterReportProps {
  roster: RosterData;
  staff: StaffMember[];
  holidays: PublicHoliday[];
  preferences: StaffPreferences;
}

// Add these utility functions at the top of the file
const getStaffColor = (staffIndex: number, totalStaff: number): string => {
  return `hsl(${(staffIndex * 360) / totalStaff}, 50%, 60%)`;
};

const getContrastColor = (backgroundColor: string): string => {
  const lightnessMatch = backgroundColor.match(/hsl\(\d+,\s*\d+%,\s*(\d+)%\)/);
  const lightness = lightnessMatch ? parseInt(lightnessMatch[1]) : 60;
  return lightness > 65 ? 'black' : 'white';
};

export const RosterReport: React.FC<RosterReportProps> = ({ roster, staff, holidays, preferences }) => {

  console.log(roster)
  console.log(holidays)
  // Convert preferences to timeOff and requested dates format
  const timeOff = staff.reduce((acc, member) => ({
    ...acc,
    [member]: preferences[member]?.blockedDates || []
  }), {} as Record<StaffMember, string[]>);

  const requestedDates = staff.reduce((acc, member) => ({
    ...acc,
    [member]: preferences[member]?.preferredDates || []
  }), {} as Record<StaffMember, string[]>);

  // Group duties by staff member
  const dutyByStaff = staff.reduce((acc, member) => {
    const duties = Object.entries(roster)
      .filter(([_, assignedStaff]) => assignedStaff === member)
      .map(([date]) => ({
        date: new Date(date),
        dateStr: date,
        isWeekend: [0, 6].includes(new Date(date).getDay()),
        holiday: holidays.find(h => h.date === date),
        isRequested: requestedDates[member]?.includes(date)
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return { ...acc, [member]: duties };
  }, {} as Record<StaffMember, Array<{date: Date; dateStr: string; isWeekend: boolean; holiday?: PublicHoliday; isRequested: boolean}>>);

  // Fix: Filter dates to only include those in the roster
  const dates = Object.keys(roster)
    .filter(date => roster.hasOwnProperty(date))
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <Card className="print:shadow-none print:rounded-none">
      <CardHeader>
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Staff Duty Card</span>
          <button
            onClick={() => window.print()}
            className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-md print:hidden"
          >
            Print Report
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 print:grid-cols-2">
          {staff.map((member, index) => {
            const staffColor = getStaffColor(index, staff.length);
            const textColor = getContrastColor(staffColor);

            return (
              <Card key={member} className="print:break-inside-avoid">
                <CardHeader
                  className="py-2 px-4"
                  style={{
                    backgroundColor: staffColor,
                    borderTopLeftRadius: 'inherit',
                    borderTopRightRadius: 'inherit'
                  }}
                >
                  <CardTitle className="text-base" style={{ color: textColor }}>
                    {member}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {/* Duty Column */}
                  <div>
                    <h3 className="font-semibold mb-2">Duties</h3>
                    <div className="text-sm space-y-1">
                      {dutyByStaff[member].map(({ dateStr, isWeekend, holiday, isRequested }) => (
                        <div
                          key={dateStr}
                          className={`flex items-center justify-between gap-2 ${
                            isWeekend || isPublicHoliday(new Date(dateStr), holidays) ? 'text-red-600 dark:text-red-400' : ''
                          }`}
                        >
                          <span>
                            {new Date(dateStr).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                            {isPublicHoliday(new Date(dateStr), holidays)
                              ? ` - ${holidays.find(h => h.date === dateStr)?.holiday}`
                              : isWeekend ? ' - Weekend' : ''}
                          </span>
                          <div className="flex gap-1">
                            {isRequested && (
                              <Calendar className="h-4 w-4 text-green-500" />
                            )}
                            {timeOff[member]?.includes(dateStr) && (
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      ))}
                      {dutyByStaff[member].length === 0 && (
                        <div className="text-muted-foreground italic">No duties assigned</div>
                      )}
                    </div>
                  </div>

                  {/* Time Off Column */}
                  <div>
                    <h3 className="font-semibold mb-2">Time Off</h3>
                    <div className="text-sm space-y-1">
                      {timeOff[member]?.map(dateStr => (
                        <div key={dateStr}>
                          {new Date(dateStr).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      ))}
                      {(!timeOff[member] || timeOff[member].length === 0) && (
                        <div className="text-muted-foreground italic">No time off requested</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <Card className="print:shadow-none print:rounded-none mt-4">
          <CardHeader className="bg-muted">
            <CardTitle className="text-base">Schedule</CardTitle>
          </CardHeader>
          <div className="p-4">
            <div className="grid grid-cols-2 auto-rows-min gap-x-8">
              {dates.slice(0, Math.ceil(dates.length / 2)).map((dateStr, index) => {
                const date = new Date(dateStr);
                const isWeekend = [0, 6].includes(date.getDay());
                const holiday = holidays.find(h => h.date === dateStr);
                const secondColumnDate = dates[index + Math.ceil(dates.length / 2)];

                return (
                  <React.Fragment key={dateStr}>
                    <div
                      className={`flex justify-between ${
                        isWeekend || isPublicHoliday(date, holidays) ? 'text-red-600 dark:text-red-400' : ''
                      }`}
                    >
                      <span>
                        {date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                        {' '}
                        {date.toLocaleDateString('en-US', {
                          weekday: 'short'
                        })}
                        {isPublicHoliday(date, holidays)
                          ? ` - ${holiday?.holiday}`
                          : isWeekend ? ' - Weekend' : ''}
                      </span>
                      <span className="font-medium">{roster[dateStr]}</span>
                    </div>
                    {secondColumnDate && (
                      <div
                        className={`flex justify-between ${
                          isWeekend || isPublicHoliday(new Date(secondColumnDate), holidays)
                            ? 'text-red-600 dark:text-red-400' : ''
                        }`}
                      >
                        <span>
                          {new Date(secondColumnDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                          {' '}
                          {new Date(secondColumnDate).toLocaleDateString('en-US', {
                            weekday: 'short'
                          })}
                          {isPublicHoliday(new Date(secondColumnDate), holidays)
                            ? ` - ${holidays.find(h => h.date === secondColumnDate)?.holiday}`
                            : [0, 6].includes(new Date(secondColumnDate).getDay()) ? ' - Weekend' : ''}
                        </span>
                        <span className="font-medium">{roster[secondColumnDate]}</span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </Card>
      </CardContent>
    </Card>
  );
};