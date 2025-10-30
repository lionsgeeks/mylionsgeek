import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useSearchItems } from '@/hooks/use-search-items';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { ArrowRight, Keyboard, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface SearchDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
    className?: string;
}

export function SearchDialog({ open: controlledOpen, onOpenChange, trigger, className }: SearchDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled && onOpenChange ? onOpenChange : setInternalOpen;

    const { searchItems, search } = useSearchItems();
    const results = useMemo(() => search(query), [query, searchItems]);

    // Keyboard shortcut handler
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
                e.preventDefault();
                setOpen(true);
            }
            if (e.key === 'Escape' && open) {
                e.preventDefault();
                setOpen(false);
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, setOpen]);

    // Focus input when dialog opens
    useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setSelectedIndex(0);
        }
    }, [open]);

    // Keyboard navigation for results
    useEffect(() => {
        if (!open || results.length === 0) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
            } else if (e.key === 'Enter' && results[selectedIndex]) {
                e.preventDefault();
                handleSelect(results[selectedIndex]);
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, results, selectedIndex]);

    // Scroll selected item into view
    useEffect(() => {
        if (resultsRef.current && selectedIndex >= 0) {
            const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [selectedIndex]);

    function handleSelect(item: (typeof results)[number]) {
        setOpen(false);
        setQuery('');
        setSelectedIndex(0);
        if (item.href) {
            router.visit(item.href);
        } else if (item.onSelect) {
            item.onSelect();
        }
    }

    function handleQueryChange(value: string) {
        setQuery(value);
        setSelectedIndex(0);
    }

    const defaultTrigger = (
        <Button
            type="button"
            variant="outline"
            className={cn('h-9 w-full justify-start gap-2 text-sm text-muted-foreground hover:text-foreground sm:w-64', className)}
            onClick={() => setOpen(true)}
        >
            <Search className="size-4 shrink-0" />
            <span className="hidden truncate sm:inline">Search anything...</span>
            <span className="inline-flex items-center gap-1 text-xs text-neutral-500 sm:ml-auto dark:text-neutral-400">
                <Keyboard className="size-3" />
                <span className="hidden sm:inline">Ctrl</span>
                <kbd className="pointer-events-none hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:inline">
                    K
                </kbd>
            </span>
        </Button>
    );

    return (
        <>
            {trigger || defaultTrigger}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 sm:rounded-lg" showCloseButton={false}>
                    <div className="border-b p-3">
                        <div className="flex items-center gap-2 rounded-md border bg-background px-3">
                            <Search className="size-4 shrink-0 text-neutral-500" />
                            <Input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => handleQueryChange(e.target.value)}
                                placeholder="Search users, projects, tasks, equipment, reservations..."
                                className="border-0 text-base shadow-none focus-visible:ring-0"
                                onKeyDown={(e) => {
                                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
                                        e.preventDefault();
                                    }
                                }}
                            />
                            {query && (
                                <kbd className="pointer-events-none hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
                                    Esc
                                </kbd>
                            )}
                        </div>
                    </div>

                    <div className="max-h-[60vh] min-h-[200px] overflow-y-auto p-2" ref={resultsRef}>
                        {query.trim() === '' && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Search className="mb-4 size-12 text-neutral-400" />
                                <p className="text-sm text-muted-foreground">Start typing to search...</p>
                                <p className="mt-2 text-xs text-muted-foreground">Search across users, projects, tasks, equipment, and more</p>
                            </div>
                        )}

                        {query.trim() !== '' && results.length === 0 && (
                            <div className="px-3 py-12 text-center">
                                <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
                                <p className="mt-2 text-xs text-muted-foreground">Try a different search term</p>
                            </div>
                        )}

                        {results.length > 0 && (
                            <div className="space-y-1">
                                {results.map((item, index) => {
                                    const isSelected = index === selectedIndex;
                                    return (
                                        <button
                                            key={`${item.category}:${item.title}:${item.href || index}`}
                                            onClick={() => handleSelect(item)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={cn(
                                                'w-full rounded-md px-3 py-2.5 text-left transition-colors',
                                                'group flex items-center gap-3',
                                                isSelected ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent/50',
                                            )}
                                            type="button"
                                        >
                                            {item.icon && (
                                                <div className="shrink-0">
                                                    <item.icon
                                                        className={cn(
                                                            'size-5 transition-colors',
                                                            isSelected
                                                                ? 'text-accent-foreground'
                                                                : 'text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300',
                                                        )}
                                                    />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-sm font-medium">{item.title}</div>
                                                {item.description && (
                                                    <div className="mt-0.5 truncate text-xs text-muted-foreground">{item.description}</div>
                                                )}
                                            </div>
                                            {item.category && (
                                                <div className="hidden shrink-0 text-xs text-muted-foreground sm:block">{item.category}</div>
                                            )}
                                            <ArrowRight
                                                className={cn('size-4 shrink-0 transition-opacity', isSelected ? 'opacity-100' : 'opacity-0')}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {results.length > 0 && (
                        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
                            <span>
                                {results.length} result{results.length !== 1 ? 's' : ''}
                            </span>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <kbd className="pointer-events-none h-4 items-center rounded border bg-muted px-1 font-mono text-[10px] font-medium select-none">
                                        ↑
                                    </kbd>
                                    <kbd className="pointer-events-none h-4 items-center rounded border bg-muted px-1 font-mono text-[10px] font-medium select-none">
                                        ↓
                                    </kbd>
                                    <span>Navigate</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="pointer-events-none h-4 items-center rounded border bg-muted px-1 font-mono text-[10px] font-medium select-none">
                                        ↵
                                    </kbd>
                                    <span>Select</span>
                                </span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

export default SearchDialog;
