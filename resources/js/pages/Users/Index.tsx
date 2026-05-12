import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash2, Edit2, Plus, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslate } from '@/hooks/use-translate';

interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
    created_at: string;
}

interface Props {
    users: User[];
}

export default function Index({ users }: Props) {
    const { t } = useTranslate();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const openAddModal = () => {
        clearErrors();
        reset();
        setIsAddOpen(true);
    };

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        post('/users', {
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
            },
        });
    };

    const openEditModal = (user: User) => {
        clearErrors();
        reset();
        setEditingUser(user);
        setData({ name: user.name, email: user.email, password: '', password_confirmation: '' });
        setIsEditOpen(true);
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        put(`/users/${editingUser.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingUser(null);
                reset();
            },
        });
    };

    const confirmDelete = (id: number) => {
        setDeletingUserId(id);
        setIsDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!deletingUserId) return;
        destroy(`/users/${deletingUserId}`, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setDeletingUserId(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: t('Users'), href: '/users' }]}>
            <Head title={t('Users')} />
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('Users')}</h1>
                    <Button onClick={openAddModal} className="gap-2">
                        <Plus className="h-4 w-4" /> {t('Add User')}
                    </Button>
                </div>

                <div className="rounded-xl border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                            <thead className="bg-gray-50 text-gray-700 dark:bg-gray-700/50 dark:text-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-medium">{t('Name')}</th>
                                    <th className="px-6 py-4 font-medium">{t('Email address')}</th>
                                    <th className="px-6 py-4 font-medium">{t('Role')}</th>
                                    <th className="px-6 py-4 font-medium">{t('Date')}</th>
                                    <th className="px-6 py-4 font-medium text-right">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {users.map((user) => (
                                    <tr key={user.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/25">
                                        <td className="px-6 py-4">{user.name}</td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4">
                                            {user.roles.includes('Admin') ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                                                    <ShieldCheck className="h-3 w-3" /> {t('Admin')}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/50 dark:text-green-300">
                                                    {t('Client')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">{user.created_at}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEditModal(user)}>
                                                    <Edit2 className="h-4 w-4 text-blue-500" />
                                                </Button>
                                                {!user.roles.includes('Admin') && (
                                                    <Button variant="ghost" size="icon" onClick={() => confirmDelete(user.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            {t('Users not found')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Modal */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent aria-describedby={undefined}>
                        <DialogHeader>
                            <DialogTitle>{t('New User')}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitAdd} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">{t('Name')}</label>
                                <Input value={data.name} onChange={e => setData('name', e.target.value)} required />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium">{t('Email address')}</label>
                                <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required />
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium">{t('Password')}</label>
                                <Input type="password" value={data.password} onChange={e => setData('password', e.target.value)} required />
                                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium">{t('Confirm password')}</label>
                                <Input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} required />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>{t('Cancel')}</Button>
                                <Button type="submit" disabled={processing}>{t('Save')}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Modal */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent aria-describedby={undefined}>
                        <DialogHeader>
                            <DialogTitle>{t('Edit')}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitEdit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">{t('Name')}</label>
                                <Input value={data.name} onChange={e => setData('name', e.target.value)} required />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium">{t('Email address')}</label>
                                <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required />
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium">{t('New Password (Optional)')}</label>
                                <Input type="password" value={data.password} onChange={e => setData('password', e.target.value)} />
                                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium">{t('Confirm password')}</label>
                                <Input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>{t('Cancel')}</Button>
                                <Button type="submit" disabled={processing}>{t('Update')}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirm Modal */}
                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogContent aria-describedby={undefined}>
                        <DialogHeader>
                            <DialogTitle>{t('Delete User')}</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-gray-500">
                            {t('Delete User Warning')}
                        </p>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>{t('Cancel')}</Button>
                            <Button type="button" variant="destructive" onClick={handleDelete} disabled={processing}>{t('Yes, delete')}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    );
}
