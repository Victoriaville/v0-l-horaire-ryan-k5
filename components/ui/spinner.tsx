import * as React from "react"
import { cn } from "@/lib/utils"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
)

Spinner.displayName = "Spinner"

export { Spinner }
