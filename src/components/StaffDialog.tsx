import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import type { StaffMember, RosterData } from "@/types/roster.d.ts";

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffMember[];
  onStaffChange: (staff: StaffMember[]) => void;
  roster: RosterData;
  setRoster: (roster: RosterData) => void;
}

export const StaffDialog: React.FC<StaffDialogProps> = ({
  open,
  onOpenChange,
  staff,
  onStaffChange,
  roster,
  setRoster,
}) => {
  const [newStaff, setNewStaff] = useState("");

  const handleAddStaff = () => {
    if (newStaff && !staff.includes(newStaff as StaffMember)) {
      onStaffChange([...staff, newStaff as StaffMember]);
      setNewStaff("");
    }
  };

  const handleRemoveStaff = (staffToRemove: StaffMember) => {
    onStaffChange(staff.filter(s => s !== staffToRemove));

    const updatedRoster = { ...roster };
    Object.entries(roster).forEach(([date, staff]) => {
      if (staff === staffToRemove) {
        updatedRoster[date] = null;
      }
    });
    setRoster(updatedRoster);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Staff</DialogTitle>
          <DialogDescription>
            Add or remove staff members from the roster:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2 text-foreground dark:text-background">
            <input
              type="text"
              value={newStaff}
              onChange={(e) => setNewStaff(e.target.value.trim().toUpperCase())}
              placeholder="Enter staff initials"
              className="flex-1 p-1 text-sm border rounded "
              maxLength={3}
            />
            <Button onClick={handleAddStaff} size="sm">
              <Plus className="h-4 w-4  " />
            </Button>
          </div>

          <div className="space-y-2">
            {staff.map((member) => (
              <div key={member} className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="font-mono">{member}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveStaff(member)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};