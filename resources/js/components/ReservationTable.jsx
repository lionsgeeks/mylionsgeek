import React from 'react';
import { Badge } from './ui/badge';
import Rolegard from './rolegard';

const ReservationTable = ({ columns, data, onRowClick, renderActions }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-sidebar-border/70 bg-light dark:bg-dark">
      <table className="min-w-full table-auto divide-y divide-sidebar-border/70">
        <thead className="bg-secondary/50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-sm font-medium">{col.label}</th>
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
                  {col.render
                    ? col.render(row)
                    : row[col.key] ?? '—'}
                </td>
              ))}
              {renderActions && (
                <td className="py-3 text-center text-sm" onClick={e => e.stopPropagation()}>
                  {renderActions(row)}
                </td>
              )}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length + (renderActions ? 1 : 0)} className="px-4 py-12 text-center text-sm text-muted-foreground">
                No results found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationTable;

