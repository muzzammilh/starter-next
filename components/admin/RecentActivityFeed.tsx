import { formatDistanceToNow } from "date-fns"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface ActivityItem {
  id: string
  title: string
  subtitle: string
  timestamp: Date
}

interface RecentActivityFeedProps {
  title: string
  items: ActivityItem[]
}

export function RecentActivityFeed({ title, items }: RecentActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-start justify-between pb-4 border-b last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>
                </div>
                <span className="text-xs text-muted-foreground ml-4">
                  {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
