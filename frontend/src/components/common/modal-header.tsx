import { Task } from "@/types";
import { useFrappeUpdateDoc } from "frappe-react-sdk";
import { Eye, Layout } from "lucide-react";
import { ElementRef, useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";

interface ModalHeaderProps {
  data: Task;
  mutate: () => void;
}

const ModalHeader = ({ data, mutate }: ModalHeaderProps) => {
  const { updateDoc, error, loading } = useFrappeUpdateDoc();
  const [title, setTitle] = useState(data.subject);

  const inputRef = useRef<ElementRef<"input">>(null);
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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;

    if (data.subject === title || !title) {
      disableEditing();
      return;
    }

    setTitle(title);
    updateDoc("Task", data.name, { subject: title })
      .then(() => {
        mutate();
        disableEditing();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    setTitle(data.subject);
  }, [data.subject]);

  if (isEditing) {
    return (
      <div className="flex items-start gap-x-3 mb-4 w-full">
        <Layout className="w-5 h-5 mt-1 text-neutral-700" />
        <div className="w-full">
          <form ref={formRef} onSubmit={onSubmit}>
            <Input
              ref={inputRef}
              onBlur={onBlur}
              onKeyDown={(e) => onKeyDown(e)}
              disabled={loading}
              id="title"
              name="title"
              defaultValue={title}
              className="px-2 py-1 h-7 text-xl md:text-xl font-bold bg-transparent text-neutral-700 border-transparent relative -left-1.5 w-[95%] focus-visible:bg-white focus-visible:border-input mb-0.5 truncate shadow-none"
            />
          </form>
          <div className="flex items-center gap-x-2 text-muted-foreground">
            <p className="text-sm text-muted-foreground">
              is list <span className="underline">{data.status}</span>
            </p>
            {data?.is_document_followed && <Eye className="w-4 h-4 mt-0.5" />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-start gap-x-3 mb-4 w-full"
      role="button"
      onClick={enableEditing}
    >
      <Layout className="w-5 h-5 mt-1 text-neutral-700" />
      <div className="w-full">
        <h2 className="text-xl md:text-xl font-bold text-neutral-700">
          {title}
        </h2>
        <div className="flex items-center gap-x-2 text-muted-foreground">
          <p className="text-sm text-muted-foreground">
            is list <span className="underline">{data.status}</span>
          </p>
          {data?.is_document_followed && <Eye className="w-4 h-4 mt-0.5" />}
        </div>
      </div>
    </div>
  );
};

export default ModalHeader;
