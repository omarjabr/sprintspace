import { Clock, Paperclip, Tag, User } from "lucide-react";
import { Button } from "../ui/button";

interface ModalActionsProps {}

function ModalActions({}: ModalActionsProps) {
  const actions = [
    {
      label: "Members",
      icon: User,
      action: () => {},
    },
    {
      label: "Types",
      icon: Tag,
      action: () => {},
    },
    {
      label: "Dates",
      icon: Clock,
      action: () => {},
    },
    {
      label: "Attachments",
      icon: Paperclip,
      action: () => {},
    },
  ];
  return (
    <div className="w-full flex flex-col space-y-2">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant="ghost"
          onClick={action.action}
          className="w-full justify-start bg-neutral-200 text-neutral-800 rounded-sm h-8 hover:bg-neutral-300"
        >
          <action.icon className="w-6 h-6 mt-0.5" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}

export default ModalActions;
