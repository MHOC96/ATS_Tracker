import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-md border border-white/8 bg-white/[0.02] px-3.5 py-3 text-[14px] text-mist transition-colors outline-none placeholder:text-fog focus-visible:border-mist disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-coral-red",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
