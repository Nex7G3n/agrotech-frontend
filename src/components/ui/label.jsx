import * as LabelPrimitive from '@radix-ui/react-label'

import { cn } from '@/lib/utils'

function Label({ className, ...props }) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-xs font-medium text-secondary-foreground/80 select-none',
        className
      )}
      {...props}
    />
  )
}

export { Label }
