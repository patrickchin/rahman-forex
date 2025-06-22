import * as React from "react"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "../../lib/utils"

const Select = React.forwardRef<
  React.ElementRef<"button">,
  React.ComponentPropsWithoutRef<"button">
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "w-32 border rounded px-2 py-1 bg-white text-left flex items-center justify-between",
      className
    )}
    {...props}
  />
))
Select.displayName = "Select"

const SelectContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-10 mt-1 w-32 bg-white border rounded shadow absolute",
      className
    )}
    {...props}
  />
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { selected?: boolean }
>(({ className, selected, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "cursor-pointer px-2 py-1 flex items-center gap-2",
      selected ? "bg-blue-100 font-bold" : "",
      className
    )}
    {...props}
  >
    {selected && <Check className="w-3 h-3 text-blue-500" />}
    {children}
  </div>
))
SelectItem.displayName = "SelectItem"

const SelectIcon = ChevronDown

export { Select, SelectContent, SelectItem, SelectIcon }
