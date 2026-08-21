import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 appearance-none rounded-md border border-white/8 bg-obsidian px-3.5 py-3 text-[14px] text-mist caret-mist shadow-none outline-none transition-[border-color,color] placeholder:text-fog",
        "hover:border-white/12 hover:bg-obsidian hover:text-mist",
        "focus:border-mist focus:bg-obsidian focus:text-mist focus:outline-none focus:ring-0",
        "focus-visible:border-mist focus-visible:bg-obsidian focus-visible:text-mist focus-visible:ring-0",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-coral-red",
        className
      )}
      {...props}
    />
  )
}

export { Input }
