import { cn, setPriorityColor } from "@/lib/utils";
import { PRIORITIES } from "@/utils/constants";
import { Check } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface PriorityPopoverProps {
  currentPriority: string;
  handleChangePriority: (priority: string) => void;
}

const PriorityPopover = ({
  currentPriority,
  handleChangePriority,
}: PriorityPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "w-20 h-8 flex items-center justify-center rounded-sm px-3",
            setPriorityColor(currentPriority)
          )}
        >
          {currentPriority}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <div className="space-y-4 w-full text-xs text-neutral-700">
          <div className="w-full flex items-center justify-center">
            <p className="font-bold">Task Priority</p>
          </div>
          <div className="space-y-2">
            {PRIORITIES.map((priority) => (
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  "w-full text-start flex items-center justify-between gap-x-2 h-8 text-sm text-neutral-700",
                  setPriorityColor(priority)
                )}
                onClick={() => handleChangePriority(priority)}
                disabled={currentPriority === priority}
              >
                <div className="w-full flex items-center justify-between gap-x-2">
                  <p>{priority}</p>
                  {currentPriority === priority && <Check size={16} />}
                </div>
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PriorityPopover;
