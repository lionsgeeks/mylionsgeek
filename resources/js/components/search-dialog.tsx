import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { router, usePage } from '@inertiajs/react';
import { Search, Keyboard, ArrowRight, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchItems } from '@/hooks/use-search-items';
import Rolegard from '@/components/rolegard';
import { Avatar } from '@/components/ui/avatar';

type RolegardProps = {
    children: React.ReactNode;
    authorized?: string[] | string;
    except?: string[] | string;
};

const RolegardTyped = Rolegard as unknown as React.ComponentType<RolegardProps>;

type PageSearchItem = {
    title: string;
    href?: string;
    category: string;
    icon?: LucideIcon;
    description?: string;
    keywords?: string[];
    onSelect?: () => void;
};

type UserSearchApiItem = {
    id: number | string;
    type: 'user';
    name: string;
    email?: string | null;
    promo?: string | null;
    field?: string | null;
    roles?: string[];
    image?: string | null;
};

type UserSearchItem = UserSearchApiItem & {
    category: 'Users';
    title: string;
    description?: string;
    href: string;
};

type SearchResultItem = PageSearchItem | UserSearchItem;

type SearchApiResponse = {
    results?: UserSearchApiItem[];
};

type PageAuthProps = {
    auth?: {
        user?: {
            role?: string[] | string;
        };
    };
};

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
    const [userResults, setUserResults] = useState<UserSearchApiItem[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled && onOpenChange ? onOpenChange : setInternalOpen;

    const { auth } = usePage<PageAuthProps>().props;
    const roleValue = auth?.user?.role;
    const userRoles: string[] = Array.isArray(roleValue)
        ? roleValue
        : [roleValue].filter((v): v is string => typeof v === 'string' && v.length > 0);
    const isStudent = userRoles.includes('student');

    const { search } = useSearchItems();
    const pageResults = useMemo(() => search(query) as PageSearchItem[], [query, search]);

    const visibleUserResults = useMemo(() => {
        if (!isStudent) return userResults;
        return userResults.filter((u) => Array.isArray(u.roles) && u.roles.includes('student'));
    }, [isStudent, userResults]);

    const visiblePageResults = useMemo(() => {
        return isStudent ? [] : pageResults;
    }, [isStudent, pageResults]);

    const combinedResults = useMemo<SearchResultItem[]>(() => {
        const users: UserSearchItem[] = visibleUserResults.map((u) => ({
            ...u,
            category: 'Users',
            title: u.name,
            description: [u.email, u.field, u.promo].filter(Boolean).join(' • '),
            href: `/students/${u.id}`,
        }));
        return [...users, ...visiblePageResults];
    }, [visiblePageResults, visibleUserResults]);

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

    const handleSelect = useCallback((item: SearchResultItem) => {
        setOpen(false);
        setQuery('');
        setSelectedIndex(0);
        if (item.href) {
            router.visit(item.href);
        } else if ('onSelect' in item && typeof item.onSelect === 'function') {
            item.onSelect();
        }
    }, [setOpen]);

    useEffect(() => {
        let active = true;
        const q = query.trim();
        if (!open || q.length === 0) {
            setUserResults([]);
            setIsLoadingUsers(false);
            return;
        }

        const controller = new AbortController();
        setIsLoadingUsers(true);

        const timer = window.setTimeout(async () => {
            try {
                const url = `/api/search?q=${encodeURIComponent(q)}&type=students`;
                const res = await fetch(url, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    signal: controller.signal,
                });
                if (!res.ok) throw new Error('Failed to search');
                const data = (await res.json()) as SearchApiResponse;
                if (!active) return;
                setUserResults(Array.isArray(data?.results) ? data.results : []);
            } catch {
                if (!active) return;
                setUserResults([]);
            } finally {
                if (active) {
                    setIsLoadingUsers(false);
                }
            }
        }, 250);

        return () => {
            active = false;
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [open, query]);

    // Keyboard navigation for results
    useEffect(() => {
        if (!open || combinedResults.length === 0) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev < combinedResults.length - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
            } else if (e.key === 'Enter' && combinedResults[selectedIndex]) {
                e.preventDefault();
                handleSelect(combinedResults[selectedIndex]);
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [combinedResults, handleSelect, open, selectedIndex]);

    // Scroll selected item into view
    useEffect(() => {
        if (resultsRef.current && selectedIndex >= 0) {
            const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [selectedIndex]);

    function handleQueryChange(value: string) {
        setQuery(value);
        setSelectedIndex(0);
    }

    const defaultTrigger = (
        <Button
            type="button"
            variant="outline"
            className={cn(
                'h-9 w-full sm:w-64 justify-start gap-2 text-sm text-muted-foreground hover:text-foreground',
                className
            )}
            onClick={() => setOpen(true)}
        >
            <Search className="size-4 shrink-0" />
            <span className="hidden sm:inline truncate">Search anything...</span>
            <span className="sm:ml-auto inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                <Keyboard className="size-3" />
                <span className="hidden sm:inline">Ctrl</span>
                <kbd className="hidden dark:bg-dark_gray/80 bg-light sm:inline pointer-events-none h-5 select-none items-center gap-1 rounded pt-1 px-1.5 font-mono text-[10px] font-medium opacity-100">
                    K
                </kbd>
            </span>
        </Button>
    );

    return (
        <>
            {trigger || defaultTrigger}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="p-0 gap-0 max-w-2xl overflow-hidden sm:rounded-lg" showCloseButton={false}>
                    <div className="border-b p-3">
                        <div className="flex items-center gap-2 rounded-md border bg-background px-3">
                            <Search className="size-4 text-neutral-500 shrink-0" />
                            <Input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => handleQueryChange(e.target.value)}
                                placeholder="Search users, projects, tasks, equipment, reservations..."
                                className="border-0 shadow-none focus-visible:ring-0 text-base"
                                onKeyDown={(e) => {
                                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
                                        e.preventDefault();
                                    }
                                }}
                            />
                            {query && (
                                <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                                    Esc
                                </kbd>
                            )}
                        </div>
                    </div>

                    <div className="max-h-[60vh] min-h-[200px] overflow-y-auto p-2" ref={resultsRef}>
                        {query.trim() === '' && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Search className="size-12 text-neutral-400 mb-4" />
                                <p className="text-sm text-muted-foreground">Start typing to search...</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Search across users, projects, tasks, equipment, and more
                                </p>
                            </div>
                        )}

                        {query.trim() !== '' && combinedResults.length === 0 && !isLoadingUsers && (
                            <div className="px-3 py-12 text-center">
                                <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
                                <p className="text-xs text-muted-foreground mt-2">Try a different search term</p>
                            </div>
                        )}

                        {isLoadingUsers && (
                            <div className="px-3 py-6 text-sm text-muted-foreground">
                                Searching...
                            </div>
                        )}

                        {combinedResults.length > 0 && (
                            <div className="space-y-1">
                                {combinedResults.map((item, index) => {
                                    const isSelected = index === selectedIndex;
                                    const isPageItem = item.category !== 'Users' && !!item.href;
                                    const isUserItem = item.category === 'Users';
                                    const PageIcon = (!isUserItem ? (item as PageSearchItem).icon : undefined) as LucideIcon | undefined;
                                    return (
                                        <RolegardTyped key={`${item.category}:${item.title}:${item.href || index}`} except={isPageItem ? ['student'] : []}>
                                            <button
                                                onClick={() => handleSelect(item)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={cn(
                                                    'w-full rounded-md px-3 py-2.5 text-left transition-colors',
                                                    'flex items-center gap-3 group',
                                                    isSelected
                                                        ? 'bg-accent text-accent-foreground'
                                                        : 'hover:bg-accent/50 text-foreground'
                                                )}
                                                type="button"
                                            >
                                                {isUserItem ? (
                                                    <div className="shrink-0">
                                                        <Avatar
                                                            className="size-9"
                                                            name={item.title}
                                                            image={(item as UserSearchItem).image ?? undefined}
                                                            onlineCircleClass="hidden"
                                                            lastActivity={null}
                                                        />
                                                    </div>
                                                ) : (
                                                    PageIcon ? (
                                                        <div className="shrink-0">
                                                            <PageIcon
                                                                className={cn(
                                                                    'size-5 transition-colors',
                                                                    isSelected
                                                                        ? 'text-accent-foreground'
                                                                        : 'text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'
                                                                )}
                                                            />
                                                        </div>
                                                    ) : null
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate">{item.title}</div>
                                                    {item.description && (
                                                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                                                            {item.description}
                                                        </div>
                                                    )}
                                                </div>
                                                {item.category && (
                                                    <div className="shrink-0 text-xs text-muted-foreground hidden sm:block">
                                                        {item.category}
                                                    </div>
                                                )}
                                                <ArrowRight
                                                    className={cn(
                                                        'size-4 shrink-0 transition-opacity',
                                                        isSelected ? 'opacity-100' : 'opacity-0'
                                                    )}
                                                />
                                            </button>
                                        </RolegardTyped>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {combinedResults.length > 0 && (
                        <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
                            <span>
                                {combinedResults.length} result{combinedResults.length !== 1 ? 's' : ''}
                            </span>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <kbd className="pointer-events-none h-4 select-none items-center rounded border bg-muted px-1 font-mono text-[10px] font-medium">
                                        ↑
                                    </kbd>
                                    <kbd className="pointer-events-none h-4 select-none items-center rounded border bg-muted px-1 font-mono text-[10px] font-medium">
                                        ↓
                                    </kbd>
                                    <span>Navigate</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="pointer-events-none h-4 select-none items-center rounded border bg-muted px-1 font-mono text-[10px] font-medium">
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

