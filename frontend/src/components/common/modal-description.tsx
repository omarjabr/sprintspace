import { Task } from "@/types";
import { useFrappeUpdateDoc } from "frappe-react-sdk";
import { AlignLeft } from "lucide-react";
import { ElementRef, useEffect, useRef, useState } from "react";
import Editor from "../rich-text/editor";
import Viewer from "../rich-text/viewer";
import { Button } from "../ui/button";

interface ModalDescriptionProps {
  data: Task;
  mutate: () => void;
}

const ModalDescription = ({ data, mutate }: ModalDescriptionProps) => {
  const { updateDoc, error, loading } = useFrappeUpdateDoc();
  const [description, setDescription] = useState(data.description);

  const inputRef = useRef<ElementRef<"textarea">>(null);
  const formRef = useRef<ElementRef<"form">>(null);

  const [isEditing, setIsEditing] = useState(false);

  const disableEditing = () => {
    setIsEditing(false);
  };

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const onBlur = () => {
    inputRef.current?.form?.requestSubmit();
  };

  const onCancel = () => {
    setDescription(data.description);
    disableEditing();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (data.description === description || !description) {
      disableEditing();
      return;
    }

    setDescription(description);
    updateDoc("Task", data.name, { description: description })
      .then(() => {
        mutate();
        disableEditing();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    setDescription(data.description);
  }, [data.description]);

  return (
    <div className="flex items-start gap-x-3 w-full">
      <AlignLeft className="h-5 w-5 mt-0.5 text-neutral-700" />
      <div className="w-full">
        <p className="font-bold text-neutral-700 mb-2">Description</p>
        {isEditing ? (
          <form ref={formRef} onSubmit={onSubmit} className="space-y-2">
            <Editor content={description} onChange={setDescription} />
            <div className="flex items-center gap-x-2">
              <Button type="submit" disabled={loading}>
                Save
              </Button>
              <Button variant="ghost" type="button" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div
            role="button"
            className="min-h-[78px] bg-neutral-200 text-sm py-3 px-3.5 rounded-md cursor-pointer"
            onClick={enableEditing}
          >
            {data.description ? (
              <Viewer content={description} style="prose" />
            ) : (
              "Add a more detailed description…"
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalDescription;
