import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { useFormState } from "react-hook-form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errors?: Record<string, string[] | undefined>;
  className?: string;
  defaultValue?: string;
  onBlur?: () => void;
}

export const CustomFormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      id,
      label,
      type,
      placeholder,
      required,
      disabled,
      errors,
      className,
      defaultValue = "",
      onBlur,
    },
    ref
  ) => {
    const { isSubmitting } = useFormState();
    return (
      <div className="space-y-2">
        <div className="space-y-1">
          {label && (
            <Label htmlFor={id} className="text-xs font-bold text-neutral-700">
              {label}
            </Label>
          )}
          <Input
            onBlur={onBlur}
            defaultValue={defaultValue}
            ref={ref}
            required={required}
            name={id}
            id={id}
            placeholder={placeholder}
            type={type}
            disabled={isSubmitting || disabled}
            className={cn("text-sm px-2 py-1 h-7", className)}
            aria-describedby={`${id}-error`}
          />
        </div>
      </div>
    );
  }
);

CustomFormInput.displayName = "CustomFormInput";
