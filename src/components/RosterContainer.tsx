import React, { useState, useEffect, useMemo } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { Toolbar } from './Toolbar';
import { RulesDialog } from './RulesDialog';
import { RosterGrid } from './RosterGrid';
import { AnalyticsCharts } from './AnalyticsCharts';
import { generateRoster, calculateDutyCounts } from '@/lib/solver';
import type {
  StaffMember, StaffPreferences, RosterData,
  WeekdayWeekendData, WeeklyDistributionData, RosterRules
} from '@/types/roster';

import type { PaintMode, PublicHoliday } from '@/types/roster';
import { fetchHolidays, getStorageKey, isPublicHoliday } from '@/lib/holidays';
import { StaffDialog } from '@/components/StaffDialog';
import { generateCsvContent } from '@/lib/export';
import { RosterReport } from './RosterReport';


// Add new type for edit mode
type EditMode = 'preferences' | 'duties';

// Add new constant for storage keys
const STORAGE_KEYS = {
  PREFERENCES: 'roster-preferences',
  RULES: 'roster-rules',
  STAFF: 'roster-staff',
  MONTHLY_DATA: 'roster-monthly-data'
};

// Add helper function to get month-specific storage key
const getMonthlyStorageKey = (date: Date) => {
  return `${STORAGE_KEYS.MONTHLY_DATA}-${date.getFullYear()}-${date.getMonth() + 1}`;
};

// Default rules
const DEFAULT_RULES: RosterRules = {
  minDuties: 4,
  minRestDays: 3,
  staff: ['CH', 'JD', 'LWH', 'OM', 'YKH', 'NR']
};



/**
 * Get all days in a month
 */
const getDaysInMonth = (date: Date): Date[] => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const firstDay = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 0));

  const days = [];
  let currentDay = new Date(firstDay);
  while (currentDay <= lastDay) {
    days.push(new Date(currentDay));
    currentDay.setUTCDate(currentDay.getUTCDate() + 1);
  }
  return days;
};

/**
 * Calculate analytics data for charts
 */
const calculateAnalytics = (
  roster: RosterData,
  selectedMonth: Date,
  holidays: PublicHoliday[],
  rules: RosterRules
): { weekdayWeekendData: WeekdayWeekendData[], weeklyDistributionData: WeeklyDistributionData[] } | null => {
  if (!holidays) return null;

  const counts = calculateDutyCounts(roster, rules, holidays);

  const weekdayWeekendData = rules.staff.map(staff => ({
    name: staff,
    Weekday: counts[staff].weekday,
    Weekend: counts[staff].weekend
  }));

  // Get the first and last day of the month
  const firstDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
  const lastDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

  // Initialize weekly distribution
  const dutyDistribution: { [key: number]: { [key: string]: number } } = {};

  // Process each duty in the roster
  Object.entries(roster).forEach(([date, staff]) => {
    if (!staff) return;

    const currentDate = new Date(date);
    // Calculate week number (0-based) from start of month
    const weekNum = Math.floor((currentDate.getDate() - 1) / 7);

    if (!dutyDistribution[weekNum]) {
      dutyDistribution[weekNum] = {};
    }
    if (!dutyDistribution[weekNum][staff]) {
      dutyDistribution[weekNum][staff] = 0;
    }
    dutyDistribution[weekNum][staff]++;
  });

  // Convert to array format for chart
  const weeklyDistributionData = Object.entries(dutyDistribution)
    .map(([week, staffCounts]) => ({
      week: `Week ${Number(week) + 1}`,
      ...rules.staff.reduce((acc, staff) => ({
        ...acc,
        [staff]: staffCounts[staff] || 0
      }), {})
    }))
    .sort((a, b) => Number(a.week.split(' ')[1]) - Number(b.week.split(' ')[1]));

  return { weekdayWeekendData, weeklyDistributionData };
};

