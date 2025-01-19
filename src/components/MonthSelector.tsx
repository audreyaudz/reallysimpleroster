import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  onMonthChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Select Month</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 items-center">
          <select
            value={selectedMonth.getMonth()}
            onChange={(e) => {
              const newDate = new Date(selectedMonth);
              newDate.setMonth(parseInt(e.target.value));
              onMonthChange(newDate);
            }}
            className="border rounded p-2"
          >
            {Array.from({length: 12}, (_, i) => (
              <option key={i} value={i}>
                {new Date(2024, i, 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={selectedMonth.getFullYear()}
            onChange={(e) => {
              const newDate = new Date(selectedMonth);
              newDate.setFullYear(parseInt(e.target.value));
              onMonthChange(newDate);
            }}
            className="border rounded p-2"
          >
            {Array.from({length: 5}, (_, i) => (
              <option key={i} value={2024 + i}>{2024 + i}</option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
};