"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  onValueChange?: (value: string) => void;
  options?: SelectOption[];
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  children?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({ className, label, error, options = [], value, onChange, onValueChange, placeholder = "Pilih...", disabled, required, children }, ref) => {
    const handleValueChange = (newValue: string) => {
      if (onValueChange) {
        onValueChange(newValue);
      }
      if (onChange) {
        onChange({ target: { value: newValue } });
      }
    };

    const selectedOption = options.find((opt) => opt.value === value);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
            {label}
          </label>
        )}
        <SelectPrimitive.Root
          value={value}
          onValueChange={handleValueChange}
          disabled={disabled}
          required={required}
        >
          <SelectPrimitive.Trigger
            ref={ref}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-semibold text-[#111827] shadow-xs ring-offset-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
              error && "border-rose-500 focus:ring-rose-500",
              className
            )}
          >
            <SelectPrimitive.Value placeholder={placeholder}>
              {selectedOption ? selectedOption.label : value || placeholder}
            </SelectPrimitive.Value>
            <SelectPrimitive.Icon asChild>
              <ChevronDown className="h-4 w-4 opacity-60 text-[#7C3AED]" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              className="relative z-[100] max-h-72 w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white text-[#111827] shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 p-1 font-sans"
              position="popper"
              sideOffset={4}
            >
              <SelectPrimitive.Viewport className="p-1 w-full">
                {options.length > 0
                  ? options.map((opt) => (
                      <SelectPrimitive.Item
                        key={opt.value}
                        value={opt.value}
                        className="relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-xs font-semibold text-[#111827] outline-none hover:bg-[#F3E8FF] hover:text-[#7C3AED] focus:bg-[#F3E8FF] focus:text-[#7C3AED] data-[state=checked]:bg-[#F3E8FF] data-[state=checked]:text-[#7C3AED] data-[state=checked]:font-bold data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors"
                      >
                        <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
                          <SelectPrimitive.ItemIndicator>
                            <Check className="h-3.5 w-3.5 text-[#7C3AED]" />
                          </SelectPrimitive.ItemIndicator>
                        </span>
                        <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                      </SelectPrimitive.Item>
                    ))
                  : children}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
        {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";

const SelectRoot = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-semibold shadow-xs ring-offset-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 cursor-pointer text-[#111827]",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50 text-[#7C3AED]" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-[100] max-h-96 w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white text-[#111827] shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1 p-1 font-sans",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1 w-full",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-xs font-semibold outline-none hover:bg-[#F3E8FF] hover:text-[#7C3AED] focus:bg-[#F3E8FF] focus:text-[#7C3AED] data-[state=checked]:bg-[#F3E8FF] data-[state=checked]:text-[#7C3AED] data-[state=checked]:font-bold data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-3.5 w-3.5 text-[#7C3AED]" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

export {
  SelectRoot,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
}
