import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center bg-clip-padding text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-mist/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "rounded-md bg-acid-lime text-void font-[510] text-[14px] tracking-[-0.011em] shadow-[rgba(0,0,0,0.01)_0px_5px_2px_0px,rgba(0,0,0,0.04)_0px_3px_2px_0px,rgba(0,0,0,0.07)_0px_1px_1px_0px] hover:bg-acid-lime/90",
        outline:
          "rounded-md border border-graphite bg-transparent text-mist font-normal text-[13px] hover:border-smoke hover:text-paper",
        secondary:
          "rounded-full bg-white/5 text-mist font-normal text-[13px] hover:bg-white/8 hover:text-paper",
        ghost:
          "rounded-md text-mist font-normal text-[13px] hover:text-paper hover:underline",
        destructive:
          "rounded-md bg-coral-red/10 text-coral-red font-normal text-[13px] hover:bg-coral-red/20",
        link: "text-mist underline-offset-4 hover:text-paper hover:underline",
        pill:
          "rounded-full bg-paper text-void font-[510] text-[13px] hover:bg-bone",
      },
      size: {
        default: "h-9 gap-1.5 px-4 py-2.5",
        xs: "h-6 gap-1 rounded-md px-2 text-xs",
        sm: "h-8 gap-1.5 rounded-md px-3 text-[13px]",
        lg: "h-10 gap-2 rounded-md px-5 text-[15px]",
        icon: "size-9 rounded-md",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
