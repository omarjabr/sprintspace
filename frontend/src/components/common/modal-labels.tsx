import { SprintSpaceLabel, Task } from "@/types";
import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface ModalLabelsProps {
  task: Task;
  onRefresh: () => void;
}

export default function ModalLabels({ task, onRefresh }: ModalLabelsProps) {
  const { data: labelsResp, mutate: mutateLabels } = useFrappeGetCall<{
    message: { ok: boolean; data?: SprintSpaceLabel[]; error?: { code: string; message: string } };
  }>("sprintspace.api.tasks.get_labels", { project: task.project });

  const { data: taskLabelsResp, mutate: mutateTaskLabels } = useFrappeGetCall<{
    message: { ok: boolean; data?: SprintSpaceLabel[]; error?: { code: string; message: string } };
  }>("sprintspace.api.tasks.get_task_labels", { task_name: task.name });

  const labels = labelsResp?.message?.ok ? labelsResp.message.data || [] : [];
  const taskLabels = taskLabelsResp?.message?.ok ? taskLabelsResp.message.data || [] : [];

  const taskLabelSet = useMemo(() => new Set(taskLabels.map((l) => l.name)), [taskLabels]);

  const { call: addTaskLabel } = useFrappePostCall("sprintspace.api.tasks.add_task_label");
  const { call: removeTaskLabel } = useFrappePostCall("sprintspace.api.tasks.remove_task_label");
  const { call: createLabel, loading: creating } = useFrappePostCall("sprintspace.api.tasks.create_label");

  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("#3b82f6");

  const toggle = async (labelName: string, checked: boolean) => {
    if (checked) {
      await addTaskLabel({ task_name: task.name, label: labelName });
    } else {
      await removeTaskLabel({ task_name: task.name, label: labelName });
    }
    mutateTaskLabels();
    onRefresh();
  };

  return (
    <div className="flex items-start gap-x-3 w-full">
      <div className="h-5 w-5 mt-0.5 text-neutral-700" />
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-bold text-neutral-700 mb-2">Labels</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="rounded-sm bg-neutral-200 hover:bg-neutral-300 py-2 h-8"
              >
                Add
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <div className="text-sm font-semibold text-neutral-700">Labels</div>
                <div className="space-y-2">
                  {labels.map((l) => (
                    <div key={l.name} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
                        <span className="text-sm">{l.title}</span>
                      </div>
                      <Checkbox
                        checked={taskLabelSet.has(l.name)}
                        onCheckedChange={(v) => toggle(l.name, Boolean(v))}
                      />
                    </div>
                  ))}
                  {labels.length === 0 && (
                    <div className="text-sm text-muted-foreground">No labels yet</div>
                  )}
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="text-sm font-semibold text-neutral-700">Create label</div>
                  <Input
                    placeholder="Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="color"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="h-9 w-16 rounded"
                    />
                    <Button
                      type="button"
                      disabled={!newTitle.trim() || creating}
                      onClick={async () => {
                        await createLabel({
                          project: task.project,
                          title: newTitle.trim(),
                          color: newColor,
                        });
                        setNewTitle("");
                        mutateLabels();
                      }}
                    >
                      Create
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-wrap gap-2">
          {taskLabels.map((l) => (
            <div
              key={l.name}
              className="px-2 py-1 rounded-sm text-xs text-white"
              style={{ backgroundColor: l.color }}
              title={l.title}
            >
              {l.title}
            </div>
          ))}
          {taskLabels.length === 0 && (
            <div className="text-sm text-muted-foreground">No labels</div>
          )}
        </div>
      </div>
    </div>
  );
}



