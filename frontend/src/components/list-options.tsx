import { PopoverClose } from "@radix-ui/react-popover";
import { MoreHorizontal, X } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface ListOptionsProps {
  onAddCard?: () => void;
}

const ListOptions = ({ onAddCard }: ListOptionsProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="h-auto w-auto p-2" variant="ghost">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="px-0 pt-3 pb-3" side="bottom" align="start">
        <div className="text-sm font-medium text-center text-neutral-600 pb-4">
          List actions
        </div>
        <PopoverClose asChild>
          <Button
            className="h-auto w-auto p-2 absolute top-2 right-2 text-neutral-600"
            variant="ghost"
          >
            <X className="w-4 h-4" />
          </Button>
        </PopoverClose>
        <Button
          className="rounded-none w-full h-auto p-2 px-5 justify-start font-normal text-sm"
          variant="ghost"
          onClick={onAddCard}
        >
          Add Card
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default ListOptions;
