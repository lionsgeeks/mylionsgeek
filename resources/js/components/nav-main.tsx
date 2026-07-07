import Rolegard from '@/components/rolegard';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function NavMain({
    items = [],
    label,
    collapsible = false,
}: {
    items: NavItem[];
    label?: string;
    collapsible?: boolean;
}) {
    const page = usePage();
    const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
    const [isGroupOpen, setIsGroupOpen] = useState(true);

    const toggleOpen = (key: string) => setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));
    const toggleGroup = () => setIsGroupOpen((prev) => !prev);

    return (
        <SidebarGroup className="px-2 py-0">
            {label && (
                collapsible ? (
                    <button
                        onClick={toggleGroup}
                        className="group/label flex w-full items-center justify-between px-2 py-1.5 text-xs font-medium text-sidebar-foreground/70 outline-none transition-colors hover:text-sidebar-foreground group-data-[collapsible=icon]:hidden"
                    >
                        <span>{label}</span>
                        <ChevronDown
                            className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isGroupOpen ? '' : '-rotate-90'}`}
                        />
                    </button>
                ) : (
                    <SidebarGroupLabel>{label}</SidebarGroupLabel>
                )
            )}
            <div
                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                    collapsible && !isGroupOpen ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'
                }`}
            >
                <SidebarMenu>
                    {items.map((item) => {
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
                                            {item.icon && <item.icon className="text-[var(--color-alpha)]" />}
                                            <span>{item.title}</span>
                                            <ChevronDown
                                                data-chevron
                                                className={`text-[var(--color-alpha)] opacity-80 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
                                                {item.icon && <item.icon className="text-[#d8a200] dark:text-[var(--color-alpha)]" />}
                                                <span>{item.title}</span>
                                                {item.chevron && <ChevronRight data-chevron className="text-[var(--color-alpha)] opacity-80" />}
                                            </Link>
                                        </SidebarMenuButton>
                                    )}
                                    {typeof item.badge !== 'undefined' && (
                                        <SidebarMenuBadge className="bg-destructive text-destructive-foreground">{item.badge}</SidebarMenuBadge>
                                    )}
                                    {hasChildren && (
                                        <SidebarMenuSub className={`${isOpen ? 'block' : 'hidden'} mt-1 ml-8 border-l border-sidebar-border/50 pl-2`}>
                                            {item.children?.map((sub) => {
                                                const subHref = typeof sub.href === 'string' ? sub.href : sub.href.url;
                                                const subActive = page.url.startsWith(subHref);
                                                return (
                                                    <SidebarMenuSubItem key={sub.title}>
                                                        <SidebarMenuSubButton asChild isActive={subActive}>
                                                            <Link href={sub.href} prefetch>
                                                                {sub.icon && <sub.icon className="text-[var(--color-alpha)]" />}
                                                                <span>{sub.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    )}
                                </SidebarMenuItem>
                            </Rolegard>
                        );
                    })}
                </SidebarMenu>
            </div>
        </SidebarGroup>
    );
}
