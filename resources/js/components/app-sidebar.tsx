import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FileText, LayoutGrid, MessageSquare, Phone, Send, Users } from 'lucide-react';
import AppLogo from './app-logo';
import { useTranslate } from '@/hooks/use-translate';

export function AppSidebar() {
    const { auth } = usePage<any>().props;
    const { t } = useTranslate();
    const isAdmin = auth.user?.roles?.includes('Admin');

    const mainNavItems: NavItem[] = [
        {
            title: t('Dashboard'),
            url: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: t('SMS Sending'),
            url: '/send-sms',
            icon: Send,
        },
        {
            title: t('SMS Groups'),
            url: '/sms-groups',
            icon: Users,
        },
        {
            title: t('Contacts'),
            url: '/contacts',
            icon: Phone,
        },
        {
            title: t('Templates'),
            url: '/templates',
            icon: FileText,
        },
        {
            title: t('History'),
            url: '/history',
            icon: MessageSquare,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: t('Documentation'),
            url: 'https://laravel.com/docs/starter-kits',
            icon: BookOpen,
        },
    ];

    const items = [...mainNavItems];
    if (isAdmin) {
        items.push({
            title: t('Users'),
            url: '/users',
            icon: Users,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={items} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
