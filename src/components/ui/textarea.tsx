import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[96px] w-full rounded-2xl border border-selection bg-background-dark/75 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus-visible:border-purple focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
