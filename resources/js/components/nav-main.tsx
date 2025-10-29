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

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
    const toggleOpen = (key: string) => setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const href = typeof item.href === 'string' ? item.href : item.href.url;
                    const isActive = page.url.startsWith(href);
                    const hasChildren = !!item.children && item.children.length > 0;
                    const isOpen = !!openMap[item.title];
                    return (
                        <SidebarMenuItem key={item.title}>
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
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
