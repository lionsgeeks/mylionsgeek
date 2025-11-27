import React from 'react';
import { Badge } from './ui/badge';
import Rolegard from './rolegard';

const ReservationTable = ({ columns, data, onRowClick, renderActions, emptyState }) => {
  const isEmpty = data.length === 0;

  return (
    <div className="space-y-4">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-sidebar-border/70 bg-light dark:bg-dark">
        <table className="min-w-full table-auto divide-y divide-sidebar-border/70">
          <thead className="bg-secondary/50">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap">{col.label}</th>
              ))}
              {renderActions && (
                <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-sidebar-border/70">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-accent/30 cursor-pointer" onClick={() => onRowClick?.(row)}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm truncate">
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
                {renderActions && (
                  <td className="py-3 text-center text-sm" onClick={e => e.stopPropagation()}>
                    {renderActions(row)}
                  </td>
                )}
              </tr>
            ))}
            {isEmpty && (
              <tr>
                <td colSpan={columns.length + (renderActions ? 1 : 0)} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  {emptyState ?? 'No results found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {data.map((row) => (
          <div
            key={row.id}
            className="rounded-2xl border border-sidebar-border/60 bg-white/90 dark:bg-neutral-900 shadow-sm p-4 transition hover:shadow-md"
            onClick={() => onRowClick?.(row)}
          >
            <div className="flex flex-col gap-2 text-sm">
              {columns.map((col) => {
                const cellValue = col.render ? col.render(row) : row[col.key] ?? '—';
                return (
                  <div key={col.key} className="flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">{col.label}</span>
                    <div className="text-right font-medium text-foreground flex items-center justify-end gap-1">
                      {cellValue}
                    </div>
                  </div>
                );
              })}
            </div>
            {renderActions && (
              <div
                className="mt-4 flex justify-end"
                onClick={(e) => e.stopPropagation()}
              >
                {renderActions(row)}
              </div>
            )}
          </div>
        ))}
        {isEmpty && (
          <div className="rounded-xl border border-dashed border-sidebar-border/70 bg-white/70 dark:bg-neutral-900 p-6 text-center text-sm text-muted-foreground">
            {emptyState ?? 'No results found.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationTable;

