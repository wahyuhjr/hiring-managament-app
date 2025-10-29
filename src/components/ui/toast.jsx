import * as React from "react"
import { cva } from "class-variance-authority"
import { X, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-6 pr-8 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "border-gray-300 bg-white text-gray-900",
        success: "border-gray-200 bg-white text-gray-900",
        destructive: "border-red-500 bg-red-50/95 text-red-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  // Filter out invalid props for div element
  const { onOpenChange, ...validProps } = props
  
  return (
    <div
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...validProps}
    />
  )
})
Toast.displayName = "Toast"

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = "ToastAction"

const ToastClose = React.forwardRef(({ className, onClick, ...props }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-0 transition-opacity hover:text-gray-700 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
  </button>
))
ToastClose.displayName = "ToastClose"

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = "ToastDescription"

const ToastIcon = ({ variant = "default", className, ...props }) => {
  if (variant === "success") {
    return (
      <div className="shrink-0">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600">
          <CheckCircle className="h-4 w-4 text-white font-bold" />
        </div>
      </div>
    )
  }
  if (variant === "destructive") {
    return (
      <div className="shrink-0">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
          <X className="h-4 w-4 text-white font-bold" />
        </div>
      </div>
    )
  }
  return null
}

const ToastAccent = ({ variant = "default", className, ...props }) => {
  if (variant === "success") {
    return (
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-teal-500 to-teal-600" />
    )
  }
  if (variant === "destructive") {
    return (
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-red-500 to-red-600" />
    )
  }
  return null
}

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastIcon,
  ToastAccent,
  ToastTitle,
  toastVariants,
}
