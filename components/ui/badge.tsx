import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex h-5 shrink-0 items-center justify-center gap-1 rounded px-1.5 text-[12px] font-normal whitespace-nowrap [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-white/5 text-fog",
        secondary: "bg-iris-violet/20 text-mist",
        destructive: "bg-coral-red/15 text-coral-red",
        outline: "border border-graphite text-fog",
        ghost: "text-fog",
        success: "bg-pulse-green/15 text-pulse-green",
        tag: "bg-lavender/20 text-mist",
        link: "text-mist underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
