import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

function resolvePostImageUrl(filename) {
  if (!filename) return null;
  if (typeof filename !== 'string') return null;
  if (filename.startsWith('http://') || filename.startsWith('https://')) return filename;
  const clean = filename.replace(/^\/+/, '');
  // Stored as img/posts/<file>
  return clean.includes('img/posts/')
    ? `/storage/${clean}`
    : `/storage/img/posts/${clean.split('/').pop()}`;
}

export default function PostReportShow({ report }) {
  const [submitting, setSubmitting] = useState(false);

  const images = useMemo(() => {
    const list = report?.post?.images;
    return Array.isArray(list) ? list : [];
  }, [report?.post?.images]);

  const canResolve = report?.status === 'pending';

  const handleResolve = async (action) => {
    if (!canResolve || submitting) return;
    setSubmitting(true);
    try {
      await router.post(`/admin/post-reports/${report.id}/${action}`, {}, { preserveScroll: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <Head title={`Report #${report?.id ?? ''}`} />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">Report #{report?.id}</h1>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                  report?.status === 'pending'
                    ? 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300'
                    : report?.status === 'accepted'
                      ? 'bg-green-500/15 text-green-700 dark:text-green-300'
                      : 'bg-red-500/15 text-red-700 dark:text-red-300'
                }`}
              >
                {report?.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Post #{report?.post?.id} • reported by <span className="font-semibold">{report?.reporter?.name ?? 'Unknown'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/post-reports"
              className="rounded-lg border border-[var(--color-border)] bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/50"
            >
              Back
            </Link>

            <Button
              disabled={!canResolve || submitting}
              onClick={() => handleResolve('accept')}
              className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              Accept
            </Button>
            <Button
              disabled={!canResolve || submitting}
              onClick={() => handleResolve('refuse')}
              className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              Refuse
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-sidebar-border/70 bg-card p-5 lg:col-span-2">
            <h2 className="text-sm font-bold text-muted-foreground">Post</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{report?.post?.description || '—'}</p>

            {images.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                {images.map((img, idx) => {
                  const url = resolvePostImageUrl(img);
                  return (
                    <a key={`${img}-${idx}`} href={url || '#'} target="_blank" rel="noreferrer" className="group block">
                      <div className="aspect-square overflow-hidden rounded-lg border border-[var(--color-border)] bg-muted/30">
                        {url ? (
                          <img src={url} alt="Post media" className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
                        ) : null}
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-sidebar-border/70 bg-card p-5">
              <h2 className="text-sm font-bold text-muted-foreground">Report details</h2>
              <div className="mt-3 space-y-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Reason</p>
                  <p className="mt-1 text-foreground">{report?.reason || 'No reason provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="mt-1 text-foreground">
                    {report?.created_at ? new Date(report.created_at).toLocaleString() : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reviewed</p>
                  <p className="mt-1 text-foreground">
                    {report?.reviewed_at ? new Date(report.reviewed_at).toLocaleString() : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reviewer</p>
                  <p className="mt-1 text-foreground">{report?.reviewer?.name || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

