import { cn } from "cn"

interface ComponentsEmptyStateProps {
  message: string
  className?: string
}

export function ComponentsEmptyState({
  message,
  className,
}: ComponentsEmptyStateProps) {
  return (
    <div className={cn("py-12 text-center", className)}>
      <p className="text-site-muted-foreground">{message}</p>
    </div>
  )
}
