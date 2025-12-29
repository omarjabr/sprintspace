import { useCardModal } from "@/hooks/use-card-modal";
import { cn, formatDate, setPriorityColor } from "@/lib/utils";
import { Task } from "@/types";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  MessageSquare,
  Paperclip,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface ListViewProps {
  tasks: Task[];
  mutate: () => void;
}

interface GroupedTasks {
  [status: string]: Task[];
}

const ListView = ({ tasks, mutate }: ListViewProps) => {
  const cardModal = useCardModal();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      Open: true,
      Working: true,
      "Pending Review": true,
      Overdue: true,
      Completed: true,
    }
  );

  // Group tasks by status
  const groupedTasks = useMemo(() => {
    const grouped: GroupedTasks = {
      Open: [],
      Working: [],
      "Pending Review": [],
      Overdue: [],
      Completed: [],
    };

    tasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    return grouped;
  }, [tasks]);

  const toggleGroup = (status: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      Open: "🚀",
      Working: "🛠️",
      "Pending Review": "⏳",
      Overdue: "⏰",
      Completed: "🎉",
    };
    return icons[status as keyof typeof icons] || "📋";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      Open: "text-gray-700 bg-gray-50",
      Working: "text-blue-700 bg-blue-50",
      "Pending Review": "text-yellow-700 bg-yellow-50",
      Overdue: "text-red-700 bg-red-50",
      Completed: "text-green-700 bg-green-50",
    };
    return colors[status as keyof typeof colors] || "text-gray-700 bg-gray-50";
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-auto">
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="grid grid-cols-12 gap-4 p-4 text-sm font-semibold text-gray-600">
          <div className="col-span-4">Task</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Priority</div>
          <div className="col-span-2">Due Date</div>
          <div className="col-span-2">Assigned To</div>
          <div className="col-span-1 text-center">Details</div>
        </div>
      </div>

      <div className="flex-1">
        {Object.entries(groupedTasks).map(([status, statusTasks]) => {
          if (statusTasks.length === 0) return null;

          const isExpanded = expandedGroups[status];

          return (
            <div key={status} className="border-b last:border-b-0">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(status)}
                className={cn(
                  "w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors",
                  getStatusColor(status)
                )}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                  <span className="text-2xl">{getStatusIcon(status)}</span>
                  <span className="font-semibold text-base">{status}</span>
                  <span className="text-sm text-gray-600">
                    ({statusTasks.length})
                  </span>
                </div>
              </button>

              {/* Task Rows */}
              {isExpanded && (
                <div className="divide-y">
                  {statusTasks.map((task) => (
                    <button
                      key={task.name}
                      onClick={() => cardModal.onOpen(task, mutate)}
                      className="w-full grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors text-left items-center"
                    >
                      {/* Task Name */}
                      <div className="col-span-4">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {task.subject}
                        </div>
                        {task.type && (
                          <div className="text-xs text-gray-500 mt-1">
                            {task.type}
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            getStatusColor(task.status)
                          )}
                        >
                          {task.status}
                        </span>
                      </div>

                      {/* Priority */}
                      <div className="col-span-1">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                            setPriorityColor(task.priority)
                          )}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Due Date */}
                      <div className="col-span-2">
                        {task.exp_end_date ? (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            {formatDate(task.exp_end_date)}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            No due date
                          </span>
                        )}
                      </div>

                      {/* Assigned To */}
                      <div className="col-span-2">
                        <div className="flex items-center -space-x-2">
                          {task.users?.slice(0, 3).map((user, index) => (
                            <Avatar
                              key={user?.email}
                              className="w-7 h-7 border-2 border-white"
                              title={`${user?.full_name} (${user?.email})`}
                            >
                              <AvatarImage
                                src={user?.user_image}
                                alt={user?.full_name}
                              />
                              <AvatarFallback className="bg-blue-200 text-blue-800 text-xs">
                                {user?.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {task.users && task.users.length > 3 && (
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 border-2 border-white text-xs font-medium text-gray-600">
                              +{task.users.length - 3}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Details (Comments & Attachments) */}
                      <div className="col-span-1 flex items-center justify-center gap-3">
                        {task.comments && task.comments.length > 0 && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-xs">
                              {
                                task.comments.filter(
                                  (c) => c.comment_type === "Comment"
                                ).length
                              }
                            </span>
                          </div>
                        )}
                        {task.attachments && task.attachments.length > 0 && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Paperclip className="h-4 w-4" />
                            <span className="text-xs">
                              {task.attachments.length}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListView;
