import { ChevronDown, X } from "lucide-react";
import { React, useEffect, useRef, useState } from "react";

const RolesMultiSelect = ({ roles, onChange }) => {
    const availableRoles = [
        'admin',
        'studio_responsable',
        'student',
        'coworker',
        'coach',
        'pro',
        'moderator',
        'recruiter',
    ];
    const current = (roles || []).map(r => String(r).toLowerCase());
    const options = availableRoles.filter(r => !current.includes(r));
    const containerRef = useRef(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [open]);

    const add = (r) => {
        const lr = r.toLowerCase();
        if (!current.includes(lr)) onChange([...current, lr]);
    };
    const remove = (r) => {
        const lr = r.toLowerCase();
        onChange(current.filter(x => x !== lr));
    };

    return (
        <div ref={containerRef} className="relative">
            {current.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {current.map((r) => (
                        <span key={r} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-md text-xs font-medium">
                            {r}
                            <button type="button" onClick={() => remove(r)} className="hover:bg-primary/20 rounded-full p-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
            <button
                type="button"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                onClick={() => setOpen(!open)}
            >
                <span className={current.length === 0 ? 'text-muted-foreground' : ''}>
                    {current.length === 0 ? 'Select Roles' : `${current.length} role(s) selected`}
                </span>
                <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute z-50 mt-2 w-full rounded-md border border-input bg-popover text-popover-foreground shadow-md">
                    <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                        {options.length === 0 ? (
                            <div className="px-2 py-2 text-sm text-muted-foreground">All roles selected</div>
                        ) : (
                            options.map((r) => (
                                <div
                                    key={r}
                                    className="flex items-center gap-2 px-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                                    onClick={() => add(r)}
                                >
                                    <span className="text-sm">{r}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RolesMultiSelect;
