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
import { CARD_BG, CARD_BG_IMAGES } from "@/utils/constants";
import { useFrappeCreateDoc } from "frappe-react-sdk";
import { Check, Info, Loader2 } from "lucide-react";
import { useState } from "react";

interface BoardModalProps {
  mutate: () => void;
}

export function BoardModal({ mutate }: BoardModalProps) {
  const { createDoc, loading, error } = useFrappeCreateDoc();

  const [open, setOpen] = useState(false);
  const [selectedBg, setSelectedBg] = useState<string>("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("title") as string;
    const custom_bg = selectedBg || CARD_BG[0];
    await createDoc("Project Type", {
      project_type: name,
      custom_bg,
    }).then(() => {
      mutate();
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="h-24 rounded-md bg-slate-200 hover:bg-slate-300 transition-colors ease-in-out duration-200 cursor-pointer overflow-hidden text-slate-500"
        >
          <h3 className="text-sm">Create new board</h3>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Create board</DialogTitle>
            <DialogDescription>
              Create a new board to start managing your projects
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 pb-4">
            <div className="space-y-1">
              <Label htmlFor="title">Board title*</Label>
              <Input id="title" name="title" type="text" autoFocus />
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
              Create
            </Button>
          </DialogFooter>
        </form>
        {error && (
          <div className="flex items-center justify-center bg-red-400 text-white rounded-sm py-2 gap-2 text-sm">
            <Info size={16} />
            <p className="leading-0">{error.message}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
