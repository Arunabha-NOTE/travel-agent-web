import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-selection bg-background-dark/75 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus-visible:border-purple focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
