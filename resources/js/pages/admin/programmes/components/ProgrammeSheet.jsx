import { Check, Edit3, Layers } from 'lucide-react';
import { useState } from 'react';

export default function ProgrammeSheet({
    weeks = [],
    rows = [],
    modules = {},
    contents = {},
    onCellChange,
    editable = true,
    trackName = '',
}) {
    const [activeEditingCell, setActiveEditingCell] = useState(null);

    return (
        <div className="relative overflow-hidden rounded-xl border border-alpha/20 bg-light shadow-sm dark:bg-dark">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                    <thead>
                        <tr className="bg-alpha/10 dark:bg-alpha/15">
                            {/* Sticky Left Column: Topic/Hierarchy Header */}
                            <th className="sticky left-0 z-20 w-64 min-w-[240px] border-b border-r border-alpha/20 bg-light/95 p-3.5 font-extrabold uppercase tracking-wider text-dark dark:bg-dark/95 dark:text-light">
                                <div className="flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-alpha" />
                                    <span>Programme Hierarchy</span>
                                </div>
                            </th>

                            {/* Continuous Weekly Columns */}
                            {weeks.map((week) => (
                                <th
                                    key={week.id}
                                    className="w-60 min-w-[220px] border-b border-r border-alpha/20 p-3 text-center transition-colors hover:bg-alpha/20"
                                >
                                    <div className="font-extrabold text-dark dark:text-light">
                                        Week {week.number}
                                    </div>
                                    <div className="mt-0.5 font-mono text-[11px] font-semibold text-alpha">
                                        {week.shortDate}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row) => (
                            <tr
                                key={row.id}
                                className={
                                    row.isHeaderRow
                                        ? 'bg-alpha/5 font-bold dark:bg-alpha/10 group transition-colors'
                                        : 'hover:bg-alpha/5 group transition-colors'
                                }
                            >
                                {/* Sticky Left Label Column */}
                                <td className="sticky left-0 z-10 border-b border-r border-alpha/20 bg-light/95 p-3 font-semibold text-dark shadow-sm dark:bg-dark/95 dark:text-light">
                                    <div className="font-bold text-dark dark:text-light">{row.name}</div>
                                </td>

                                {/* Weekly Cells for this Row */}
                                {weeks.map((week) => {
                                    const cellKey = `w_${week.number}_${row.id}`;
                                    const isModuleRow = row.id === 'module';
                                    const cellValue = isModuleRow
                                        ? modules[week.number] || ''
                                        : contents[cellKey] || '';
                                    const isEditing = editable && activeEditingCell === cellKey;

                                    const cursorClass = editable ? 'cursor-pointer' : '';

                                    return (
                                        <td
                                            key={cellKey}
                                            onClick={() => {
                                                if (editable && !isEditing) {
                                                    setActiveEditingCell(cellKey);
                                                }
                                            }}
                                            className={`relative border-b border-r border-alpha/20 p-2.5 align-top transition-all ${
                                                isEditing
                                                    ? 'bg-alpha/10 ring-2 ring-alpha z-10'
                                                    : isModuleRow
                                                    ? 'bg-alpha/5 font-extrabold text-dark dark:text-light hover:bg-alpha/15 ' + cursorClass
                                                    : cellValue
                                                    ? 'hover:bg-alpha/10 ' + cursorClass
                                                    : 'hover:bg-alpha/5 bg-alpha/[0.02] ' + cursorClass
                                            }`}
                                        >
                                            {isEditing ? (
                                                <div className="space-y-2">
                                                    {isModuleRow ? (
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            value={cellValue}
                                                            onChange={(e) =>
                                                                onCellChange &&
                                                                onCellChange(week.number, row.id, e.target.value)
                                                            }
                                                            className="w-full rounded-lg border border-alpha bg-light p-2 text-xs font-bold text-dark shadow-inner focus:outline-none dark:bg-dark dark:text-light"
                                                        />
                                                    ) : (
                                                        <textarea
                                                            autoFocus
                                                            value={cellValue}
                                                            onChange={(e) =>
                                                                onCellChange &&
                                                                onCellChange(week.number, row.id, e.target.value)
                                                            }
                                                            rows={3}
                                                            className="w-full resize-none rounded-lg border border-alpha bg-light p-2 text-xs font-normal text-dark shadow-inner focus:outline-none dark:bg-dark dark:text-light"
                                                            placeholder="Enter content for this week..."
                                                        />
                                                    )}
                                                    <div className="flex justify-end gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveEditingCell(null);
                                                            }}
                                                            className="flex items-center gap-1 rounded bg-alpha px-2.5 py-1 text-[10px] font-bold text-black hover:opacity-90"
                                                        >
                                                            <Check className="h-3 w-3" />
                                                            Done
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="group/cell relative flex min-h-[48px] flex-col justify-between">
                                                    {cellValue ? (
                                                        <span
                                                            className={
                                                                isModuleRow
                                                                    ? 'font-extrabold text-alpha text-xs leading-relaxed'
                                                                    : 'text-dark/90 dark:text-light/90 text-xs leading-relaxed'
                                                            }
                                                        >
                                                            {cellValue}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] italic text-dark/30 dark:text-light/30">
                                                            {editable ? '+ Click to edit' : '-'}
                                                        </span>
                                                    )}

                                                    {editable && (
                                                        <div className="mt-2 flex items-center justify-end opacity-0 group-hover/cell:opacity-100 transition-opacity">
                                                            <Edit3 className="h-3 w-3 text-alpha" />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