export const RosterContainer: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [roster, setRoster] = useState<RosterData>({});
  const [preferences, setPreferences] = useState<StaffPreferences>({});
  const [declinedDates, setDeclinedDates] = useState<{ [key: string]: string[] }>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [paintMode, setPaintMode] = useState<PaintMode>(null);
  const [editMode, setEditMode] = useState<EditMode>('preferences');
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(true);
  const [rules, setRules] = useState<RosterRules>(DEFAULT_RULES);
  const [staffOpen, setStaffOpen] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>(DEFAULT_RULES.staff);

  const analytics = useMemo(() => {
    if (isLoadingHolidays) return null;
    return calculateAnalytics(roster, selectedMonth, holidays, rules);
  }, [roster, selectedMonth, holidays, isLoadingHolidays, rules]);

  useEffect(() => {
    const initPrefs: StaffPreferences = {};
    staff.forEach(member => {
      initPrefs[member] = {
        preferredDates: [],
        declinedDates: [],
        preAssignedDates: [],
        blockedDates: []
      };
    });
    setPreferences(initPrefs);
  }, [staff]);

  useEffect(() => {
    const loadHolidays = async () => {
      setIsLoadingHolidays(true);
      const year = selectedMonth.getFullYear();
      const storageKey = getStorageKey(year);

      try {
        // Check localStorage first
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          const parsedHolidays = JSON.parse(cached) as PublicHoliday[];
          // Validate that the cached data has the required fields
          if (parsedHolidays.every(h => h.date && h.holiday && h.day)) {
            setHolidays(parsedHolidays);
          } else {
            // If cached data is invalid, fetch fresh data
            throw new Error('Invalid cached holiday data');
          }
        } else {
          // Fetch and cache if not found
          const fetchedHolidays = await fetchHolidays(year);
          localStorage.setItem(storageKey, JSON.stringify(fetchedHolidays));
          setHolidays(fetchedHolidays);
        }
      } catch (error) {
        console.error('Failed to load holidays:', error);
        setError('Failed to load public holidays');
      } finally {
        setIsLoadingHolidays(false);
      }
    };

    loadHolidays();
  }, [selectedMonth.getFullYear()]);

  // Load preferences and rules from storage
  useEffect(() => {
    const savedPrefs = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    const savedRules = localStorage.getItem(STORAGE_KEYS.RULES);

    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }

    if (savedRules) {
      setRules(JSON.parse(savedRules));
    }
  }, []);

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  }, [preferences]);

  // Save rules when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
  }, [rules]);

  // Load staff from storage
  useEffect(() => {
    const savedStaff = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (savedStaff) {
      setStaff(JSON.parse(savedStaff));
    }
  }, []);

  // Save staff when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));

    // Update rules when staff changes
    setRules(prev => ({
      ...prev,
      staff: staff
    }));

    // Clean up roster entries for deleted staff
    setRoster(prev => {
      const newRoster = { ...prev };
      Object.entries(newRoster).forEach(([date, assignedStaff]) => {
        if (assignedStaff && !staff.includes(assignedStaff)) {
          delete newRoster[date];
        }
      });
      return newRoster;
    });

    // Update preferences to keep existing staff preferences while removing deleted staff
    setPreferences(prev => {
      const newPreferences: StaffPreferences = {};

      // Keep existing preferences only for current staff members
      staff.forEach(member => {
        if (prev[member]) {
          // Keep existing preferences
          newPreferences[member] = prev[member];
        } else {
          // Initialize new staff member with empty preferences
          newPreferences[member] = {
            preferredDates: [],
            declinedDates: [],
            preAssignedDates: [],
            blockedDates: []
          };
        }
      });

      return newPreferences;
    });
  }, [staff]);

  // Load monthly data when month changes
  useEffect(() => {

    const monthlyKey = getMonthlyStorageKey(selectedMonth);
    const savedMonthlyData = localStorage.getItem(monthlyKey);

    if (savedMonthlyData) {
      try {
        const { monthlyPreferences, monthlyRoster } = JSON.parse(savedMonthlyData);

        // Validate the loaded data has the expected structure
        if (monthlyPreferences && monthlyRoster && typeof monthlyRoster === 'object') {



          setRoster(monthlyRoster);
          // If we have a solution, switch to duties mode
          if (Object.keys(monthlyRoster).length > 0) {
            setEditMode('duties');
          } else {
            setEditMode('preferences');
          }

        } else {
          throw new Error('Invalid stored data format');
        }
      } catch (error) {
        console.error('Error loading monthly data:', error);
        // Initialize empty data if stored data is invalid
        initializeEmptyMonth();
      }
    } else {
      // Initialize empty data for new month
      initializeEmptyMonth();
    }
  }, [selectedMonth, staff]); // Only depend on month changes and staff updates

  // Helper function to initialize empty month data
  const initializeEmptyMonth = () => {
    setRoster({});
    setEditMode('preferences');
    // Initialize empty preferences for all staff
    const initPrefs: StaffPreferences = {};
    staff.forEach(member => {
      initPrefs[member] = {
        preferredDates: [],
        declinedDates: [],
        preAssignedDates: [],
        blockedDates: []
      };
    });
    setPreferences(initPrefs);
  };

  // Save monthly data whenever preferences or roster change
  useEffect(() => {
    // Prevent saving during initial load
    if (!selectedMonth) return;

    const monthlyKey = getMonthlyStorageKey(selectedMonth);
    const monthlyData = {
      monthlyPreferences: preferences,
      monthlyRoster: roster
    };

    // if there's actually data in the preferences or the roster (not just the staff entries)
    if (Object.keys(monthlyData.monthlyRoster).length > 0)
    {
      localStorage.setItem(monthlyKey, JSON.stringify(monthlyData));
    }

  }, [preferences, roster, selectedMonth]);

  const handleGenerateRoster = async () => {
    setIsLoading(true);
    try {
      const dates = getDaysInMonth(selectedMonth);
      const newRoster = generateRoster(dates, preferences, rules, holidays);
      setRoster(newRoster);
      setEditMode('duties');
    } catch (err) {
      setError('Failed to generate roster');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const monthYear = selectedMonth.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    });

    const dates = getDaysInMonth(selectedMonth);
    const csvContent = generateCsvContent(dates, roster, staff, preferences, holidays);

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `roster_${monthYear}.csv`;
    link.click();
  };

  const handleReset = () => {
    // Clear current month's data from localStorage
    const monthlyKey = getMonthlyStorageKey(selectedMonth);
    localStorage.removeItem(monthlyKey);

    // Reset state
    setRoster({});
    setPreferences(
      staff.reduce((acc, member) => ({
        ...acc,
        [member]: {
          preferredDates: [],
          declinedDates: [],
          preAssignedDates: [],
          blockedDates: []
        }
      }), {})
    );
    setDeclinedDates({});
    setError('');
  };

  const handleCellPaint = (staff: StaffMember, date: string) => {
    if (editMode === 'preferences' && paintMode) {
      if (!paintMode) return;
      const newPrefs = { ...preferences };

      switch (paintMode) {
        case 'requested':
          if (!newPrefs[staff].preferredDates.includes(date)) {
            newPrefs[staff].preferredDates.push(date);
          }
          // Clear from other arrays
          newPrefs[staff].blockedDates = newPrefs[staff].blockedDates.filter(d => d !== date);
          newPrefs[staff].preAssignedDates = newPrefs[staff].preAssignedDates.filter(d => d !== date);
          break;
        case 'blocked':
          if (!newPrefs[staff].blockedDates.includes(date)) {
            newPrefs[staff].blockedDates.push(date);
          }
          // Clear from other arrays
          newPrefs[staff].preferredDates = newPrefs[staff].preferredDates.filter(d => d !== date);
          newPrefs[staff].preAssignedDates = newPrefs[staff].preAssignedDates.filter(d => d !== date);
          break;
        case 'preAssigned':
          if (!newPrefs[staff].preAssignedDates.includes(date)) {
            newPrefs[staff].preAssignedDates.push(date);
          }
          // Clear from other arrays
          newPrefs[staff].preferredDates = newPrefs[staff].preferredDates.filter(d => d !== date);
          newPrefs[staff].blockedDates = newPrefs[staff].blockedDates.filter(d => d !== date);
          break;
        case 'clear':
          newPrefs[staff].preferredDates = newPrefs[staff].preferredDates.filter(d => d !== date);
          newPrefs[staff].blockedDates = newPrefs[staff].blockedDates.filter(d => d !== date);
          newPrefs[staff].preAssignedDates = newPrefs[staff].preAssignedDates.filter(d => d !== date);
          break;
      }

      setPreferences(newPrefs);
    } else if (editMode === 'duties') {
      const newRoster = { ...roster };
      const dateStr = date;

      if (paintMode === 'clear') {
        delete newRoster[dateStr];
      } else if (paintMode === 'assign') {
        newRoster[dateStr] = staff;
      }
      setRoster(newRoster);
    }
  };

  const dates = getDaysInMonth(selectedMonth);


  if (isLoadingHolidays) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center">
        <div className="text-lg font-medium">Loading public holidays...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 print:bg-inherit">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create A Roster</h1>
          <Toolbar
            onGenerate={handleGenerateRoster}
            onExport={handleExport}
            onRules={() => setRulesOpen(true)}
            onReset={handleReset}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            isLoading={isLoading}
            onStaff={() => setStaffOpen(true)}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <RosterGrid
          dates={dates}
          roster={roster}
          preferences={preferences}
          declinedDates={declinedDates}

          paintMode={editMode === 'preferences' ? paintMode : null}
          setPaintMode={setPaintMode}
          onCellPaint={handleCellPaint}
          editMode={editMode}
          setEditMode={setEditMode}
          holidays={holidays}
          staff={staff}
        />

        {/* Analytics */}
        {analytics && (
          <AnalyticsCharts
            weekdayWeekendData={analytics.weekdayWeekendData}
            weeklyDistributionData={analytics.weeklyDistributionData}
            staff={staff}
          />
        )}

        {/* Roster Report */}
        <RosterReport
          roster={roster}
          staff={staff}
          holidays={holidays}
          preferences={preferences}
        />

      </div>

      <RulesDialog
        open={rulesOpen}
        onOpenChange={setRulesOpen}
        rules={rules}
        onRulesChange={setRules}
      />

      <StaffDialog
        open={staffOpen}
        onOpenChange={setStaffOpen}
        staff={staff}
        onStaffChange={setStaff}
        roster={roster}
        setRoster={setRoster}
      />
    </div>
  );
};