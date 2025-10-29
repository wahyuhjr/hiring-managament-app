import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function StatusBadge({ status, className, ...props }) {
  const getStatusConfig = (status) => {
    const configs = {
      active: {
        label: 'Active',
        textColor: 'text-green-600',
        borderColor: 'border-green-200 px-3 p-2 rounded-lg'
      },
      draft: {
        label: 'Draft',
        textColor: 'text-yellow-600',
        borderColor: 'border-yellow-200 px-3 p-2 rounded-lg'
      },
      inactive: {
        label: 'Inactive',
        textColor: 'text-red-600',
        borderColor: 'border-red-200 px-3 p-2 rounded-lg'
      }
    }

    return configs[status?.toLowerCase()] || configs.inactive
  }

  const config = getStatusConfig(status)

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'bg-white font-semibold',
        config.textColor,
        config.borderColor,
        className
      )} 
      {...props}
    >
      {config.label}
    </Badge>
  )
}