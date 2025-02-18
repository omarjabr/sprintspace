import { getInitials } from "@/lib/utils";
import { TaskUser } from "@/types";
import { Plus, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface AssignPopoverProps {
  users: {
    cardUsers: TaskUser[];
    users: TaskUser[];
  };
  handleAssignUser: (user: TaskUser) => void;
  handleUnassignUser: (user: TaskUser) => void;
}

const AssignPopover = ({
  users,
  handleAssignUser,
  handleUnassignUser,
}: AssignPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="w-8 h-8 aspect-square rounded-full bg-neutral-200 hover:bg-neutral-300"
        >
          <Plus />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4 w-full text-xs text-neutral-700">
          {/* search users */}
          <div className="w-full flex items-center justify-center">
            <p className="font-bold">Members</p>
          </div>
          <Input placeholder="Search members" />
          <div className="space-y-2">
            <p>Card members</p>
            <div className="space-y-2">
              {users.cardUsers.map((user) => (
                <Button
                  key={user.name}
                  type="button"
                  variant="ghost"
                  className="w-full text-start flex items-center justify-between gap-x-2 h-12 text-sm text-neutral-700"
                  onClick={() => handleUnassignUser(user)}
                >
                  <div className="flex items-center gap-x-2">
                    <Avatar
                      className="w-8 h-8 -ml-1 text-xs font-bold"
                      key={user.name}
                      title={`${user.full_name} (${user.email})`}
                    >
                      <AvatarImage
                        src={user.user_image}
                        alt={user.full_name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-blue-200 text-blue-800">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid">
                      <p>{user.full_name}</p>
                      <p className="text-xs text-neutral-500">{user.email}</p>
                    </div>
                  </div>
                  <X className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>
          {/* list of users */}
          <div className="space-y-2">
            <p>Board members</p>
            <div className="space-y-2">
              {users.users.map((user) => (
                <Button
                  key={user.name}
                  type="button"
                  variant="ghost"
                  className="w-full text-start flex items-start justify-start gap-x-2 h-12 text-sm text-neutral-700"
                  onClick={() => handleAssignUser(user)}
                >
                  <Avatar
                    className="w-8 h-8 -ml-1 text-xs font-bold"
                    key={user.name}
                    title={`${user.full_name} (${user.email})`}
                  >
                    <AvatarImage
                      src={user.user_image}
                      alt={user.full_name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-blue-200 text-blue-800">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid">
                    <p>{user.full_name}</p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AssignPopover;
