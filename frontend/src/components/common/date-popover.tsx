import { cn, formatDate, formatDueDateColor } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface DatePopoverProps {
  currentDate?: string;
  status: string;
  handleChangeDate: (date: string) => void;
}

const DatePopover = ({
  currentDate,
  status,
  handleChangeDate,
}: DatePopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const [date, setDate] = useState<Date>(
    currentDate ? new Date(currentDate) : new Date()
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "space-x-1 h-8 text-sm rounded-sm px-3",
            currentDate
              ? formatDueDateColor(currentDate, status)
              : "text-red-800 bg-red-200 hover:bg-red-300 hover:text-red-900"
          )}
        >
          <Clock size={12} className="mt-0.5" />
          {currentDate ? formatDate(currentDate) : "No due date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="flex w-auto flex-col space-y-2"
        align="center"
        side="right"
      >
        <div className="space-y-4 w-full text-xs text-neutral-700">
          <div className="w-full flex items-center justify-center">
            <p className="font-bold">Due Date</p>
          </div>
          <div className="flex w-auto flex-col space-y-2 p-2">
            <Select
              onValueChange={(value) =>
                setDate(addDays(new Date(), parseInt(value)))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Timestamp" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="0">Today</SelectItem>
                <SelectItem value="1">Tomorrow</SelectItem>
                <SelectItem value="3">In 3 days</SelectItem>
                <SelectItem value="7">In a week</SelectItem>
              </SelectContent>
            </Select>
            <div className="">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(day) => day && setDate(day)}
              />
            </div>
          </div>
          <div className="w-full flex items-center justify-center">
            <Button
              type="button"
              className="w-full"
              disabled={
                (!currentDate && !date) ||
                currentDate === format(date, "yyyy-MM-dd")
              }
              onClick={() => {
                if (date) {
                  handleChangeDate(format(date, "yyyy-MM-dd"));
                }
                setIsOpen(false);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DatePopover;
