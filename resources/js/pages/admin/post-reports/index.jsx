import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'refused', label: 'Refused' },
];

export default function PostReportsIndex({ reports, filters }) {
  const status = filters?.status || 'pending';

  const rows = useMemo(() => {
    const data = reports?.data;
    return Array.isArray(data) ? data : [];
  }, [reports?.data]);

  return (
    <AppLayout>
      <Head title="Post reports" />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Post reports</h1>
            <p className="mt-1 text-sm text-muted-foreground">Review reports submitted by users.</p>
          </div>

          <div className="flex items-center gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={`/admin/post-reports?status=${opt.value}`}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  status === opt.value
                    ? 'border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black'
                    : 'border-[var(--color-border)] bg-card text-foreground hover:bg-muted/50'
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-sidebar-border/70 bg-card">
          <div className="grid grid-cols-12 gap-3 border-b border-[var(--color-border)] px-4 py-3 text-xs font-bold text-muted-foreground">
            <div className="col-span-5">Post</div>
            <div className="col-span-3">Reporter</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Created</div>
          </div>

          {rows.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No reports.</div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {rows.map((r) => (
                <Link
                  key={r.id}
                  href={`/admin/post-reports/${r.id}`}
                  className="block px-4 py-4 transition hover:bg-muted/40"
                >
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-5">
                      <p className="line-clamp-2 text-sm font-semibold text-foreground">
                        {r?.post?.description || '—'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Post #{r?.post?.id ?? '—'} by {r?.post?.user?.name ?? 'Unknown'}
                      </p>
                    </div>

                    <div className="col-span-3">
                      <p className="text-sm font-semibold text-foreground">{r?.reporter?.name ?? 'Unknown'}</p>
                      {r?.reason ? (
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{r.reason}</p>
                      ) : (
                        <p className="mt-1 text-xs text-muted-foreground">No reason provided</p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          r.status === 'pending'
                            ? 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300'
                            : r.status === 'accepted'
                              ? 'bg-green-500/15 text-green-700 dark:text-green-300'
                              : 'bg-red-500/15 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div className="col-span-2 text-right text-xs text-muted-foreground">
                      {r?.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {reports?.links?.length ? (
          <div className="flex flex-wrap gap-2">
            {reports.links.map((l) => (
              <Link
                key={l.url ?? l.label}
                href={l.url || '#'}
                preserveScroll
                className={`rounded border px-3 py-1 text-sm ${
                  l.active ? 'border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black' : 'border-[var(--color-border)]'
                } ${!l.url ? 'pointer-events-none opacity-40' : 'hover:bg-muted/50'}`}
                dangerouslySetInnerHTML={{ __html: l.label }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}

