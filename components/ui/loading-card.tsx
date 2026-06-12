import { LoadingSpinner } from "./loading-spinner"

interface LoadingCardProps {
  title?: string
  description?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingCard({
  title = "Loading",
  description,
  size = "md",
}: LoadingCardProps) {
  return (
    <div className="flex items-center justify-center w-full min-h-[500px]">
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size={size} />
        {title && <p className="text-sm font-medium text-foreground">{title}</p>}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}
