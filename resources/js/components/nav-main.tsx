import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from '@/components/ui/sidebar';
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
                                    className="text-white [&>[data-chevron]]:ml-auto [&>svg]:text-yellow-500"
                                    aria-expanded={isOpen}
                                    onClick={() => toggleOpen(item.title)}
                                >
                                    {item.icon && <item.icon className="text-yellow-500" />}
                                    <span className="text-white">{item.title}</span>
                                    <ChevronDown
                                        data-chevron
                                        className={`text-yellow-500 opacity-80 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                    />
                                </SidebarMenuButton>
                            ) : (
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    tooltip={{ children: item.title }}
                                    className="text-white [&>[data-chevron]]:ml-auto [&>svg]:text-yellow-500"
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon className="text-yellow-500" />}
                                        <span className="text-white">{item.title}</span>
                                        {item.chevron && (
                                            <ChevronRight data-chevron className="text-yellow-500 opacity-80" />
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            )}
                            {typeof item.badge !== 'undefined' && (
                                <SidebarMenuBadge className="bg-red-600 text-white">{item.badge}</SidebarMenuBadge>
                            )}
                            {hasChildren && (
                                <SidebarMenuSub className={`${isOpen ? 'block' : 'hidden'} ml-8 mt-1 border-l border-white/10 pl-2`}>
                                    {item.children.map((sub) => {
                                        const subHref = typeof sub.href === 'string' ? sub.href : sub.href.url;
                                        const subActive = page.url.startsWith(subHref);
                                        return (
                                            <SidebarMenuSubItem key={sub.title}>
                                                <SidebarMenuSubButton asChild isActive={subActive} className="[&>svg]:text-yellow-500">
                                                    <Link href={sub.href} prefetch className="text-white">
                                                        {sub.icon && <sub.icon className="text-yellow-500" />}
                                                        <span className="text-white">{sub.title}</span>
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
