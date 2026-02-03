import * as React from "react"

import { cn } from "@/shared/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-base text-slate-900 placeholder:text-slate-500 hover:border-slate-400 focus:outline-none focus:ring-0 focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }