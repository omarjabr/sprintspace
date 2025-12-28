import { formatHTML } from "@/lib/utils";
import { Comment, Task } from "@/types";
import { format } from "date-fns";
import { Activity } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

interface ModalActivityProps {
  data: Task;
}

const ModalActivity = ({ data }: ModalActivityProps) => {
  const [length, setLength] = useState(3);

  const toggleShowMore = () => {
    if (length === 3) {
      setLength(data.comments.length);
    } else {
      setLength(3);
    }
  };

  return (
    <div className="flex items-start gap-x-3 w-full">
      <Activity className="h-5 w-5 mt-0.5 text-neutral-700" />
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-bold text-neutral-700 mb-2">Activity</p>
          <Button
            variant="ghost"
            className="text-sm h-8 rounded-sm bg-neutral-200 hover:bg-neutral-300"
            onClick={toggleShowMore}
          >
            {length === 3 ? "Show details" : "Hide details"}
          </Button>
        </div>
        <div className="space-y-4 text-sm">
          {data.comments &&
            data.comments
              .slice(0, length)
              .map((comment, idx) => (
                <>
                  {comment.comment_type === "Comment"
                    ? CommentComponent(comment)
                    : ActivityComponent(comment)}
                </>
              ))}
        </div>
        <div className="flex items-center gap-x-2 text-sm text-neutral-700">
          <span>
            Last modified on{" "}
            <span className="text-xs text-neutral-500">
              {format(data.modified, "dd MMM yyyy, hh:mm a")}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-x-2 text-sm text-neutral-700">
          <span>
            Created on{" "}
            <span className="text-xs text-neutral-500">
              {format(data.creation, "dd MMM yyyy, hh:mm a")}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ModalActivity;

const CommentComponent = (comment: Comment) => {
  return (
    <div className="w-full flex flex-col gap-y-2">
      <div className="flex items-center gap-x-2 ">
        <p className="font-bold">{comment.comment_by}</p>
        <span className="text-xs text-neutral-500">
          {format(comment.creation, "dd MMM yyyy, hh:mm a")}
        </span>
      </div>
      <div
        className="w-full bg-white rounded-lg px-2 py-1 shadow-sm"
        dangerouslySetInnerHTML={formatHTML(comment.content)}
      />
    </div>
  );
};

const ActivityComponent = (comment: Comment) => {
  return (
    <div className="w-full flex flex-col gap-y-1">
      <div className="flex items-center gap-x-2 ">
        <p className="font-bold">Omar</p>
        <div
          className="w-full text-neutral-500 text-xs"
          dangerouslySetInnerHTML={formatHTML(comment.content)}
        />
      </div>
      <p className="text-xs text-neutral-500">
        {format(comment.creation, "dd MMM yyyy, hh:mm a")}
      </p>
    </div>
  );
};
