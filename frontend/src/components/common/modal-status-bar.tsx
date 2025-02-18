import { getInitials } from "@/lib/utils";
import { Task, TaskUser } from "@/types";
import {
  useFrappeGetDocList,
  useFrappePostCall,
  useFrappeUpdateDoc,
} from "frappe-react-sdk";
import { Check, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import AssignPopover from "./assign-popover";
import DatePopover from "./date-popover";
import PriorityPopover from "./priority-popover";
import TypePopover from "./type-popover";

interface ModalStatusBarProps {
  data: Task;
  mutate: () => void;
}

const ModalStatusBar = ({ data, mutate }: ModalStatusBarProps) => {
  const [users, setUsers] = useState<{
    cardUsers: TaskUser[];
    users: TaskUser[];
  }>({ cardUsers: data.users, users: [] });

  const [watching, setWatching] = useState(data.is_document_followed);
  const [priority, setPriority] = useState(data.priority);
  const [type, setType] = useState(data.type);
  const [dueDate, setDueDate] = useState(data.exp_end_date);

  const { data: usersList } = useFrappeGetDocList<TaskUser>("User", {
    fields: ["name", "full_name", "email", "user_image"],
  });

  const { call: assignUser } = useFrappePostCall(
    "frappe.desk.form.assign_to.add"
  );
  const { call: unassignUser } = useFrappePostCall(
    "frappe.desk.form.assign_to.remove"
  );

  const { call: followTask } = useFrappePostCall(
    "frappe.desk.form.document_follow.update_follow"
  );

  const { updateDoc: updatePriority } = useFrappeUpdateDoc();
  const { updateDoc: updateType } = useFrappeUpdateDoc();
  const { updateDoc: updateDueDate } = useFrappeUpdateDoc();

  const handleAssignUser = (user: TaskUser) => {
    setUsers({
      cardUsers: [...users.cardUsers, user],
      users: users.users.filter((u) => u.name !== user.name),
    });

    assignUser({
      doctype: "Task",
      name: data.name,
      assign_to: [user.name],
    }).then(() => {
      mutate();
    });
  };

  const handleUnassignUser = (user: TaskUser) => {
    setUsers({
      cardUsers: users.cardUsers.filter((u) => u.name !== user.name),
      users: [...users.users, user],
    });
    unassignUser({
      doctype: "Task",
      name: data.name,
      assign_to: user.name,
    }).then(() => {
      mutate();
    });
  };

  const handleFollow = () => {
    followTask({
      doctype: "Task",
      doc_name: data.name,
      following: data.is_document_followed ? "false" : "true",
    }).then(() => {
      setWatching(!watching);
      mutate();
    });
  };

  const handleChangePriority = (priority: string) => {
    updatePriority("Task", data.name, {
      priority,
    }).then(() => {
      setPriority(priority);
      mutate();
    });
  };

  const handleChangeType = (type: string) => {
    updateType("Task", data.name, {
      type,
    }).then(() => {
      setType(type);
      mutate();
    });
  };

  const handleChangeDueDate = (date: string) => {
    updateDueDate("Task", data.name, {
      exp_end_date: date,
    }).then(() => {
      setDueDate(date);
      mutate();
    });
  };

  useEffect(() => {
    if (usersList) {
      // remove data.users from usersList
      const nonAssignedUsers = usersList.filter(
        (user) =>
          !data.users.find((assignedUser) => assignedUser.name === user.name)
      );

      setUsers({ cardUsers: data.users, users: nonAssignedUsers });
    }

    setWatching(data.is_document_followed);
    setPriority(data.priority);
    setType(data.type);
    setDueDate(data.exp_end_date);
  }, [
    usersList,
    data.is_document_followed,
    data.priority,
    data.type,
    data.exp_end_date,
  ]);

  return (
    <div className="flex items-start gap-x-3 w-full">
      <div className="h-5 w-5 mt-0.5 text-neutral-700" />
      <div className="space-y-4 w-full text-xs text-neutral-700">
        <div className="flex items-center gap-x-8">
          <div className="space-y-1">
            <p className="font-bold">Members</p>
            <div className="flex items-center gap-x-1">
              {users?.cardUsers.length > 0 &&
                users.cardUsers.map((user) => (
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
                ))}
              <AssignPopover
                users={users}
                handleAssignUser={handleAssignUser}
                handleUnassignUser={handleUnassignUser}
              />
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-bold">Priority</p>
            <div className="flex items-center gap-x-1 h-full">
              <PriorityPopover
                currentPriority={priority}
                handleChangePriority={handleChangePriority}
              />
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-bold">Type</p>
            <div className="flex items-center gap-x-1 h-full">
              <TypePopover
                currentType={type}
                handleChangeType={handleChangeType}
              />
            </div>
          </div>

          <div className="space-y-1">
            <p className="font-bold">Notifications</p>
            <Button
              type="button"
              variant="ghost"
              className="bg-neutral-200 hover:bg-neutral-300 rounded-sm py-2 h-8"
              onClick={handleFollow}
            >
              <Eye className="mt-0.5" />
              {watching ? "Watching" : "Watch"}
              {watching && <Check className="mt-0.5" />}
            </Button>
          </div>
        </div>
        <div className="space-y-1 w-fit">
          <p className="font-bold">Due date</p>
          <DatePopover
            currentDate={dueDate}
            status={data.status}
            handleChangeDate={handleChangeDueDate}
          />
        </div>
      </div>
    </div>
  );
};

export default ModalStatusBar;
