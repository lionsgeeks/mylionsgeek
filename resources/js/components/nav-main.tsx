import Rolegard from '@/components/rolegard';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react';
import { useState } from 'react';

const GROUPS_STORAGE_KEY = 'sidebar_nav_groups_open';
const ITEMS_STORAGE_KEY = 'sidebar_nav_items_open';

function readStoredGroups(): Record<string, boolean> {
    if (typeof window === 'undefined') return {};
    try {
        return JSON.parse(localStorage.getItem(GROUPS_STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
}

function writeStoredGroups(groups: Record<string, boolean>) {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
}

function readStoredItems(): Record<string, boolean> {
    if (typeof window === 'undefined') return {};
    try {
        return JSON.parse(localStorage.getItem(ITEMS_STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
}

function writeStoredItems(items: Record<string, boolean>) {
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
}

export function NavMain({
    items = [],
    label,
    labelIcon: LabelIcon,
    collapsible = false,
    defaultGroupOpen = false,
}: {
    items: NavItem[];
    label?: string;
    labelIcon?: LucideIcon;
    collapsible?: boolean;
    defaultGroupOpen?: boolean;
}) {
    const page = usePage();
    const groupKey = label ?? 'default';

    const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => readStoredItems());
    const [isGroupOpen, setIsGroupOpen] = useState(() => {
        const stored = readStoredGroups()[groupKey];
        if (stored !== undefined) return stored;
        return defaultGroupOpen;
    });

    const toggleOpen = (key: string) => {
        setOpenMap((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            writeStoredItems(next);
            return next;
        });
    };

    const toggleGroup = () => {
        setIsGroupOpen((prev) => {
            const next = !prev;
            writeStoredGroups({ ...readStoredGroups(), [groupKey]: next });
            return next;
        });
    };

    const renderItem = (item: NavItem) => {
        const href = typeof item.href === 'string' ? item.href : item.href.url;
        const isActive = page.url.startsWith(href);
        const hasChildren = !!item.children && item.children.length > 0;
        const isOpen = !!openMap[item.title];

        return (
            <Rolegard key={item.id ?? item.title} authorized={item.authorizedRoles ?? []} except={item.excludedRoles ?? []}>
                <SidebarMenuItem>
                    {hasChildren ? (
                        <SidebarMenuButton
                            isActive={isActive}
                            tooltip={{ children: item.title }}
                            className="py-6 [&>[data-chevron]]:ml-auto"
                            aria-expanded={isOpen}
                            onClick={() => toggleOpen(item.title)}
                        >
                            {item.icon && <item.icon className="size-4 text-[var(--color-alpha)]" />}
                            <span>{item.title}</span>
                            <ChevronDown
                                data-chevron
                                className={`size-4 text-[var(--color-alpha)] opacity-80 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            />
                        </SidebarMenuButton>
                    ) : (
                        <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={{ children: item.title }}
                            className="py-5.5 [&>[data-chevron]]:ml-auto"
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon className="size-4 text-[#d8a200] dark:text-[var(--color-alpha)]" />}
                                <span>{item.title}</span>
                                {item.chevron && (
                                    <ChevronRight data-chevron className="size-4 text-[var(--color-alpha)] opacity-80" />
                                )}
                            </Link>
                        </SidebarMenuButton>
                    )}
                    {typeof item.badge !== 'undefined' && (
                        <SidebarMenuBadge className="bg-destructive text-destructive-foreground">{item.badge}</SidebarMenuBadge>
                    )}
                    {hasChildren && (
                        <SidebarMenuSub className={`${isOpen ? 'block' : 'hidden'} mt-1 mx-0 translate-x-0 border-0 px-0 py-0 pl-4`}>
                            {item.children?.map((sub) => {
                                const subHref = typeof sub.href === 'string' ? sub.href : sub.href.url;
                                const subActive = page.url.startsWith(subHref);
                                return (
                                    <SidebarMenuItem key={sub.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={subActive}
                                            tooltip={{ children: sub.title }}
                                            className="py-5.5"
                                        >
                                            <Link href={sub.href} prefetch>
                                                {sub.icon && (
                                                    <sub.icon className="size-4 text-[#d8a200] dark:text-[var(--color-alpha)]" />
                                                )}
                                                <span>{sub.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenuSub>
                    )}
                </SidebarMenuItem>
            </Rolegard>
        );
    };

    return (
        <SidebarGroup className="px-2 py-0">
            {label && !collapsible && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
            <SidebarMenu>
                {label && collapsible && (
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip={{ children: label }}
                            className="py-5.5 [&>[data-chevron]]:ml-auto"
                            aria-expanded={isGroupOpen}
                            onClick={toggleGroup}
                        >
                            {LabelIcon && <LabelIcon className="size-4 text-[#d8a200] dark:text-[var(--color-alpha)]" />}
                            <span>{label}</span>
                            <ChevronDown
                                data-chevron
                                className={`size-4 text-[var(--color-alpha)] opacity-80 transition-transform ${isGroupOpen ? 'rotate-180' : ''}`}
                            />
                        </SidebarMenuButton>
                        <SidebarMenuSub
                            className={`${isGroupOpen ? 'block' : 'hidden'} mt-1 mx-0 translate-x-0 border-0 px-0 py-0 pl-4`}
                        >
                            {items.map((item) => {
                                const href = typeof item.href === 'string' ? item.href : item.href.url;
                                const isActive = page.url.startsWith(href);
                                return (
                                    <Rolegard
                                        key={item.id ?? item.title}
                                        authorized={item.authorizedRoles ?? []}
                                        except={item.excludedRoles ?? []}
                                    >
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                tooltip={{ children: item.title }}
                                                className="py-5.5"
                                            >
                                                <Link href={item.href} prefetch>
                                                    {item.icon && (
                                                        <item.icon className="size-4 text-[#d8a200] dark:text-[var(--color-alpha)]" />
                                                    )}
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </Rolegard>
                                );
                            })}
                        </SidebarMenuSub>
                    </SidebarMenuItem>
                )}
                {!(label && collapsible) && items.map((item) => renderItem(item))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
