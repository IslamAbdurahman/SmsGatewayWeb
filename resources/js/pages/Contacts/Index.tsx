import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { type BreadcrumbItem, type SmsContact, type SmsGroup } from '@/types';
import { Phone, Pencil, Trash2, Plus, Search, X } from 'lucide-react';
import { useTranslate } from '@/hooks/use-translate';
import { PhoneInput } from '@/components/phone-input';
import { formatPhoneNumberIntl } from 'react-phone-number-input';



interface Props {
    contacts: { data: SmsContact[] };
    groups: SmsGroup[];
}

type FormData = { group_id: string; phone: string; name: string };

export default function Index({ contacts, groups }: Props) {
    const { t } = useTranslate();
    const breadcrumbs: BreadcrumbItem[] = [{ title: t('Contacts'), href: '/contacts' }];
    const { data, setData, post, put, reset, delete: destroy, errors } = useForm<FormData>({
        group_id: '',
        phone: '',
        name: '',
    });
    const [editing, setEditing] = useState<SmsContact | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [groupFilter, setGroupFilter] = useState('');

    const filtered = contacts.data.filter(c => {
        const matchSearch = c.phone.includes(search) || (c.name ?? '').toLowerCase().includes(search.toLowerCase());
        const matchGroup  = groupFilter ? String(c.group_id) === groupFilter : true;
        return matchSearch && matchGroup;
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/contacts', { onSuccess: () => { reset(); setCreateOpen(false); } });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        put(`/contacts/${editing.id}`, {
            onSuccess: () => { setEditing(null); reset(); setEditOpen(false); }
        });
    };

    const openEdit = (contact: SmsContact) => {
        setEditing(contact);
        setData({ group_id: String(contact.group_id), phone: contact.phone, name: contact.name ?? '' });
        setEditOpen(true);
    };

    const confirmDelete = (id: number) => {
        setDeletingId(id);
        setDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!deletingId) return;
        destroy(`/contacts/${deletingId}`, {
            onSuccess: () => {
                setDeleteOpen(false);
                setDeletingId(null);
            }
        });
    };

    const GroupSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
            <option value="">{t('Select Group')}</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Contacts')} />
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                        <Phone className="h-6 w-6 text-violet-500" />
                        {t('Contacts')}
                        <span className="ml-1 text-sm font-normal text-gray-400">({contacts.data.length} {t('records')})</span>
                    </h1>

                    {/* Create Dialog */}
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" /> {t('Add Contact')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent aria-describedby={undefined} className="dark:bg-gray-800 dark:border-gray-700">
                            <DialogHeader>
                                <DialogTitle className="dark:text-white">{t('New Contact')}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={submitCreate} className="flex flex-col gap-3">
                                <div>
                                    <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder={t('Name (optional)')} className="dark:bg-gray-700 dark:text-white" />
                                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                </div>
                                <div>
                                    <PhoneInput value={data.phone} onChange={v => setData('phone', v)} />
                                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                                </div>
                                <div>
                                    <GroupSelect value={data.group_id} onChange={v => setData('group_id', v)} />
                                    {errors.group_id && <p className="mt-1 text-xs text-red-500">{errors.group_id}</p>}
                                </div>
                                <Button type="submit">{t('Save')}</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filter Row */}
                <div className="mt-4 flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={t('Search by name or phone...')}
                            className="pl-9 pr-9"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Group filter */}
                    <select
                        value={groupFilter}
                        onChange={e => setGroupFilter(e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">{t('All Group')}</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>

                    {(search || groupFilter) && (
                        <button
                            onClick={() => { setSearch(''); setGroupFilter(''); }}
                            className="flex items-center gap-1 rounded-md px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <X className="h-4 w-4" /> {t('Clear')}
                        </button>
                    )}
                </div>

                {/* Edit Dialog */}
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent aria-describedby={undefined} className="dark:bg-gray-800 dark:border-gray-700">
                        <DialogHeader>
                            <DialogTitle className="dark:text-white">{t('Edit Contact')}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitEdit} className="flex flex-col gap-3">
                            <div>
                                <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder={t('Name (optional)')} className="dark:bg-gray-700 dark:text-white" />
                                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <div>
                                <PhoneInput value={data.phone} onChange={v => setData('phone', v)} />
                                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                            </div>
                            <div>
                                <GroupSelect value={data.group_id} onChange={v => setData('group_id', v)} />
                                {errors.group_id && <p className="mt-1 text-xs text-red-500">{errors.group_id}</p>}
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
                            {t('Delete Contact Warning')}
                        </p>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setDeleteOpen(false)}>{t('Cancel')}</Button>
                            <Button variant="destructive" onClick={handleDelete}>{t('Yes, delete')}</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <div className="mt-4 space-y-2">
                    {filtered.length === 0 && (
                        <p className="py-8 text-center text-sm text-gray-400">
                            {(search || groupFilter) ? t('No results found') : t('No contacts found')}
                        </p>
                    )}
                    {filtered.map((contact) => (
                        <div
                            key={contact.id}
                            className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {contact.name ?? <span className="italic text-gray-400">{t('Ismsiz')}</span>}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatPhoneNumberIntl(contact.phone) || contact.phone}
                                    {contact.group && (
                                        <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                            {contact.group}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => openEdit(contact)} className="flex items-center gap-1">
                                    <Pencil className="h-3 w-3" /> {t('Edit')}
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => confirmDelete(contact.id)} className="flex items-center gap-1">
                                    <Trash2 className="h-3 w-3" /> {t('Delete')}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
