"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const SelectTrigger = React.forwardRef(
  (
    { className, children, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    ref: React.Ref<React.ElementRef<typeof SelectPrimitive.Trigger>>
  ) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <span className="ml-auto h-4 w-4 opacity-50">
        <ChevronDown />
      </span>
    </SelectPrimitive.Trigger>
  )
);

const SelectContent = React.forwardRef(
  (
    { className, children, position = "popper", ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>,
    ref: React.Ref<React.ElementRef<typeof SelectPrimitive.Content>>
  ) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        className={cn(
          "relative z-50 max-h-96 min-w-[var(--select-trigger-width)] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md state:(data-closed):animate-out state:(data-closed):fade-out-0 state:(data-closed):zoom-out-95 state:(data-open):animate-in state:(data-open):fade-in-8 state:(data-open):zoom-in-90 state:(data-open):slide-in-from-top-1",
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" && "w-[var(--select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
);

const SelectItem = React.forwardRef(
  (
    { className, children, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>,
    ref: React.Ref<React.ElementRef<typeof SelectPrimitive.Item>>
  ) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
);

const SelectSeparator = React.forwardRef(
  (
    { className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>,
    ref: React.Ref<React.ElementRef<typeof SelectPrimitive.Separator>>
  ) => (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  )
);

const SelectScrollDownButton = React.forwardRef(
  (
    { className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>,
    ref: React.Ref<React.ElementRef<typeof SelectPrimitive.ScrollDownButton>>
  ) => (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
  )
);

const SelectScrollUpButton = React.forwardRef(
  (
    { className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>,
    ref: React.Ref<React.ElementRef<typeof SelectPrimitive.ScrollUpButton>>
  ) => (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
  )
);

type SelectComponent = React.ComponentType<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>> & {
  Group: typeof SelectPrimitive.Group;
  Value: typeof SelectPrimitive.Value;
  Trigger: typeof SelectTrigger;
  Content: typeof SelectContent;
  Item: typeof SelectItem;
  Separator: typeof SelectSeparator;
  ScrollDownButton: typeof SelectScrollDownButton;
  ScrollUpButton: typeof SelectScrollUpButton;
};

const Select = SelectPrimitive.Root as SelectComponent;

Select.Group = SelectPrimitive.Group;
Select.Value = SelectPrimitive.Value;
Select.Trigger = SelectTrigger;
Select.Content = SelectContent;
Select.Item = SelectItem;
Select.Separator = SelectSeparator;
Select.ScrollDownButton = SelectScrollDownButton;
Select.ScrollUpButton = SelectScrollUpButton;

export { Select, SelectTrigger, SelectContent, SelectItem, SelectSeparator, SelectScrollDownButton, SelectScrollUpButton };
