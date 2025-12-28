import { useCardModal } from "@/hooks/use-card-modal";
import {
  cn,
  formatDate,
  formatDueDateColor,
  getInitials,
  setPriorityColor,
} from "@/lib/utils";
import { Task } from "@/types";
import { Draggable } from "@hello-pangea/dnd";
import {
  AlarmClockOff,
  Clock,
  Eye,
  MessageSquare,
  Paperclip,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface TaskCardProps {
  task: Task;
  index: number;
  mutate: () => void;
}

const TaskCard = ({ task, index, mutate }: TaskCardProps) => {
  const cardModal = useCardModal();

  const comments = task.comments.filter(
    (comment) => comment.comment_type === "Comment"
  );

  return (
    <Draggable draggableId={task.name} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          role="button"
          onClick={() => {
            cardModal.onOpen(task, mutate);
          }}
          className="px-2.5 py-1.5 bg-white rounded-md mx-2 border-2 border-transparent hover:border-blue-400 cursor-pointer shadow-sm flex flex-col gap-1"
        >
          <div className="flex items-center gap-2">
            {task?.type && (
              <div
                className={cn(
                  "text-xs px-2 py-0 rounded-sm min-w-14 text-center bg-slate-200 text-slate-800 hover:bg-slate-300"
                )}
              >
                {task.type}
              </div>
            )}
            <div
              className={cn(
                "text-xs px-2 py-0 rounded-sm min-w-14 text-center",
                setPriorityColor(task.priority)
              )}
            >
              {task.priority}
            </div>
          </div>
          <div className="">
            <div className="text-sm text-neutral-500">{task.subject}</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-x-3">
              {task.is_document_followed && <Eye className="h-4 w-4" />}
              <div>
                {task?.exp_end_date ? (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs px-2 py-1 rounded-sm min-w-14 text-center",
                      formatDueDateColor(task.exp_end_date, task.status)
                    )}
                  >
                    <Clock size={12} />
                    {formatDate(task.exp_end_date)}
                  </div>
                ) : (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-[10px] text-red-300"
                    )}
                  >
                    <AlarmClockOff size={12} />
                    {/* <ClockAlert size={10} /> */}
                    No due date
                  </div>
                )}
              </div>
              {comments.length > 0 && (
                <div className="flex items-center text-xs gap-1">
                  <MessageSquare size={12} />
                  {comments.length}
                </div>
              )}
              {task.attachments.length > 0 && (
                <div className="flex items-center text-xs gap-1">
                  <Paperclip size={12} />
                  {task.attachments.length}
                </div>
              )}
            </div>
            <div className="flex items-center">
              {task?.users?.map((user, index) => (
                <Avatar
                  key={index}
                  className="w-6 h-6 -ml-1 text-xs font-bold"
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
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
