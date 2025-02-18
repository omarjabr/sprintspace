import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Board } from "@/types";
import { CARD_BG, CARD_BG_IMAGES } from "@/utils/constants";
import { useFrappeGetDoc, useFrappeUpdateDoc } from "frappe-react-sdk";
import { Check, Edit2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface EditBoardModalProps {
  id: string;
  mutate: () => void;
}

export function EditBoardModal({ id, mutate }: EditBoardModalProps) {
  const { data: board } = useFrappeGetDoc<Board>("Project Type", id);

  const { updateDoc, loading, error, reset } = useFrappeUpdateDoc();

  const [open, setOpen] = useState(false);
  const [selectedBg, setSelectedBg] = useState<string>("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!board) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get("title") as string;
    const custom_bg = selectedBg;
    await updateDoc("Project Type", board.name, {
      // name,
      project_type: name,
      custom_bg,
    });
    reset();
    mutate();
    setOpen(false);
  };

  useEffect(() => {
    setSelectedBg(board?.custom_bg || "");
  }, [board]);

  if (!board) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" className="p-1 h-auto w-auto">
          <Edit2 size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Edit board</DialogTitle>
            <DialogDescription>Edit this board</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 pb-4">
            <div className="space-y-1">
              <Label htmlFor="title">Board title*</Label>
              <Input
                id="title"
                name="title"
                type="text"
                defaultValue={board?.name}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm">Background</p>
              <div className="grid grid-cols-5 gap-2">
                {CARD_BG_IMAGES.map((bg, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full h-8 text-white rounded-sm flex items-center justify-center group"
                    style={{
                      backgroundImage: `url(${bg})`,
                    }}
                    onClick={() => setSelectedBg(bg)}
                  >
                    {selectedBg === bg && <Check size={12} />}
                    {selectedBg !== bg && (
                      <Check
                        size={12}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out"
                      />
                    )}
                  </button>
                ))}
              </div>
              <div className="w-full h-[1px] bg-slate-200" />
              <div className="grid grid-cols-5 gap-2">
                {CARD_BG.map((bg, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full h-8 text-white rounded-sm flex items-center justify-center group"
                    style={{ backgroundColor: bg }}
                    onClick={() => setSelectedBg(bg)}
                  >
                    {selectedBg === bg && <Check size={12} />}
                    {selectedBg !== bg && (
                      <Check
                        size={12}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 size={16} className="mr-2 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
