import { cn } from '@/lib/utils'

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-9 w-full min-w-0 rounded-(--radius) border border-input bg-secondary px-3 py-2 text-sm text-foreground transition-[color,box-shadow,background-color,border-color] outline-none',
        'placeholder:text-muted-foreground',
        'focus-visible:border-primary focus-visible:bg-card focus-visible:ring-[3px] focus-visible:ring-primary/15',
        'disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export { Input }
