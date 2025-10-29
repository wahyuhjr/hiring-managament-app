import { StatusBadge } from '@/components/jobs/Status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Users } from 'lucide-react'
import Link from 'next/link'

export function JobCard({ job }) {
  return (
    <Card className="hover:shadow-md transition-shadow border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <StatusBadge status={job.status} />
              <div className="text-xs text-gray-500 font-medium px-2 py-1 border border-gray-300 rounded-md bg-gray-50">
                {job.list_card?.started_on_text || 'Recently created'}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {job.title}
            </h3>
            <p className="text-sm font-medium text-gray-900">
              {job.salary_range?.display_text || 'Salary not specified'}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{job._count?.applications || 0} applicants</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href={job.id ? `/admin/jobs/${job.id}` : '#'}>
              <Button className="bg-cyan-700 hover:bg-cyan-800" size="sm">
                Manage job
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}