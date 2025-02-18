import { useFrappePostCall } from "frappe-react-sdk";
import { Plus, X } from "lucide-react";
import { ElementRef, forwardRef, useRef } from "react";
import { useParams } from "react-router-dom";
import { FormTextarea } from "./forms/form-textarea";
import { Button } from "./ui/button";

interface CardFormProps {
  isEditing: boolean;
  disableEditing: () => void;
  enableEditing: () => void;
  status: string;
  mutate: () => void;
}

export const CardForm = forwardRef<HTMLTextAreaElement, CardFormProps>(
  ({ isEditing, disableEditing, enableEditing, status, mutate }, ref) => {
    // const { createDoc, error, loading } = useFrappeCreateDoc();
    const {
      call: addCard,
      error,
      loading,
    } = useFrappePostCall("sprintspace.api.tasks.add_card");

    const { id } = useParams();
    const formRef = useRef<ElementRef<"form">>(null);

    const onKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        disableEditing();
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    // def add_card(subject, status, project):

    const onSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const subject = formData.get("subject") as string;
      const status = formData.get("status") as string;
      addCard({
        subject,
        status,
        project: id,
      })
        .then(() => {
          disableEditing();
          formRef.current?.reset();
          mutate();
        })
        .catch((error) => {
          console.error(error);
        });
    };

    if (isEditing) {
      return (
        <form
          ref={formRef}
          onSubmit={(e) => onSubmit(e)}
          className="m-1 py-0.5 px-1 space-y-4"
        >
          <FormTextarea
            id="subject"
            onKeyDown={(e) => onKeyDown(e)}
            ref={ref}
            placeholder="Enter a title for this card..."
          />
          <input hidden id="status" name="status" value={status} />
          <div className="flex items-center gap-x-1">
            <Button
              type="submit"
              className="h-auto px-2 py-1.5 justify-start text-sm"
              size="sm"
            >
              Add card
            </Button>
            <Button onClick={disableEditing} size="sm" variant="ghost">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </form>
      );
    }

    return (
      <div className="pt-2 px-2">
        <Button
          onClick={enableEditing}
          className="h-auto px-2 py-1.5 w-full justify-start text-sm text-muted-foreground"
          size="sm"
          variant="ghost"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add a card
        </Button>
      </div>
    );
  }
);

CardForm.displayName = "CardForm";
