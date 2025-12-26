import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useCardModal } from "@/hooks/use-card-modal";
import { Task } from "@/types";
import { useFrappeGetCall } from "frappe-react-sdk";
import ModalActions from "../common/modal-actions";
import ModalActivity from "../common/modal-activity";
import ModalAttachments from "../common/modal-attachments";
import ModalChecklists from "../common/modal-checklists";
import ModalDescription from "../common/modal-description";
import ModalHeader from "../common/modal-header";
import ModalLabels from "../common/modal-labels";
import ModalStatusBar from "../common/modal-status-bar";

export function TaskModal() {
  const task = useCardModal((state) => state.task);
  const mutate = useCardModal((state) => state.mutate);
  const isOpen = useCardModal((state) => state.isOpen);
  const onClose = useCardModal((state) => state.onClose);

  // Always call hooks unconditionally (React Rules of Hooks)
  const { data: detailResp, mutate: mutateDetail } = useFrappeGetCall<{
    message: { ok: boolean; data?: Task; error?: { code: string; message: string } };
  }>(
    "sprintspace.api.tasks.get_task_detail",
    task ? { task_name: task.name } : undefined,
    // Skip the request when task is not set
    task ? undefined : null
  );

  // Early return AFTER all hooks
  if (!task) {
    return null;
  }

  const detailTask =
    detailResp?.message?.ok && detailResp.message.data ? detailResp.message.data : task;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-y-scroll max-h-[95vh]">
        {/* Visually hidden title and description for accessibility */}
        <DialogTitle className="sr-only">{detailTask.subject}</DialogTitle>
        <DialogDescription className="sr-only">
          Task details for {detailTask.subject}
        </DialogDescription>
        <ModalHeader data={detailTask} mutate={mutate} />
        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4">
          <div className="col-span-3">
            <div className="w-full space-y-6">
              <ModalStatusBar data={detailTask} mutate={mutate} />
              <ModalLabels
                task={detailTask}
                onRefresh={() => {
                  mutate();
                  mutateDetail();
                }}
              />
              <ModalChecklists
                task={detailTask}
                onRefresh={() => {
                  mutate();
                  mutateDetail();
                }}
              />
              <ModalDescription data={detailTask} mutate={mutate} />
              {detailTask.attachments && detailTask.attachments.length > 0 && (
                <ModalAttachments data={detailTask} mutate={mutate} />
              )}
              <ModalActivity
                data={detailTask}
                onRefresh={() => {
                  mutate();
                  mutateDetail();
                }}
              />
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
