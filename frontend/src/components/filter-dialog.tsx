import { ListFilter } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "./ui/sheet";

export interface TaskFilters {
    status: string[];
    priority: string[];
    type: string[];
    assignedTo: string[];
    dateRange: {
        start?: string;
        end?: string;
    };
}

interface FilterDialogProps {
    onFilterChange: (filters: TaskFilters) => void;
    currentFilters: TaskFilters;
}

const FilterDialog = ({ onFilterChange, currentFilters }: FilterDialogProps) => {
    const [filters, setFilters] = useState<TaskFilters>(currentFilters);

    const handleFilterChange = (newFilters: Partial<TaskFilters>) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        onFilterChange(updatedFilters);
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="nav" size="icon" className="p-[6px]">
                    <ListFilter size={14} />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[350px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle>Filter Tasks</SheetTitle>
                </SheetHeader>
                <div className="grid gap-6 py-6">
                    {/* Status Filter */}
                    <div className="grid gap-3">
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {["Open", "Working", "Pending Review", "Overdue", "Completed"].map((status) => (
                                <div key={status} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`status-${status}`}
                                        checked={filters.status.includes(status)}
                                        onCheckedChange={(checked) => {
                                            const newStatus = checked
                                                ? [...filters.status, status]
                                                : filters.status.filter((s) => s !== status);
                                            handleFilterChange({ status: newStatus });
                                        }}
                                    />
                                    <Label htmlFor={`status-${status}`} className="text-sm">
                                        {status}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Priority Filter */}
                    <div className="grid gap-3">
                        <Label className="text-sm font-medium">Priority</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {["Low", "Medium", "High", "Urgent"].map((priority) => (
                                <div key={priority} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`priority-${priority}`}
                                        checked={filters.priority.includes(priority)}
                                        onCheckedChange={(checked) => {
                                            const newPriority = checked
                                                ? [...filters.priority, priority]
                                                : filters.priority.filter((p) => p !== priority);
                                            handleFilterChange({ priority: newPriority });
                                        }}
                                    />
                                    <Label htmlFor={`priority-${priority}`} className="text-sm">
                                        {priority}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Type Filter */}
                    <div className="grid gap-3">
                        <Label className="text-sm font-medium">Type</Label>
                        <Select
                            value={filters.type[0] || "all"}
                            onValueChange={(value) => handleFilterChange({ type: value === "all" ? [] : [value] })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Task">Task</SelectItem>
                                <SelectItem value="Issue">Issue</SelectItem>
                                <SelectItem value="Bug">Bug</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range Filter */}
                    <div className="grid gap-3">
                        <Label className="text-sm font-medium">Date Range</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="text-xs text-muted-foreground">From</Label>
                                <input
                                    type="date"
                                    value={filters.dateRange.start || ""}
                                    onChange={(e) =>
                                        handleFilterChange({
                                            dateRange: { ...filters.dateRange, start: e.target.value },
                                        })
                                    }
                                    className="px-3 py-2 border rounded-md text-sm"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-xs text-muted-foreground">To</Label>
                                <input
                                    type="date"
                                    value={filters.dateRange.end || ""}
                                    onChange={(e) =>
                                        handleFilterChange({
                                            dateRange: { ...filters.dateRange, end: e.target.value },
                                        })
                                    }
                                    className="px-3 py-2 border rounded-md text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default FilterDialog; 