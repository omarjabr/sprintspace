import { cn } from "@/lib/utils";
import { forwardRef, KeyboardEventHandler } from "react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface FormTextareaProps {
  id: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errors?: Record<string, string[] | undefined>;
  className?: string;
  onBlur?: () => void;
  onClick?: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement> | undefined;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      id,
      label,
      placeholder,
      required = false,
      disabled = false,
      errors,
      className,
      onBlur,
      onClick,
      onKeyDown,
      defaultValue,
      onChange,
    },
    ref
  ) => {
    // const { isSubmitting } = useFormState();
    return (
      <div className="space-y-2 w-full">
        <div className="space-y-1 w-full">
          {label && (
            <Label
              htmlFor={id}
              className="text-xs font-semibold text-neutral-700"
            >
              {label}
            </Label>
          )}
          <Textarea
            id={id}
            name={id}
            ref={ref}
            placeholder={placeholder}
            onChange={onChange}
            required={required}
            disabled={disabled}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            onClick={onClick}
            defaultValue={defaultValue}
            className={cn(
              "bg-white resize-none focus-visible:ring-0 focus-visible:ring-offset-0 ring-0 focus:ring-0 outline-none shadow-sm",
              className
            )}
            aria-describedby={errors ? `${id}-error` : undefined}
          />
        </div>
        {errors && errors[id] && (
          <div
            id={`${id}-error`}
            className="text-xs font-medium text-red-600"
            role="alert"
          >
            {errors[id]?.join(", ")}
          </div>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";
