import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SmsHistory } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { MessageSquare, Phone, Send, Users, FileText } from 'lucide-react';
import { useTranslate } from '@/hooks/use-translate';



interface Stats {
    groups: number;
    contacts: number;
    templates: number;
    sent_today: number;
    pending: number;
    failed: number;
}

interface Props {
    stats: Stats;
    recent_history: { data: SmsHistory[] };
}

const statusColors: Record<string, string> = {
    sent:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    failed:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function Dashboard({ stats, recent_history }: Props) {
    const { t } = useTranslate();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('Dashboard'), href: '/dashboard' },
    ];
    const cards = [
        { label: t('SMS Groups'), value: stats.groups,     icon: Users,         href: '/sms-groups', color: 'from-blue-500 to-blue-600' },
        { label: t('Contacts'),   value: stats.contacts,   icon: Phone,         href: '/contacts',   color: 'from-violet-500 to-violet-600' },
        { label: t('Templates'),  value: stats.templates,  icon: FileText,      href: '/templates',  color: 'from-amber-500 to-amber-600' },
        { label: t('Sent Today'), value: stats.sent_today, icon: Send,       href: '/history?status=sent',    color: 'from-emerald-500 to-emerald-600' },
        { label: t('Pending'),    value: stats.pending,    icon: MessageSquare, href: '/history?status=pending', color: 'from-orange-400 to-orange-500' },
        { label: t('Errors'),     value: stats.failed,     icon: MessageSquare, href: '/history?status=failed',  color: 'from-red-500 to-red-600' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Dashboard')} />
            <div className="flex flex-1 flex-col gap-6 p-6">

                {/* Stat Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.map(({ label, value, icon: Icon, href, color }) => (
                        <Link
                            key={label}
                            href={href}
                            className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:shadow-md dark:bg-gray-800 dark:ring-white/10"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 transition group-hover:opacity-5`} />
                            <div className="flex items-center gap-4">
                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Quick Send Button */}
                <div className="flex justify-end">
                    <Link
                        href="/send-sms"
                        className="inline-flex items-center gap-2 rounded-lg bg- gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:opacity-90 transition"
                    >
                        <Send className="h-4 w-4" />
                        {t('Send SMS')}
                    </Link>
                </div>

                {/* Recent History */}
                <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10">
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
                        <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                            {t('Recent SMS History')}
                        </h2>
                        <Link href="/history" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                            {t('View all')} →
                        </Link>
                    </div>

                    {recent_history.data.length === 0 ? (
                        <p className="px-6 py-8 text-center text-sm text-gray-400">{t('No SMS sent yet')}</p>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {recent_history.data.map((item) => (
                                <div key={item.id} className="flex items-start gap-4 px-6 py-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                            {item.contact?.name ?? item.contact?.phone ?? '—'}
                                            <span className="ml-2 text-xs text-gray-400">{item.contact?.phone}</span>
                                        </p>
                                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">{item.message_body}</p>
                                    </div>
                                    <div className="flex shrink-0 flex-col items-end gap-1">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[item.status] ?? ''}`}>
                                            {t(item.status.charAt(0).toUpperCase() + item.status.slice(1))}
                                        </span>
                                        <span className="text-xs text-gray-400">{item.sent_at}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
