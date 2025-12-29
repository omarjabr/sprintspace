import { useCardModal } from "@/hooks/use-card-modal";
import { useFrappeDeleteDoc } from "frappe-react-sdk";
import { Clock, Paperclip, Tag, Trash2, User } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { toast } from "../ui/toast";

interface ModalActionsProps {}

function ModalActions({}: ModalActionsProps) {
  const task = useCardModal((state) => state.task);
  const mutate = useCardModal((state) => state.mutate);
  const onClose = useCardModal((state) => state.onClose);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { deleteDoc, loading: isDeleting } = useFrappeDeleteDoc();

  const handleDelete = async () => {
    if (!task) return;

    try {
      await deleteDoc("Task", task.name);
      toast.success("Task deleted successfully");
      mutate();
      onClose();
    } catch (error) {
      toast.error("Failed to delete task");
      console.error(error);
    }
  };
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
    <>
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
        <div className="pt-4 border-t mt-4">
          <Button
            variant="ghost"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isDeleting}
            className="w-full justify-start bg-red-100 text-red-800 rounded-sm h-8 hover:bg-red-200"
          >
            <Trash2 className="w-6 h-6 mt-0.5" />
            Delete Task
          </Button>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{task?.subject}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default ModalActions;
