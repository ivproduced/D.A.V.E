import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
      onCheckedChange?.(e.target.checked)
    }

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none checked:bg-gray-900 checked:border-gray-900 dark:border-gray-800 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 dark:checked:bg-gray-50 dark:checked:border-gray-50",
            className
          )}
          onChange={handleChange}
          {...props}
        />
        <Check className="absolute left-0 h-4 w-4 text-white pointer-events-none hidden peer-checked:block" strokeWidth={3} />
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
