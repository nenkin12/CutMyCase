import Link from "next/link";
import { db } from "@/lib/db";
import { Package, Download, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type QueueJob = Awaited<ReturnType<typeof getQueueJobs>>[number];

async function getQueueJobs() {
  const jobs = await db.shopJob.findMany({
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    include: {
      order: true,
      orderItem: {
        include: {
          upload: true,
          product: true,
        },
      },
    },
  });

  return jobs;
}

const statusColors: Record<string, "default" | "secondary" | "success" | "warning" | "error"> = {
  QUEUED: "warning",
  IN_PROGRESS: "default",
  CUTTING: "default",
  QC: "secondary",
  COMPLETED: "success",
  CANCELLED: "error",
};

const statusLabels: Record<string, string> = {
  QUEUED: "Queued",
  IN_PROGRESS: "In Progress",
  CUTTING: "Cutting",
  QC: "Quality Check",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default async function QueuePage() {
  const jobs = await getQueueJobs();

  const grouped = {
    queued: jobs.filter((j: QueueJob) => j.status === "QUEUED"),
    inProgress: jobs.filter((j: QueueJob) => ["IN_PROGRESS", "CUTTING", "QC"].includes(j.status)),
    completed: jobs.filter((j: QueueJob) => j.status === "COMPLETED").slice(0, 10),
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <header className="bg-dark border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent rounded-[2px] flex items-center justify-center">
                  <span className="text-white font-heading text-lg">C</span>
                </div>
              </Link>
              <span className="font-heading text-xl">ADMIN</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/admin" className="text-text-secondary hover:text-white">
                Dashboard
              </Link>
              <Link href="/admin/orders" className="text-text-secondary hover:text-white">
                Orders
              </Link>
              <Link href="/admin/queue" className="text-accent">
                Queue
              </Link>
              <Link href="/" className="text-text-secondary hover:text-white">
                View Site
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading">Production Queue</h1>
          <div className="flex items-center gap-4">
            <Badge variant="warning">{grouped.queued.length} Queued</Badge>
            <Badge variant="default">{grouped.inProgress.length} In Progress</Badge>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Queued */}
          <div className="bg-carbon rounded-[4px] border border-border">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" />
              <h2 className="font-heading text-lg">Queued ({grouped.queued.length})</h2>
            </div>
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              {grouped.queued.map((job: QueueJob) => (
                <JobCard key={job.id} job={job} />
              ))}
              {grouped.queued.length === 0 && (
                <p className="text-text-muted text-center py-8">No jobs queued</p>
              )}
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-carbon rounded-[4px] border border-border">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Package className="w-5 h-5 text-accent" />
              <h2 className="font-heading text-lg">In Progress ({grouped.inProgress.length})</h2>
            </div>
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              {grouped.inProgress.map((job: QueueJob) => (
                <JobCard key={job.id} job={job} />
              ))}
              {grouped.inProgress.length === 0 && (
                <p className="text-text-muted text-center py-8">No jobs in progress</p>
              )}
            </div>
          </div>

          {/* Completed */}
          <div className="bg-carbon rounded-[4px] border border-border">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <h2 className="font-heading text-lg">Completed</h2>
            </div>
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              {grouped.completed.map((job: QueueJob) => (
                <JobCard key={job.id} job={job} />
              ))}
              {grouped.completed.length === 0 && (
                <p className="text-text-muted text-center py-8">No completed jobs</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface JobCardProps {
  job: Awaited<ReturnType<typeof getQueueJobs>>[number];
}

function JobCard({ job }: JobCardProps) {
  return (
    <div className="bg-dark rounded-[4px] p-4 border border-border hover:border-accent/50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-medium text-sm">{job.order.orderNumber}</div>
          <div className="text-xs text-text-muted">
            {job.orderItem.product?.name || "Custom Foam"}
          </div>
        </div>
        <Badge variant={statusColors[job.status]}>
          {statusLabels[job.status]}
        </Badge>
      </div>

      {job.orderItem.upload && (
        <div className="mt-3">
          {job.orderItem.upload.outlineDxfUrl && (
            <a
              href={job.orderItem.upload.outlineDxfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
            >
              <Download className="w-4 h-4" />
              Download DXF
            </a>
          )}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {job.status === "QUEUED" && (
          <form action={`/api/admin/queue/${job.id}/start`} method="POST">
            <Button type="submit" size="sm" variant="secondary">
              Start
            </Button>
          </form>
        )}
        {job.status === "IN_PROGRESS" && (
          <form action={`/api/admin/queue/${job.id}/cutting`} method="POST">
            <Button type="submit" size="sm" variant="secondary">
              Mark Cutting
            </Button>
          </form>
        )}
        {job.status === "CUTTING" && (
          <form action={`/api/admin/queue/${job.id}/qc`} method="POST">
            <Button type="submit" size="sm" variant="secondary">
              Send to QC
            </Button>
          </form>
        )}
        {job.status === "QC" && (
          <form action={`/api/admin/queue/${job.id}/complete`} method="POST">
            <Button type="submit" size="sm">
              Complete
            </Button>
          </form>
        )}
      </div>

      {job.notes && (
        <div className="mt-3 text-xs text-text-muted bg-carbon p-2 rounded">
          {job.notes}
        </div>
      )}
    </div>
  );
}
