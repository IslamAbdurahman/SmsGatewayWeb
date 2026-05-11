import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { type BreadcrumbItem, type SmsTemplate } from '@/types';
import { FileText, Pencil, Trash2, Plus, Search, X } from 'lucide-react';
import { useTranslate } from '@/hooks/use-translate';



interface Props {
    templates: { data: SmsTemplate[] };
}

type FormData = { title: string; message_body: string };

export default function Index({ templates }: Props) {
    const { t } = useTranslate();
    const breadcrumbs: BreadcrumbItem[] = [{ title: t('Templates'), href: '/templates' }];
    const { data, setData, post, put, reset, delete: destroy, errors } = useForm<FormData>({ title: '', message_body: '' });
    const [editing, setEditing] = useState<SmsTemplate | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [search, setSearch] = useState('');

    const filtered = templates.data.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.message_body.toLowerCase().includes(search.toLowerCase())
    );

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/templates', { onSuccess: () => { reset(); setCreateOpen(false); } });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        put(`/templates/${editing.id}`, {
            onSuccess: () => { setEditing(null); reset(); setEditOpen(false); }
        });
    };

    const openEdit = (template: SmsTemplate) => {
        setEditing(template);
        setData({ title: template.title, message_body: template.message_body });
        setEditOpen(true);
    };

    const confirmDelete = (id: number) => {
        setDeletingId(id);
        setDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!deletingId) return;
        destroy(`/templates/${deletingId}`, {
            onSuccess: () => {
                setDeleteOpen(false);
                setDeletingId(null);
            }
        });
    };



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('SMS Templates')} />
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                        <FileText className="h-6 w-6 text-amber-500" />
                        {t('SMS Templates')}
                        <span className="ml-1 text-sm font-normal text-gray-400">({templates.data.length} {t('records')})</span>
                    </h1>

                    {/* Create Dialog */}
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => { reset(); }} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" /> {t('Create Template')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent aria-describedby={undefined} className="dark:bg-gray-800 dark:border-gray-700">
                            <DialogHeader>
                                <DialogTitle className="dark:text-white">{t('New Template')}</DialogTitle>
                                <p className="sr-only" id="dialog-description-create">Yangi shablon qo'shish formasi</p>
                            </DialogHeader>
                            <form onSubmit={submitCreate} className="flex flex-col gap-3">
                                <div>
                                    <Input
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        placeholder={t('Template name')}
                                        className="dark:bg-gray-700 dark:text-white"
                                    />
                                    {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                                </div>
                                <div>
                                    <textarea
                                        value={data.message_body}
                                        onChange={e => setData('message_body', e.target.value)}
                                        placeholder={t('SMS body (max 160 chars)')}
                                        maxLength={160}
                                        rows={4}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                    <p className="mt-1 text-[10px] text-gray-400">
                                        {t('Use [name] to personalize messages.')}
                                    </p>
                                    {errors.message_body && <p className="mt-1 text-xs text-red-500">{errors.message_body}</p>}
                                </div>
                                <p className="text-right text-xs text-gray-400">{data.message_body.length}/160</p>
                                <Button type="submit">{t('Save')}</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Edit Dialog */}
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent aria-describedby={undefined} className="dark:bg-gray-800 dark:border-gray-700">
                        <DialogHeader>
                            <DialogTitle className="dark:text-white">{t('Edit Template')}</DialogTitle>
                            <p className="sr-only" id="dialog-description-edit">Shablonni tahrirlash formasi</p>
                        </DialogHeader>
                        <form onSubmit={submitEdit} className="flex flex-col gap-3">
                            <div>
                                <Input
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    placeholder={t('Template name')}
                                    className="dark:bg-gray-700 dark:text-white"
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                            </div>
                            <div>
                                <textarea
                                    value={data.message_body}
                                    onChange={e => setData('message_body', e.target.value)}
                                    placeholder={t('SMS body (max 160 chars)')}
                                    maxLength={160}
                                    rows={4}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                <p className="mt-1 text-[10px] text-gray-400">
                                    {t('Use [name] to personalize messages.')}
                                </p>
                                {errors.message_body && <p className="mt-1 text-xs text-red-500">{errors.message_body}</p>}
                            </div>
                            <p className="text-right text-xs text-gray-400">{data.message_body.length}/160</p>
                            <Button type="submit">{t('Update')}</Button>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirm Modal */}
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogContent aria-describedby={undefined} className="dark:bg-gray-800 dark:border-gray-700">
                        <DialogHeader>
                            <DialogTitle className="dark:text-white">{t('Confirm Delete')}</DialogTitle>
                            <p className="sr-only" id="dialog-description-delete">Shablonni o'chirish tasdig'i</p>
                        </DialogHeader>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('Delete Template Warning')}
                        </p>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setDeleteOpen(false)}>{t('Cancel')}</Button>
                            <Button variant="destructive" onClick={handleDelete}>{t('Yes, delete')}</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Search Bar */}
                <div className="mt-4 relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={t('Search by template name or body...')}
                        className="pl-9 pr-9"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="mt-6 space-y-2">
                    {filtered.length === 0 && (
                        <p className="py-8 text-center text-sm text-gray-400">
                            {search ? t('No results found') : t('No templates found')}
                        </p>
                    )}
                    {filtered.map((template) => (
                        <div
                            key={template.id}
                            className="flex items-start justify-between rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div className="flex-1 min-w-0 pr-4">
                                <p className="font-semibold text-gray-900 dark:text-white">{template.title}</p>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{template.message_body}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => openEdit(template)} className="flex items-center gap-1">
                                    <Pencil className="h-3 w-3" /> {t('Edit')}
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => confirmDelete(template.id)} className="flex items-center gap-1">
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