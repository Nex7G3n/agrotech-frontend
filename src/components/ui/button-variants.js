import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-(--radius) text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-ag-green-600 active:scale-[0.98]',
        secondary: 'bg-card text-foreground border border-input hover:bg-secondary',
        ghost: 'hover:bg-secondary',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4.5 py-2',
        sm: 'h-8 rounded-(--radius) px-3 text-xs',
        lg: 'h-10 rounded-(--radius) px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
