const ReservationTable = ({ columns, data, onRowClick, renderActions, emptyState }) => {
    const isEmpty = data.length === 0;

    return (
        <div className="space-y-4">
            {/* Desktop table */}
            <div className="hidden overflow-x-auto rounded-xl border border-sidebar-border/70 bg-light md:block dark:bg-dark">
                <table className="min-w-full table-auto divide-y divide-sidebar-border/70">
                    <thead className="bg-secondary/50">
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap">
                                    {col.label}
                                </th>
                            ))}
                            {renderActions && <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-sidebar-border/70">
                        {data.map((row) => (
                            <tr key={row.id} className="cursor-pointer hover:bg-accent/30" onClick={() => onRowClick?.(row)}>
                                {columns.map((col) => (
                                    <td key={col.key} className="truncate px-4 py-3 text-sm">
                                        {col.render ? col.render(row) : (row[col.key] ?? '—')}
                                    </td>
                                ))}
                                {renderActions && (
                                    <td className="py-3 text-center text-sm" onClick={(e) => e.stopPropagation()}>
                                        {renderActions(row)}
                                    </td>
                                )}
                            </tr>
                        ))}
                        {isEmpty && (
                            <tr>
                                <td
                                    colSpan={columns.length + (renderActions ? 1 : 0)}
                                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                                >
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
                        className="rounded-2xl border border-sidebar-border/60 bg-white/90 p-4 shadow-sm transition hover:shadow-md dark:bg-neutral-900"
                        onClick={() => onRowClick?.(row)}
                    >
                        <div className="flex flex-col gap-2 text-sm">
                            {columns.map((col) => {
                                const cellValue = col.render ? col.render(row) : (row[col.key] ?? '—');
                                return (
                                    <div key={col.key} className="flex items-center justify-between gap-3">
                                        <span className="text-xs tracking-wide text-muted-foreground uppercase">{col.label}</span>
                                        <div className="flex items-center justify-end gap-1 text-right font-medium text-foreground">{cellValue}</div>
                                    </div>
                                );
                            })}
                        </div>
                        {renderActions && (
                            <div className="mt-4 flex justify-end" onClick={(e) => e.stopPropagation()}>
                                {renderActions(row)}
                            </div>
                        )}
                    </div>
                ))}
                {isEmpty && (
                    <div className="rounded-xl border border-dashed border-sidebar-border/70 bg-white/70 p-6 text-center text-sm text-muted-foreground dark:bg-neutral-900">
                        {emptyState ?? 'No results found.'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReservationTable;
