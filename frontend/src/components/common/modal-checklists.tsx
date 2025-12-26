import { SprintSpaceChecklist, Task } from "@/types";
import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import { useState } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";

interface ModalChecklistsProps {
  task: Task;
  onRefresh: () => void;
}

export default function ModalChecklists({ task, onRefresh }: ModalChecklistsProps) {
  const { data: resp, mutate } = useFrappeGetCall<{
    message: { ok: boolean; data?: SprintSpaceChecklist[]; error?: { code: string; message: string } };
  }>("sprintspace.api.tasks.get_checklists", { task_name: task.name });

  const checklists = resp?.message?.ok ? resp.message.data || [] : [];

  const { call: addChecklist } = useFrappePostCall("sprintspace.api.tasks.add_checklist");
  const { call: addItem } = useFrappePostCall("sprintspace.api.tasks.add_checklist_item");
  const { call: setChecked } = useFrappePostCall("sprintspace.api.tasks.set_checklist_item_checked");
  const { call: deleteItem } = useFrappePostCall("sprintspace.api.tasks.delete_checklist_item");

  const [newChecklistTitle, setNewChecklistTitle] = useState("");

  return (
    <div className="flex items-start gap-x-3 w-full">
      <div className="h-5 w-5 mt-0.5 text-neutral-700" />
      <div className="w-full space-y-3">
        <p className="font-bold text-neutral-700 mb-2">Checklists</p>

        <div className="flex gap-2">
          <Input
            placeholder="New checklist"
            value={newChecklistTitle}
            onChange={(e) => setNewChecklistTitle(e.target.value)}
          />
          <Button
            type="button"
            disabled={!newChecklistTitle.trim()}
            onClick={async () => {
              await addChecklist({ task_name: task.name, title: newChecklistTitle.trim() });
              setNewChecklistTitle("");
              mutate();
              onRefresh();
            }}
          >
            Add
          </Button>
        </div>

        {checklists.map((cl) => (
          <ChecklistCard
            key={cl.name}
            checklist={cl}
            onAddItem={async (title) => {
              await addItem({ checklist: cl.name, title });
              mutate();
              onRefresh();
            }}
            onToggle={async (itemName, checked) => {
              await setChecked({ item_name: itemName, checked: checked ? 1 : 0 });
              mutate();
              onRefresh();
            }}
            onDeleteItem={async (itemName) => {
              await deleteItem({ item_name: itemName });
              mutate();
              onRefresh();
            }}
          />
        ))}

        {checklists.length === 0 && (
          <div className="text-sm text-muted-foreground">No checklists</div>
        )}
      </div>
    </div>
  );
}

function ChecklistCard({
  checklist,
  onAddItem,
  onToggle,
  onDeleteItem,
}: {
  checklist: SprintSpaceChecklist;
  onAddItem: (title: string) => Promise<void>;
  onToggle: (itemName: string, checked: boolean) => Promise<void>;
  onDeleteItem: (itemName: string) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const done = checklist.items?.filter((i) => i.checked === 1).length || 0;
  const total = checklist.items?.length || 0;

  return (
    <div className="rounded-md bg-neutral-100 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-sm text-neutral-800">{checklist.title}</div>
        <div className="text-xs text-neutral-500">
          {done}/{total}
        </div>
      </div>

      <div className="space-y-2">
        {checklist.items?.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={item.checked === 1}
                onCheckedChange={(v) => onToggle(item.name, Boolean(v))}
              />
              <span className="text-sm">{item.title}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="h-7 px-2"
              onClick={() => onDeleteItem(item.name)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input placeholder="Add item" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button
          type="button"
          disabled={!title.trim()}
          onClick={async () => {
            await onAddItem(title.trim());
            setTitle("");
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}



