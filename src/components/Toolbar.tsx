import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DownloadCloud,
  Settings2,
  RotateCcw,
  Users
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ToolbarProps {
  onGenerate: () => void;
  onExport: () => void;
  onRules: () => void;
  onReset: () => void;
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  isLoading?: boolean;
  onStaff: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onGenerate,
  onExport,
  onRules,
  onReset,
  selectedMonth,
  onMonthChange,
  isLoading = false,
  onStaff,
}) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex gap-2">
        <select
          value={selectedMonth.getMonth()}
          onChange={(e) => {
            const newDate = new Date(selectedMonth);
            newDate.setMonth(parseInt(e.target.value));
            onMonthChange(newDate);
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
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
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          {Array.from({length: 5}, (_, i) => (
            <option key={i} value={2024 + i}>{2024 + i}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 print:hidden">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="flex items-center gap-1"
              >
                <DownloadCloud className="h-4 w-4" />
                Export
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export roster to CSV</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onRules}
                className="flex items-center gap-1 print:hidden"
              >
                <Settings2 className="h-4 w-4" />
                Rules
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Configure roster rules and constraints</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onStaff}
                className="flex items-center gap-1 print:hidden"
              >
                <Users className="h-4 w-4" />
                Staff
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add or remove staff members</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="flex items-center gap-1 print:hidden"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset the current roster</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onGenerate}
                size="sm"
                className="flex items-center gap-1 print:hidden"
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Roster'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Generate a roster proposal. You can repeat this as many times as you like until you find a solution you like, or edit the solution manually.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};