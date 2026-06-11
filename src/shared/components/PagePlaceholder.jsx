import { Card, CardContent } from '@/components/ui/card'

export function PagePlaceholder({ id, title, description, children }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-6 py-2.5">
        {id ? (
          <span className="rounded-md border border-ag-green-100 bg-ag-green-50 px-2.25 py-0.75 font-mono text-[11px] font-medium text-ag-green-600">
            {id}
          </span>
        ) : null}
        <span className="text-sm font-medium text-foreground">{title}</span>
        {description ? <span className="ml-auto text-xs text-muted-foreground">{description}</span> : null}
      </div>

      {children ?? (
        <Card>
          <CardContent className="items-center gap-1 py-16 text-center">
            <p className="text-sm font-medium text-foreground">Módulo en construcción</p>
            <p className="text-xs text-muted-foreground">Esta sección se implementará próximamente.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
