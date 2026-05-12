import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/pagination';
import { PerPageSelect } from '@/components/per-page-select';
import { SearchableSelect } from '@/components/searchable-select';
import { type BreadcrumbItem, type SmsGroup, type User, type PaginatedData } from '@/types';
import { Users, Pencil, Trash2, Plus, Search, X, User as UserIcon } from 'lucide-react';
import { useTranslate } from '@/hooks/use-translate';

interface Props {
    groups: PaginatedData<SmsGroup & { user?: { id: number; name: string } }>;
    users: User[];
    filters: { user_id?: string; per_page?: string };
}

export default function Index({ groups, users, filters }: Props) {
    const { t } = useTranslate();
    const breadcrumbs: BreadcrumbItem[] = [{ title: t('SMS Groups'), href: '/sms-groups' }];
    const { data, setData, post, put, reset, delete: destroy, errors } = useForm({ name: '' });
    const [editingGroup, setEditingGroup] = useState<SmsGroup | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [search, setSearch] = useState('');

    const handleUserFilter = (userId: string) => {
        router.get('/sms-groups', { ...filters, user_id: userId === 'all' ? '' : userId }, { preserveState: true });
    };

    const filtered = groups.data.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase())
    );

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/sms-groups', { onSuccess: () => { reset(); setCreateOpen(false); } });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingGroup) return;
        put(`/sms-groups/${editingGroup.id}`, {
            onSuccess: () => { setEditingGroup(null); reset(); setEditOpen(false); }
        });
    };

    const openEdit = (group: SmsGroup) => {
        setEditingGroup(group);
        setData('name', group.name);
        setEditOpen(true);
    };

    const confirmDelete = (id: number) => {
        setDeletingId(id);
        setDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!deletingId) return;
        destroy(`/sms-groups/${deletingId}`, {
            onSuccess: () => {
                setDeleteOpen(false);
                setDeletingId(null);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('SMS Groups')} />
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                        <Users className="h-6 w-6 text-blue-500" />
                        {t('SMS Groups')}
                        <span className="ml-1 text-sm font-normal text-gray-400">({groups.meta.total} {t('records')})</span>
                    </h1>

                    {/* Create Dialog */}
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" /> {t('Create Group')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent aria-describedby={undefined} className="dark:bg-gray-800 dark:border-gray-700">
                            <DialogHeader>
                                <DialogTitle className="dark:text-white">{t('New Group')}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={submitCreate} className="flex flex-col gap-4">
                                <div>
                                    <Input
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder={t('Group name')}
                                        className="dark:bg-gray-700 dark:text-white"
                                        autoFocus
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                </div>
                                <Button type="submit">{t('Save')}</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filters */}
                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={t('Search by group name...')}
                            className="pl-9 pr-9"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {users.length > 0 && (
                        <div className="w-full sm:w-64">
                            <SearchableSelect
                                value={filters.user_id || ''}
                                onValueChange={handleUserFilter}
                                allLabel={t('All Users')}
                                options={users.map(u => ({ value: u.id.toString(), label: u.name }))}
                            />
                        </div>
                    )}

                    <div className="sm:ml-auto">
                        <PerPageSelect value={filters.per_page || 20} url="/sms-groups" />
                    </div>
                </div>

                {/* Edit Dialog */}
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent aria-describedby={undefined} className="dark:bg-gray-800 dark:border-gray-700">
                        <DialogHeader>
                            <DialogTitle className="dark:text-white">{t('Edit Group')}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitEdit} className="flex flex-col gap-4">
                            <div>
                                <Input
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder={t('Group name')}
                                    className="dark:bg-gray-700 dark:text-white"
                                    autoFocus
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <Button type="submit">{t('Update')}</Button>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirm Modal */}
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogContent aria-describedby={undefined} className="dark:bg-gray-800 dark:border-gray-700">
                        <DialogHeader>
                            <DialogTitle className="dark:text-white">{t('Confirm Delete')}</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('Delete Group Warning')}
                        </p>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setDeleteOpen(false)}>{t('Cancel')}</Button>
                            <Button variant="destructive" onClick={handleDelete}>{t('Yes, delete')}</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <div className="mt-6 space-y-2">
                    {filtered.length === 0 && (
                        <p className="py-8 text-center text-sm text-gray-400">
                            {search ? t('No results found') : t('No groups found')}
                        </p>
                    )}
                    {filtered.map((group) => (
                        <div
                            key={group.id}
                            className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div>
                                <Link
                                    href={`/sms-groups/${group.id}`}
                                    className="font-semibold text-gray-900 transition hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                                >
                                    {group.name}
                                </Link>
                                {group.contacts_count !== undefined && (
                                    <div className="flex items-center gap-4 mt-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {group.contacts_count} {t('contacts')}
                                        </p>
                                        {group.user && (
                                            <div className="flex items-center gap-1 text-xs text-blue-500 font-medium">
                                                <UserIcon className="h-3 w-3" />
                                                {group.user.name}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEdit(group)}
                                    className="flex items-center gap-1"
                                >
                                    <Pencil className="h-3 w-3" /> {t('Edit')}
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => confirmDelete(group.id)}
                                    className="flex items-center gap-1"
                                >
                                    <Trash2 className="h-3 w-3" /> {t('Delete')}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6">
                    <Pagination links={groups.links} meta={groups.meta} />
                </div>
            </div>
        </AppLayout>
    );
}