import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RosterRules } from "@/types/roster.d.ts";
import { Calendar, Ban, Check } from "lucide-react";

interface RulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules: RosterRules;
  onRulesChange: (rules: RosterRules) => void;
}

export const RulesDialog: React.FC<RulesDialogProps> = ({
  open,
  onOpenChange,
  rules,
  onRulesChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Roster Rules</DialogTitle>
          <DialogDescription>
            Configure the rules used to generate the roster:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Duties</label>
              <input
                type="number"
                value={rules.minDuties}
                onChange={(e) => onRulesChange({
                  ...rules,
                  minDuties: parseInt(e.target.value)
                })}
                className="w-full p-2 border rounded"
                min={1}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Rest Days</label>
              <input
                type="number"
                value={rules.minRestDays}
                onChange={(e) => onRulesChange({
                  ...rules,
                  minRestDays: parseInt(e.target.value)
                })}
                className="w-full p-2 border rounded"
                min={1}
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Strict Rules:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Each person must have a minimum of {rules.minDuties} duty days</li>
              <li>Each person must have a minimum of {rules.minRestDays} days rest between rostered duty days</li>
              <li>Pre-assigned duties (✓) will be respected</li>
              <li>Blocked Time Off dates (⊘) will not be assigned</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Preference Rules:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Each person should have duty at fairly regular intervals</li>
              <li>There should be fairly equal number of weekday and weekend duty days among staff</li>
              <li>Preferred duty days (📅) will be allocated when possible while maintaining strict rules</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Cell Markings:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-500" />
                  Preferred days
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-2">
                  <Ban className="h-4 w-4 text-red-500" />
                  Blocked / Time Off days
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Pre-assigned days
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block w-4 h-4 bg-muted/80" />
                  Weekend/Holiday days
                </span>
              </li>
              <li>
                When reviewing the solution, each staff member's duties will be shown in their assigned color
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};