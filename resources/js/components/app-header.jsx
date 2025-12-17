import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar,  } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { Award, BookOpen, Folder, LayoutGrid, LibraryBig, Medal, Menu, Search, Workflow, Gamepad2, Building2, Timer, Home, Bell } from 'lucide-react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';
import ThemeToggle from './ThemeToggle';
import SearchDialog from './search-dialog';
import ChatIcon from './chat/ChatIcon';
import NotificationIcon from './NotificationIcon';




const activeItemStyles = 'text-neutral-900 dark:bg-neutral-800 dark:text-dark dark:bg-alpha';



export function AppHeader({ breadcrumbs = [] }) {
    const page = usePage();
    const { auth } = page.props;
    const mainNavItems = [
        {
            title: 'Home',
            url: '/feed',
            icon: Home,
        },
        {
            title: 'Leaderboard',
            url: '/students/leaderboard',
            icon: Medal,
        },
        {
            title: 'Spaces ',
            url: '/student/spaces',
            icon: Building2,

        },
        { title: 'Reservations', url: '/student/reservations', icon: Timer },

        {
            title: 'Projects',
            url: '/projects',
            icon: Folder
        },
        // {
        //     title: 'Games',
        //     url: '/games',
        //     icon: Gamepad2,
        // },
    ];
    const getInitials = useInitials();
    return (
        <>
            <div className={`border-sidebar-border/80 ${auth.user.role.includes('student') && 'fixed'} z-30 bg-light dark:bg-dark  mx-auto w-full border-b`}>
                <div className="mx-auto flex justify-between h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden flex items-center">
                        <SearchDialog
                            trigger={
                                <Button variant="ghost" size="icon" className="h-[34px] w-[34px]">
                                    <Search className="h-5 w-5" />
                                </Button>
                            }
                        />
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px]">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="bg-sidebar flex h-full w-64 flex-col items-stretch justify-between">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <Link href="/feed" prefetch className="flex items-center space-x-2">
                                        <AppLogo />
                                    </Link>
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className={`flex flex-col space-y-4 ${auth.user.language == "ar" ? 'items-end' : ''}`}>
                                            {mainNavItems.map((item) => (
                                                <Link key={item.title} href={item.url} className={`flex items-center space-x-2 font-medium ${auth.user.language == "ar" ? 'flex-row-reverse gap-2' : ''}`}>
                                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>

                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link href="/feed" prefetch className="flex items-center space-x-2">
                        <AppLogo />
                    </Link>
                    <SearchDialog className="hidden sm:flex ml-4 dark:bg-light/10 dark:hover:bg-light/10 bg-dark_gray/4" />
                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full z-50  items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className={`flex h-full items-stretch space-x-2 ${auth.user.language == "ar" ? 'flex-row-reverse' : ''}`}>
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem key={index} className="relative flex h-full items-center">
                                        <Link
                                            href={item.url}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                page.url === item.url && activeItemStyles,
                                                'h-9 cursor-pointer px-3',
                                            )}
                                        >
                                            {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                                            {item.title}
                                        </Link>
                                        {page.url === item.url && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-alpha dark:bg-white"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        <div className="flex items-center gap-4">
                            <ChatIcon />
                            <NotificationIcon />
                    
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="size-10 rounded-full p-1">
                                        <Avatar className="size-8 overflow-hidden rounded-full" image={auth.user.image} name={auth.user.name} lastActivity={null} onlineCircleClass="hidden" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <div className="">
                                {/* component change mode */}
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="border-sidebar-border/70 flex w-full border-b">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
