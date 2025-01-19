import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type{ StaffMember, RosterData, StaffPreferences, DutyState } from '@/types/roster.d';
import type { PaintMode } from '@/types/roster';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Ban,
  Star,
  X,
  Eraser,
  Check
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { type PublicHoliday } from '@/types/roster.d';
import { isPublicHoliday } from '@/lib/holidays';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

interface RosterGridProps {
  dates: Date[];
  roster: RosterData;
  preferences: StaffPreferences;
  declinedDates: { [key: string]: string[] };
  paintMode: PaintMode;
  onCellPaint: (staff: StaffMember, date: string) => void;
  setPaintMode: (mode: PaintMode | null) => void;
  editMode: 'preferences' | 'duties';
  setEditMode: (mode: 'preferences' | 'duties') => void;
  holidays: PublicHoliday[];
  staff: StaffMember[];
}

const getStaffColor = (staffIndex: number, totalStaff: number): string => {
  return `hsl(${(staffIndex * 360) / totalStaff}, 70%, 60%)`;
};

// Add a function to determine text color based on background brightness
const getContrastColor = (backgroundColor: string): string => {
  // Extract HSL lightness value
  const lightnessMatch = backgroundColor.match(/hsl\(\d+,\s*\d+%,\s*(\d+)%\)/);
  const lightness = lightnessMatch ? parseInt(lightnessMatch[1]) : 60;

  // Use white text for darker backgrounds, black for lighter ones
  return lightness > 65 ? 'black' : 'white';
};

export const RosterGrid: React.FC<RosterGridProps> = ({
  dates,
  roster,
  preferences,
  paintMode,
  onCellPaint,
  setPaintMode,
  editMode,
  setEditMode,
  holidays = [],
  staff,
}) => {
  const isHolidayOrWeekend = (date: Date) => {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    return isWeekend || isPublicHoliday(date, holidays);
  };

  const getHolidayInfo = (date: Date): PublicHoliday | undefined => {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.find(holiday => holiday.date === dateStr);
  };

  const GridTable = () => (
    <div className="overflow-x-auto bg-card rounded-lg shadow">
      <table className="w-full border-collapse">
        <thead>
          <tr className="cursor-help">
            <th className="w-12 h-12 p-1 border border-border bg-muted sticky left-0 z-10"></th>
            {dates.map(date => {
              const dateStr = date.toISOString().split('T')[0];
              const holiday = getHolidayInfo(date);

              return (
                <th
                  key={dateStr}
                  className={`w-8 h-12 p-1 border border-border whitespace-nowrap text-xs ${
                    isHolidayOrWeekend(date) ? 'bg-muted/70' : 'bg-muted'
                  }`}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center font-normal">
                          <div className={`text-gray-600 ${holiday ? 'text-red-600 ' : ''}`}>
                            {date.toLocaleDateString('en-US', {
                              weekday: 'short',
                              timeZone: 'UTC'
                            })}
                          </div>
                          <div className={` mt-1 ${holiday ? 'text-red-600' : ''}`}>
                            {date.getUTCDate()}
                          </div>
                        </div>
                      </TooltipTrigger>
                      {holiday && (
                        <TooltipContent>
                          <div className="text-sm">
                            <div className="font-normal">{holiday.holiday}</div>
                            <div className="text-gray-500">
                              {new Date(holiday.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {staff.map((staffMember, index) => {
            const staffColor = getStaffColor(index, staff.length);
            const textColor = getContrastColor(staffColor);

            return (
              <tr key={staffMember}>
                <td
                  className="w-8 h-8 aspect-square font-mono text-center text-sm p-1 border border-border font-normal sticky left-0 z-10"
                  style={{
                    backgroundColor: staffColor,
                    color: textColor
                  }}
                >
                  {staffMember}
                </td>
                {dates.map(date => {
                  const dateStr = date.toISOString().split('T')[0];
                  const isRostered = roster[dateStr] === staffMember;
                  const isPreAssigned = preferences[staffMember]?.preAssignedDates.includes(dateStr);

                  return (
                    <td
                      key={dateStr}
                      className={cn(
                        "w-8 h-8 aspect-square p-1 border border-border text-center cursor-pointer relative",
                        date.getDay() === 0 || date.getDay() === 6 || isHolidayOrWeekend(date) ? 'bg-muted/80' : '',
                        (paintMode || editMode === 'duties') && "hover:ring-2 hover:ring-inset hover:ring-ring"
                      )}
                      style={{
                        ...(isRostered && editMode === 'duties' ? {
                          backgroundColor: staffColor,
                          color: textColor
                        } : {})
                      }}
                      onClick={() => {
                        if (editMode === 'preferences' && paintMode) {
                          onCellPaint(staffMember, dateStr);
                        } else if (editMode === 'duties') {
                          onCellPaint(staffMember, dateStr);
                        }
                      }}
                    >
                      {isPreAssigned && (
                        <Check className="h-4 w-4 mx-auto text-green-600" />
                      )}
                      {preferences[staffMember]?.blockedDates.includes(dateStr) && (
                        <Ban className="h-4 w-4 mx-auto text-red-500" />
                      )}
                      {preferences[staffMember]?.preferredDates.includes(dateStr) && (
                        <Calendar className="h-4 w-4 mx-auto text-green-500" />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Schedule</CardTitle>
        <div className="flex justify-between items-center print:hidden">
          <Tabs value={editMode} onValueChange={(value) => setEditMode(value as 'preferences' | 'duties')}>
            <TabsList>
              <TabsTrigger value="preferences">1. Staff Preferences</TabsTrigger>
              <TabsTrigger value="duties">2. Review Solution</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex-grow" />
          {editMode === 'preferences' && (
            <div className="flex gap-2 print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaintMode(paintMode === 'requested' ? null : 'requested')}
                className={`flex items-center gap-1 ${paintMode === 'requested' ? 'bg-secondary' : ''}`}
              >
                <Calendar className="h-4 w-4" />
                Request
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaintMode(paintMode === 'blocked' ? null : 'blocked')}
                className={`flex items-center gap-1 ${paintMode === 'blocked' ? 'bg-secondary' : ''}`}
              >
                <Ban className="h-4 w-4 text-red-500" />
                Time Off
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaintMode(paintMode === 'preAssigned' ? null : 'preAssigned')}
                className={`flex items-center gap-1 ${paintMode === 'preAssigned' ? 'bg-secondary' : ''}`}
              >
                <Check className="h-4 w-4 text-green-500" />
                Pre-assign
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaintMode(paintMode === 'clear' ? null : 'clear')}
                className={`flex items-center gap-1 ${paintMode === 'clear' ? 'bg-secondary' : ''}`}
              >
                <Eraser className="h-4 w-4" />
                Clear
              </Button>
            </div>
          )}
          {editMode === 'duties' && (
            <div className="flex gap-2 print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaintMode('clear')}
                className="flex items-center gap-1"
              >
                <Eraser className="h-4 w-4" />
                Clear Duty
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaintMode('assign')}
                className="flex items-center gap-1"
              >
                <Check className="h-4 w-4" />
                Assign Duty
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <GridTable />
      </CardContent>
    </Card>
  );
};