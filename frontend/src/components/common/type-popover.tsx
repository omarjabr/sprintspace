import { cn } from "@/lib/utils";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { Check, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface TypePopoverProps {
  currentType: string;
  handleChangeType: (type: string) => void;
}

const TypePopover = ({ currentType, handleChangeType }: TypePopoverProps) => {
  const { data } = useFrappeGetDocList<{
    name: string;
  }>("Task Type", {
    fields: ["name"],
  });
  return (
    <Popover>
      <PopoverTrigger asChild>
        {currentType ? (
          <Button
            type="button"
            variant="ghost"
            className="w-20 h-8 flex items-center justify-center rounded-sm px-3bg-slate-200 text-slate-800  px-3 bg-slate-200 hover:bg-slate-300"
          >
            {currentType}
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="w-8 h-8 aspect-square bg-neutral-200 hover:bg-neutral-300 rounded-sm"
          >
            <Plus />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <div className="space-y-4 w-full text-xs text-neutral-700">
          <div className="w-full flex items-center justify-center">
            <p className="font-bold">Task Type</p>
          </div>
          <div className="space-y-2">
            {data &&
              data.map((type) => (
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    "w-full text-start flex items-center justify-between gap-x-2 h-8 text-sm text-neutral-700 bg-neutral-200 hover:bg-neutral-300"
                  )}
                  onClick={() => handleChangeType(type.name)}
                  disabled={currentType === type.name}
                >
                  <div className="w-full flex items-center justify-between gap-x-2">
                    <p>{type.name}</p>
                    {currentType === type.name && <Check size={16} />}
                  </div>
                </Button>
              ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TypePopover;
