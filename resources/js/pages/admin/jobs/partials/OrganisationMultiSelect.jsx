import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ChevronDown, X } from 'lucide-react';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

export default function OrganisationMultiSelect({ organizationOptions = [], selectedIds = [], onChange, error }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const [panelWidth, setPanelWidth] = useState(undefined);

    useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => setPanelWidth(el.offsetWidth));
        ro.observe(el);
        setPanelWidth(el.offsetWidth);
        return () => ro.disconnect();
    }, []);

    const selectedSet = useMemo(() => new Set((selectedIds ?? []).map(Number)), [selectedIds]);

    const selectedOrganisations = useMemo(
        () => organizationOptions.filter((r) => selectedSet.has(Number(r.id))),
        [organizationOptions, selectedSet],
    );

    const unselectedOrganisations = useMemo(
        () => organizationOptions.filter((r) => !selectedSet.has(Number(r.id))),
        [organizationOptions, selectedSet],
    );

    const add = (id) => {
        const n = Number(id);
        if (selectedSet.has(n)) return;
        onChange([...(selectedIds ?? []).map(Number), n]);
    };

    const remove = (id) => {
        const n = Number(id);
        onChange((selectedIds ?? []).map(Number).filter((x) => x !== n));
    };

    return (
        <div className="space-y-3">
            <div>
                <Label className="text-base">Assigned organisations</Label>
                <p className="mt-1 text-sm text-muted-foreground">They can view applications for this posting. Leave empty if none yet.</p>
            </div>

            {organizationOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No onboarded organisations yet — invite them under Admin → Organisations.</p>
            ) : (
                <div ref={containerRef} className="w-full">
                    <div
                        className={cn(
                            'overflow-hidden rounded-md border border-alpha/15 bg-background shadow-xs dark:border-light/10',
                            'focus-within:ring-[3px] focus-within:ring-ring/50',
                        )}
                    >
                        {selectedOrganisations.length > 0 && (
                            <div className="flex flex-wrap gap-2 border-b border-alpha/10 p-2 dark:border-light/10">
                                {selectedOrganisations.map((org) => (
                                    <Badge key={org.id} variant="secondary" className="gap-1 pr-1">
                                        <span className="max-w-[200px] truncate">{org.name}</span>
                                        <button
                                            type="button"
                                            className="rounded-full p-0.5 hover:bg-muted"
                                            onClick={() => remove(org.id)}
                                            aria-label={`Remove ${org.name}`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted/40"
                                >
                                    <span>{selectedOrganisations.length ? 'Add another organisation' : 'Select organisations'}</span>
                                    <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0" align="start" style={{ width: panelWidth }}>
                                <ul className="max-h-56 overflow-y-auto py-1">
                                    {unselectedOrganisations.length === 0 ? (
                                        <li className="px-3 py-2 text-sm text-muted-foreground">All organisations selected</li>
                                    ) : (
                                        unselectedOrganisations.map((org) => (
                                            <li key={org.id}>
                                                <button
                                                    type="button"
                                                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                                                    onClick={() => {
                                                        add(org.id);
                                                        setOpen(false);
                                                    }}
                                                >
                                                    <span className="block font-medium">{org.name}</span>
                                                    <span className="text-xs text-muted-foreground">{org.email}</span>
                                                </button>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
