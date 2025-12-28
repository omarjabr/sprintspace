import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCardModal } from "@/hooks/use-card-modal";
import ModalActions from "../common/modal-actions";
import ModalActivity from "../common/modal-activity";
import ModalAttachments from "../common/modal-attachments";
import ModalDescription from "../common/modal-description";
import ModalHeader from "../common/modal-header";
import ModalStatusBar from "../common/modal-status-bar";

export function TaskModal() {
  // const { updateDoc, loading, error } = useFrappeUpdateDoc();

  const task = useCardModal((state) => state.task);
  const mutate = useCardModal((state) => state.mutate);
  const isOpen = useCardModal((state) => state.isOpen);
  const onClose = useCardModal((state) => state.onClose);

  if (!task) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        aria-describedby="modal-description"
        className="overflow-y-scroll max-h-[95vh]"
      >
        <ModalHeader data={task} mutate={mutate} />
        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4">
          <div className="col-span-3">
            <div className="w-full space-y-6">
              <ModalStatusBar data={task} mutate={mutate} />
              <ModalDescription data={task} mutate={mutate} />
              {task.attachments && task.attachments.length > 0 && (
                <ModalAttachments data={task} mutate={mutate} />
              )}
              <ModalActivity data={task} />
            </div>
          </div>
          <div>
            <ModalActions />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
