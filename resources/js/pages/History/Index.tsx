import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { type BreadcrumbItem, type SmsHistory, type PaginatedData, type User } from '@/types';
import { MessageSquare, CheckCircle2, XCircle, Clock, Search, Filter, X, CheckCheck, User as UserIcon } from 'lucide-react';
import { useTranslate } from '@/hooks/use-translate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPhoneNumberIntl } from 'react-phone-number-input';
import { Pagination } from '@/components/pagination';
import { PerPageSelect } from '@/components/per-page-select';

interface SimpleItem { id: number; name?: string; title?: string; }

interface Filters {
    status?: string;
    search?: string;
    from?: string;
    to?: string;
    group_id?: string;
    template_id?: string;
    user_id?: string;
}

interface Props {
    history: PaginatedData<SmsHistory & { user?: { id: number; name: string } }>;
    filters: Filters;
    groups: SimpleItem[];
    templates: SimpleItem[];
    users: User[];
}

export default function Index({ history, filters, groups, templates, users }: Props) {
    const { t } = useTranslate();

    const breadcrumbs: BreadcrumbItem[] = [{ title: t('SMS History'), href: '/history' }];

    const statusConfig = {
        sent:    { label: t('Sent'),    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500' },
        failed:  { label: t('Error'),   cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',                 dot: 'bg-red-500' },
        pending: { label: t('Pending'), cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',         dot: 'bg-amber-500' },
    };
    const [search,     setSearch]     = useState(filters.search     ?? '');
    const [status,     setStatus]     = useState(filters.status     ?? '');
    const [from,       setFrom]       = useState(filters.from       ?? '');
    const [to,         setTo]         = useState(filters.to         ?? '');
    const [groupId,    setGroupId]    = useState(filters.group_id   ?? '');
    const [templateId, setTemplateId] = useState(filters.template_id ?? '');
    const [userId,     setUserId]     = useState(filters.user_id     ?? '');
    const [perPage,    setPerPage]    = useState(filters.per_page   ?? 20);

    const buildParams = () => ({ search, status, from, to, group_id: groupId, template_id: templateId, user_id: userId, per_page: perPage });

    const applyFilters = () => {
        router.get('/history', buildParams(), { preserveScroll: true, replace: true });
    };

    const clearFilters = () => {
        setSearch(''); setStatus(''); setFrom(''); setTo(''); setGroupId(''); setTemplateId(''); setUserId('');
        router.get('/history', {}, { preserveScroll: true, replace: true });
    };

    const removeBadge = (key: string) => {
        const params: Record<string, string> = { ...buildParams(), [key]: '' };
        router.get('/history', params, { preserveScroll: true, replace: true });
    };

    const hasFilters = search || status || from || to || groupId || templateId || userId;

    const selectCls = "h-8 rounded-md border border-input bg-background px-2 py-0 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white";

    const { flash } = usePage<any>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('SMS History')} />
            <div className="p-6">

                {/* Flash Message */}
                {flash?.success && (
                    <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 dark:border-emerald-700 dark:bg-emerald-900/20">
                        <CheckCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">{flash.success}</p>
                    </div>
                )}

                <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                    <MessageSquare className="h-6 w-6 text-blue-500" />
                    {t('SMS History')}
                    <span className="ml-2 text-sm font-normal text-gray-400">({history.meta.total} {t('records')})</span>
                </h1>

                {/* Filter Panel - single row */}
                <div className="mb-4 rounded-xl border bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Search */}
                        <div className="relative w-44">
                            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                            <Input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                placeholder={t('Search placeholder')}
                                className="h-8 pl-8 text-sm"
                            />
                        </div>

                        {/* Status */}
                        <select value={status} onChange={e => setStatus(e.target.value)} className={selectCls}>
                            <option value="">{t('All Status')}</option>
                            <option value="sent">{t('Sent')}</option>
                            <option value="failed">{t('Error')}</option>
                            <option value="pending">{t('Pending')}</option>
                        </select>

                        {/* Group */}
                        <select value={groupId} onChange={e => setGroupId(e.target.value)} className={selectCls}>
                            <option value="">{t('All Group')}</option>
                            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>

                        {/* Template */}
                        <select value={templateId} onChange={e => setTemplateId(e.target.value)} className={selectCls}>
                            <option value="">{t('All Template')}</option>
                            {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                        </select>

                        {/* User */}
                        {users.length > 0 && (
                            <select value={userId} onChange={e => setUserId(e.target.value)} className={selectCls}>
                                <option value="">{t('All Users')}</option>
                                {users.map(u => <option key={u.id} value={u.id.toString()}>{u.name}</option>)}
                            </select>
                        )}

                        {/* Date from-to */}
                        <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="h-8 w-36 text-sm" />
                        <span className="text-xs text-gray-400">—</span>
                        <Input type="date" value={to}   onChange={e => setTo(e.target.value)}   className="h-8 w-36 text-sm" />

                        <Button onClick={applyFilters} size="sm" className="gap-1.5 h-8">
                            <Filter className="h-3.5 w-3.5" /> {t('Filter')}
                        </Button>

                        <div className="ml-auto">
                            <PerPageSelect value={filters.per_page || 20} url="/history" />
                        </div>

                        {hasFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1 text-gray-500">
                                <X className="h-3.5 w-3.5" /> {t('Clear')}
                            </Button>
                        )}
                    </div>

                    {/* Active filter badges */}
                    {hasFilters && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {search && (
                                <Badge label={`${t('Search')}: ${search}`} onRemove={() => removeBadge('search')} color="blue" />
                            )}
                            {status && (
                                <Badge label={`${t('Status')}: ${statusConfig[status as keyof typeof statusConfig]?.label}`} onRemove={() => removeBadge('status')} color="purple" />
                            )}
                            {groupId && (
                                <Badge label={`${t('Group')}: ${groups.find(g => String(g.id) === groupId)?.name}`} onRemove={() => removeBadge('group_id')} color="green" />
                            )}
                            {templateId && (
                                <Badge label={`${t('Templates')}: ${templates.find(t => String(t.id) === templateId)?.title}`} onRemove={() => removeBadge('template_id')} color="amber" />
                            )}
                            {userId && (
                                <Badge label={`${t('User')}: ${users.find(u => String(u.id) === userId)?.name}`} onRemove={() => removeBadge('user_id')} color="cyan" />
                            )}
                            {(from || to) && (
                                <Badge label={[from, to].filter(Boolean).join(' — ')} onRemove={() => { removeBadge('from'); removeBadge('to'); }} color="orange" />
                            )}
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                {[t('Phone / Name'), t('Group'), t('Message / Template'), t('User'), t('Status'), t('Time')].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                             {history.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-16 text-center text-gray-400">
                                        {hasFilters ? t('No results found') : t('No SMS sent yet')}
                                    </td>
                                </tr>
                            )}
                            {history.data.map((item) => {
                                const cfg = statusConfig[item.status as keyof typeof statusConfig] ?? statusConfig.pending;
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                        <td className="px-4 py-3">
                                            {item.contact?.name && (
                                                <span className="block text-xs text-gray-500">{item.contact.name}</span>
                                            )}
                                            <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                                {item.contact?.phone
                                                    ? (formatPhoneNumberIntl(item.contact.phone) || item.contact.phone)
                                                    : '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                                            {(item.contact as any)?.group_name ?? '—'}
                                        </td>
                                        <td className="max-w-xs px-4 py-3 text-gray-600 dark:text-gray-300">
                                            <p className="truncate">{item.message_body}</p>
                                            {item.template && (
                                                <span className="text-xs text-gray-400">{item.template.title}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                                            {item.user ? (
                                                <div className="flex items-center gap-1 text-blue-500 font-medium">
                                                    <UserIcon className="h-3 w-3" />
                                                    {item.user.name}
                                                </div>
                                            ) : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.cls}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                                                {cfg.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                                            {item.sent_at}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6">
                    <Pagination links={history.links} meta={history.meta} />
                </div>
            </div>
        </AppLayout>
    );
}

function Badge({ label, onRemove, color }: { label?: string; onRemove: () => void; color: string }) {
    const colors: Record<string, string> = {
        blue:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        green:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        amber:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    };
    return (
        <span className={`flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-medium ${colors[color] ?? colors.blue}`}>
            {label}
            <button type="button" onClick={onRemove} className="ml-0.5 hover:opacity-70">
                <X className="h-3 w-3" />
            </button>
        </span>
    );
}