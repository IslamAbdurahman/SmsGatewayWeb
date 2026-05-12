import { useState, useRef, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Pagination } from '@/components/pagination';
import { PerPageSelect } from '@/components/per-page-select';
import { type BreadcrumbItem, type SmsGroup, type SmsContact, type PaginatedData } from '@/types';
import { Pencil, Trash2, Plus, ArrowLeft, Upload, FileSpreadsheet, Download, Save, X } from 'lucide-react';
import { PhoneInput } from '@/components/phone-input';
import { formatPhoneNumberIntl } from 'react-phone-number-input';
import { useTranslate } from '@/hooks/use-translate';

interface Props {
    group: SmsGroup;
    contacts: PaginatedData<SmsContact>;
    filters: { per_page?: string };
}

export default function Show({ group, contacts, filters }: Props) {
    const { t } = useTranslate();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('SMS Groups'), href: '/sms-groups' },
        { title: group.name, href: `/sms-groups/${group.id}` },
    ];

    const { flash } = usePage<any>().props;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importOpen, setImportOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [editContactOpen, setEditContactOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<SmsContact | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editGroupName, setEditGroupName] = useState(false);
    
    // Polling for background import
    const [importStatus, setImportStatus] = useState<any>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [activeCacheKey, setActiveCacheKey] = useState<string | null>(null);

    // Group name edit form
    const { data: groupForm, setData: setGroupForm, put: putGroup, processing: savingGroup, errors: groupErrors, reset: resetGroup } = useForm({
        name: group.name,
    });

    // Import form
    const { data: importData, setData: setImportData, post: postImport, processing: importing, reset: resetImport, errors: importErrors } = useForm({
        file: null as File | null,
    });

    // Create contact form
    const { data: contactData, setData: setContactData, post: postContact, reset: resetContact, processing: savingContact, errors: contactErrors } = useForm({
        group_id: String(group.id),
        phone: '',
        name: '',
    });

    // Edit contact form
    const { data: editData, setData: setEditData, put: putContact, processing: savingEdit, errors: editErrors, reset: resetEdit } = useForm({
        phone: '',
        name: '',
        group_id: String(group.id),
    });

    const submitGroup = (e: React.FormEvent) => {
        e.preventDefault();
        putGroup(`/sms-groups/${group.id}`, {
            onSuccess: () => setEditGroupName(false),
        });
    };

    const submitContact = (e: React.FormEvent) => {
        e.preventDefault();
        postContact('/contacts', {
            onSuccess: () => {
                resetContact();
                setCreateOpen(false);
            },
        });
    };

    const openEditContact = (contact: SmsContact) => {
        setEditingContact(contact);
        setEditData({ phone: contact.phone, name: contact.name ?? '', group_id: String(group.id) });
        setEditContactOpen(true);
    };

    const submitEditContact = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingContact) return;
        putContact(`/contacts/${editingContact.id}`, {
            onSuccess: () => {
                resetEdit();
                setEditContactOpen(false);
                setEditingContact(null);
            },
        });
    };

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!importData.file) return;
        postImport(`/sms-groups/${group.id}/import`, {
            onSuccess: (page) => {
                resetImport();
                setImportOpen(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
                
                const flashData = (page.props as any).flash;
                if (flashData?.import_queued && flashData?.cache_key) {
                    setActiveCacheKey(flashData.cache_key);
                    setIsPolling(true);
                }
            },
        });
    };

    useEffect(() => {
        let interval: any;
        if (isPolling && activeCacheKey) {
            interval = setInterval(async () => {
                try {
                    const response = await fetch(`/sms-groups/import-status?key=${activeCacheKey}`);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const data = await response.json();
                    
                    if (data.status === 'done' || data.status === 'failed') {
                        setImportStatus(data);
                        setIsPolling(false);
                        setActiveCacheKey(null);
                        clearInterval(interval);
                        
                        if (data.status === 'done') {
                            // Use router.reload to refresh contacts list without full page reload
                            router.reload({ only: ['contacts', 'group'] });
                        }
                    } else {
                        setImportStatus(data);
                    }
                } catch (error) {
                    console.error('Polling error:', error);
                }
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [isPolling, activeCacheKey]);

    const confirmDelete = (id: number) => {
        setDeletingId(id);
        setDeleteOpen(true);
    };

    const { delete: destroy } = useForm();
    const handleDelete = () => {
        if (!deletingId) return;
        destroy(`/contacts/${deletingId}`, {
            onSuccess: () => {
                setDeleteOpen(false);
                setDeletingId(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${group.name} - ${t('Contacts')}`} />
            <div className="p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/sms-groups" className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            {editGroupName ? (
                                <form onSubmit={submitGroup} className="flex items-center gap-2">
                                    <Input
                                        value={groupForm.name}
                                        onChange={e => setGroupForm('name', e.target.value)}
                                        className="h-8 text-xl font-bold"
                                        autoFocus
                                    />
                                    <Button type="submit" size="sm" disabled={savingGroup}>
                                        <Save className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => { setEditGroupName(false); resetGroup(); }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                    {groupErrors.name && (
                                        <p className="text-xs text-red-500">{groupErrors.name}</p>
                                    )}
                                </form>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{group.name}</h1>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditGroupName(true)}
                                        className="h-7 w-7 p-0 text-gray-400 hover:text-gray-700"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <p className="text-sm text-gray-500">{contacts.meta.total} {t('records')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <PerPageSelect value={filters.per_page || 20} url={`/sms-groups/${group.id}`} />

                        {/* Excel Import Dialog */}
                        <Dialog open={importOpen} onOpenChange={setImportOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Upload className="h-4 w-4" /> {t('Excel Import')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent aria-describedby={undefined} className="dark:bg-gray-800">
                                <DialogHeader>
                                    <DialogTitle>{t('Import Contacts via Excel')}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleImport} className="space-y-4">
                                    <div className="rounded-lg border-2 border-dashed p-6 text-center">
                                        <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="mt-2 text-sm text-gray-600">
                                            <label className="cursor-pointer font-semibold text-blue-600 hover:text-blue-500">
                                                {t('Select File')}
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="sr-only"
                                                    accept=".xlsx,.xls,.csv"
                                                    onChange={e => setImportData('file', e.target.files?.[0] || null)}
                                                />
                                            </label>
                                            <p className="mt-1 text-xs text-gray-500">{t('XLSX, XLS or CSV (max 10MB)')}</p>
                                        </div>
                                        {importData.file && (
                                            <p className="mt-2 text-sm font-medium text-green-600">{importData.file.name}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                                        <p className="text-xs text-blue-700 dark:text-blue-300">
                                            <strong>{t('Note')}:</strong> {t('First column phone, second column name (optional).')}
                                        </p>
                                        <a
                                            href="/sms-groups/download-template"
                                            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                                            download
                                        >
                                            <Download className="h-3 w-3" /> {t('Template')}
                                        </a>
                                    </div>
                                    {importErrors.file && <p className="text-sm text-red-500">{importErrors.file}</p>}
                                    <Button type="submit" className="w-full" disabled={importing || !importData.file}>
                                        {importing ? t('Uploading...') : t('Start Upload')}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Create Contact Dialog */}
                        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" /> {t('Add Contact')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent aria-describedby={undefined} className="dark:bg-gray-800">
                                <DialogHeader>
                                    <DialogTitle>{t('New Contact')}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={submitContact} className="space-y-3">
                                        <Input
                                            placeholder={t('Name (optional)')}
                                            value={contactData.name}
                                            onChange={e => setContactData('name', e.target.value)}
                                        />
                                        {contactErrors.name && <p className="mt-1 text-xs text-red-500">{contactErrors.name}</p>}
                                    </div>
                                    <div>
                                        <PhoneInput
                                            value={contactData.phone}
                                            onChange={val => setContactData('phone', val)}
                                        />
                                        {contactErrors.phone && <p className="mt-1 text-xs text-red-500">{contactErrors.phone}</p>}
                                    </div>
                                    {contactErrors.group_id && <p className="text-xs text-red-500">{contactErrors.group_id}</p>}
                                    <Button type="submit" className="w-full" disabled={savingContact}>
                                        {savingContact ? t('Saving...') : t('Save')}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Flash Messages for Import Stats & Background Polling */}
                <div className="mt-6 space-y-4">
                    {/* Synchronous Results (if any) */}
                    {flash && flash.imported !== undefined && (
                        <Alert className="border-green-500/50 bg-green-50/50 dark:bg-green-900/10">
                            <AlertTitle className="text-green-700 dark:text-green-400">{t('Import Completed!')}</AlertTitle>
                            <AlertDescription className="text-sm text-green-600 dark:text-green-300">
                                <ul className="list-inside list-disc mt-1">
                                    <li>{t('Successful')}: <b>{flash.imported}</b> {t('records')}</li>
                                    <li>{t('Skipped (invalid format)')}: <b>{flash.skipped}</b> {t('records')}</li>
                                    <li>{t('Duplicates')}: <b>{flash.duplicates}</b> {t('records')}</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Background Polling Status */}
                    {isPolling && (
                        <Alert className="border-blue-500/50 bg-blue-50/50 dark:bg-blue-900/10">
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                                <div>
                                    <AlertTitle className="text-blue-700 dark:text-blue-400">{t('Importing in background...')}</AlertTitle>
                                    <AlertDescription className="text-sm text-blue-600 dark:text-blue-300">
                                        {t('Please wait while we process your file. This may take a few moments.')}
                                    </AlertDescription>
                                </div>
                            </div>
                        </Alert>
                    )}

                    {/* Final Background Result */}
                    {importStatus && importStatus.status === 'done' && (
                        <Alert className="border-green-500/50 bg-green-50/50 dark:bg-green-900/10">
                            <AlertTitle className="text-green-700 dark:text-green-400">{t('Background Import Completed!')}</AlertTitle>
                            <AlertDescription className="text-sm text-green-600 dark:text-green-300">
                                <ul className="list-inside list-disc mt-1">
                                    <li>{t('Successful')}: <b>{importStatus.imported}</b> {t('records')}</li>
                                    <li>{t('Skipped (invalid format)')}: <b>{importStatus.skipped}</b> {t('records')}</li>
                                    <li>{t('Duplicates')}: <b>{importStatus.duplicates}</b> {t('records')}</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Background Failure */}
                    {importStatus && importStatus.status === 'failed' && (
                        <Alert variant="destructive">
                            <AlertTitle>{t('Import Failed')}</AlertTitle>
                            <AlertDescription>
                                {importStatus.error || t('An unknown error occurred during import.')}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                {/* Contact Table */}
                <div className="mt-8 overflow-hidden rounded-xl border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300">
                            <tr>
                                <th className="w-12 px-6 py-4 font-medium">#</th>
                                <th className="px-6 py-4 font-medium">{t('Name')}</th>
                                <th className="px-6 py-4 font-medium">{t('Phone')}</th>
                                <th className="px-6 py-4 font-medium text-right">{t('Actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {contacts.data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        {t('No contacts yet. You can add them via Excel or manually.')}
                                    </td>
                                </tr>
                            ) : (
                                contacts.data.map((contact, index) => (
                                    <tr key={contact.id} className="transition hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 text-xs font-mono text-gray-400">
                                            {(contacts.meta.current_page - 1) * contacts.meta.per_page + index + 1}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {contact.name || <span className="italic text-gray-400">{t('No Name')}</span>}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {formatPhoneNumberIntl(contact.phone) || contact.phone}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditContact(contact)}
                                                    className="text-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                                                    onClick={() => confirmDelete(contact.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6">
                    <Pagination links={contacts.links} meta={contacts.meta} />
                </div>

                {/* Edit Contact Dialog */}
                <Dialog open={editContactOpen} onOpenChange={setEditContactOpen}>
                    <DialogContent aria-describedby={undefined} className="dark:bg-gray-800">
                        <DialogHeader>
                            <DialogTitle>{t('Edit Contact')}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitEditContact} className="space-y-3">
                                <Input
                                    placeholder={t('Name (optional)')}
                                    value={editData.name}
                                    onChange={e => setEditData('name', e.target.value)}
                                />
                                {editErrors.name && <p className="mt-1 text-xs text-red-500">{editErrors.name}</p>}
                            </div>
                            <div>
                                <PhoneInput
                                    value={editData.phone}
                                    onChange={val => setEditData('phone', val)}
                                />
                                {editErrors.phone && <p className="mt-1 text-xs text-red-500">{editErrors.phone}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={savingEdit}>
                                {savingEdit ? t('Updating...') : t('Update')}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirm Modal */}
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogContent aria-describedby={undefined} className="dark:bg-gray-800">
                        <DialogHeader>
                            <DialogTitle>{t('Confirm Delete')}</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('Delete Contact Warning')}
                        </p>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setDeleteOpen(false)}>{t('Cancel')}</Button>
                            <Button variant="destructive" onClick={handleDelete}>{t('Delete')}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
