import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

// ─── SMS domain types ───────────────────────────────────────────────────────

export interface SmsGroup {
    id: number;
    name: string;
    contacts_count?: number;
    created_at?: string;
    contacts?: SmsContact[];
}

export interface SmsContact {
    id: number;
    phone: string;
    name: string | null;
    group_id: number;
    group?: string;
}

export interface SmsTemplate {
    id: number;
    title: string;
    message_body: string;
}

export type SmsStatus = 'sent' | 'failed' | 'pending';

export interface SmsHistory {
    id: number;
    message_body: string;
    status: SmsStatus;
    sent_at: string;
    contact?: { phone: string; name: string | null };
    template?: { title: string } | null;
}

export interface PaginatedData<T> {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}
