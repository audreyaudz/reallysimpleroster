import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart, BarChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import type { WeeklyDistributionData, WeekdayWeekendData, StaffMember } from '@/types/roster';

interface AnalyticsChartsProps {
  weekdayWeekendData: WeekdayWeekendData[];
  weeklyDistributionData: WeeklyDistributionData[];
  staff: StaffMember[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  weekdayWeekendData,
  weeklyDistributionData,
  staff,
}) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Duty Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekdayWeekendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Weekday" fill="#93c5fd" />
              <Bar dataKey="Weekend" fill="#bfdbfe" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Duty</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value, name) => [`${value} duties`, name]}
                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
              />
              <Legend />
              {staff.map((staffMember, index) => (
                <Bar
                  key={staffMember}
                  dataKey={staffMember}
                  stackId="duties"
                  fill={`hsl(${(index * 360) / staff.length}, 70%, 60%)`}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};