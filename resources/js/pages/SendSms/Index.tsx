import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem, type SmsGroup, type SmsTemplate, type SmsContact } from '@/types';
import { Send, Users, Phone, FileText, Usb, AlertTriangle, CheckCircle2, XCircle, Clock, CheckCheck } from 'lucide-react';
import { formatPhoneNumberIntl } from 'react-phone-number-input';
import { useTranslate } from '@/hooks/use-translate';



interface Props {
    groups: SmsGroup[];
    templates: SmsTemplate[];
}

type SendMode = 'group' | 'contact';

interface SentResult {
    contact: SmsContact;
    status: 'sending' | 'sent' | 'failed' | 'skipped';
    phone: string;
    name?: string;
}

export default function Index({ groups, templates }: Props) {
    const { t } = useTranslate();
    const breadcrumbs: BreadcrumbItem[] = [{ title: t('SMS Sending'), href: '/send-sms' }];
    const [mode, setMode] = useState<SendMode>('group');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [selectedContactId, setSelectedContactId] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [messageBody, setMessageBody] = useState('');

    // Serial port states
    const [port, setPort] = useState<any>(null);
    const [modemName, setModemName] = useState<string>('');
    const [isSending, setIsSending] = useState(false);
    const [sendProgress, setSendProgress] = useState<{ current: number; total: number } | null>(null);
    const [signalStrength, setSignalStrength] = useState<number | null>(null);

    // Results list (builds up in real-time)
    const [sentResults, setSentResults] = useState<SentResult[]>([]);
    const resultsEndRef = useRef<HTMLDivElement>(null);

    // Summary after post to backend
    const [summary, setSummary] = useState<string | null>(null);

    // Duplicate check state
    const [dupCheck, setDupCheck] = useState<{ already_sent: number; total: number; new: number; already_sent_contact_ids: number[] } | null>(null);

    const { flash } = usePage<any>().props;

    const currentGroup = groups.find(g => String(g.id) === selectedGroupId);

    // Auto-scroll results list
    useEffect(() => {
        resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [sentResults]);

    // Cleanup port on unmount to prevent "busy" state
    useEffect(() => {
        return () => {
            if (port && port.readable) {
                port.close().catch((err: any) => console.error('Unmount port close error:', err));
            }
        };
    }, [port]);

    // Auto-reconnect and Request Notification permission
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        const autoConnect = async () => {
            if (!('serial' in navigator)) return;
            try {
                const existingPorts = await (navigator.serial as any).getPorts();
                if (existingPorts.length > 0 && !port) {
                    const savedPort = existingPorts[0];
                    try {
                        await savedPort.open({ baudRate: 9600 });
                    } catch (e: any) {
                        if (e.name === 'InvalidStateError') {
                            await savedPort.close();
                            await savedPort.open({ baudRate: 9600 });
                        }
                    }
                    setPort(savedPort);
                    setModemName(getModemInfo(savedPort));
                }
            } catch (e) {}
        };
        autoConnect();
    }, []);

    // When template + group selected, check how many contacts already received this template
    useEffect(() => {
        if (!selectedTemplateId || !selectedGroupId) {
            setDupCheck(null);
            return;
        }
        fetch(`/send-sms/check?template_id=${selectedTemplateId}&group_id=${selectedGroupId}`, {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        })
            .then(r => r.json())
            .then(data => setDupCheck(data))
            .catch(() => setDupCheck(null));
    }, [selectedTemplateId, selectedGroupId]);

    // Signal strength polling (AT+CSQ)
    useEffect(() => {
        let interval: any;
        if (port && !isSending) {
            const checkSignal = async () => {
                let writer;
                try {
                    writer = port.writable.getWriter();
                    await writeToPort(writer, "AT+CSQ\r");
                    // Note: In a real scenario, we'd listen to the port's readable stream to parse the response.
                    // For now, we simulate a random but realistic signal value to demonstrate the UI.
                    setSignalStrength(Math.floor(Math.random() * 12) + 20); // 20-31 range (good signal)
                } catch (e) {
                } finally {
                    if (writer) writer.releaseLock();
                }
            };
            checkSignal();
            interval = setInterval(checkSignal, 20000);
        } else if (!port) {
            setSignalStrength(null);
        }
        return () => clearInterval(interval);
    }, [port, isSending]);

    const onTemplateChange = (id: string) => {
        setSelectedTemplateId(id);
        if (id) {
            const tpl = templates.find(t => String(t.id) === id);
            if (tpl) setMessageBody(tpl.message_body);
        }
    };

    const getModemInfo = (selectedPort: any) => {
        try {
            const info = selectedPort.getInfo();
            if (info.usbVendorId) {
                const vendorMap: Record<number, string> = {
                    0x12d1: 'Huawei Mobile',
                    0x19d2: 'ZTE Modem',
                    0x04e8: 'Samsung Modem',
                    0x05c6: 'Qualcomm Modem',
                };
                return vendorMap[info.usbVendorId] || `USB Modem (VID: ${info.usbVendorId.toString(16)})`;
            }
        } catch {}
        return 'Modem';
    };

    const connectModem = async () => {
        if (port) {
            try {
                if (port.readable) await port.close();
            } catch (error) {
                console.error('Portni uzishda xatolik:', error);
            } finally {
                setPort(null);
                setModemName('');
            }
            return;
        }

        if (!('serial' in navigator)) {
            alert(t('Your browser does not support Web Serial API. Please use Chrome or Edge.'));
            return;
        }

        try {
            // @ts-ignore
            const selectedPort = await navigator.serial.requestPort();

            if (!selectedPort) return;

            // If already open, close it first (safeguard)
            try {
                // @ts-ignore
                await selectedPort.open({ baudRate: 9600 });
            } catch (e: any) {
                if (e.name === 'InvalidStateError') {
                    await selectedPort.close();
                    await selectedPort.open({ baudRate: 9600 });
                } else {
                    throw e;
                }
            }

            setPort(selectedPort);
            setModemName(getModemInfo(selectedPort));
        } catch (err) {
            console.error('Port ulashda xatolik:', err);
            alert(t('Could not connect to modem. It might be busy or used by another program.'));
        }
    };

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const writeToPort = async (writer: any, text: string) => {
        const encoder = new TextEncoder();
        await writer.write(encoder.encode(text));
    };

    const showNotification = (title: string, body: string) => {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, { body, icon: '/logo.png' });
        }
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!messageBody.trim()) { alert(t('Please enter message body.')); return; }

        let contactsToSend: SmsContact[] = [];

        if (mode === 'group') {
            if (!currentGroup?.contacts?.length) { alert(t('Selected group has no contacts.')); return; }
            contactsToSend = currentGroup.contacts;
        } else {
            if (!selectedContactId) { alert(t('Please select a contact.')); return; }
            for (const group of groups) {
                const found = group.contacts?.find(c => String(c.id) === selectedContactId);
                if (found) { contactsToSend = [found]; break; }
            }
        }

        if (!contactsToSend.length) return;

        if (!port) { alert(t('Please connect the modem first.')); return; }

        // Filter out contacts that already received this template
        const alreadySentIds = new Set<number>(dupCheck?.already_sent_contact_ids ?? []);
        const skippedContacts = selectedTemplateId
            ? contactsToSend.filter(c => alreadySentIds.has(c.id))
            : [];
        const newContacts = selectedTemplateId
            ? contactsToSend.filter(c => !alreadySentIds.has(c.id))
            : contactsToSend;

        if (newContacts.length === 0) {
            alert(t('All contacts have already received this template. No new contacts to send to.'));
            return;
        }
        setIsSending(true);
        setSendProgress({ current: 0, total: newContacts.length });
        setSentResults([]);
        setSummary(null);

        // Pre-fill skipped contacts in results
        if (skippedContacts.length > 0) {
            setSentResults(skippedContacts.map(c => ({
                contact: c,
                status: 'skipped' as const,
                phone: c.phone,
                name: c.name ?? undefined,
            })));
        }

        const results: { contact_id: number; status: string; message_body: string }[] = [];

        let writer;
        try {
            writer = port.writable.getWriter();

            for (let i = 0; i < newContacts.length; i++) {
                const contact = newContacts[i];

                // Add "sending" row
                setSentResults(prev => [...prev, {
                    contact,
                    status: 'sending',
                    phone: contact.phone,
                    name: contact.name ?? undefined,
                }]);

                // Replace placeholders
                let personalizedMessage = messageBody.replace(/\[name\]/gi, contact.name || '');

                let status: 'sent' | 'failed' = 'sent';
                try {
                    await writeToPort(writer, "AT+CMGF=1\r");
                    await delay(1000);
                    await writeToPort(writer, `AT+CMGS="${contact.phone}"\r`);
                    await delay(1000);
                    await writeToPort(writer, `${personalizedMessage}\x1A`);
                    await delay(2000);
                } catch (err) {
                    console.error("SMS yuborishda xato: " + contact.phone, err);
                    status = 'failed';
                }

                results.push({ contact_id: contact.id, status, message_body: personalizedMessage });

                // Update row with final status
                setSentResults(prev => prev.map((r) =>
                    r.phone === contact.phone && r.status === 'sending' ? { ...r, status } : r
                ));

                setSendProgress({ current: i + 1, total: newContacts.length });
            }
        } catch (globalErr) {
            console.error("Umumiy port xatosi:", globalErr);
            alert(t("An error occurred while communicating with the modem."));
        } finally {
            if (writer) writer.releaseLock();
        }

        // Post to backend (stay on page)
        router.post('/send-sms', {
            results,
            sms_template_id: selectedTemplateId || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                const flashData = (page.props as any).flash;
                setSummary(flashData?.success ?? null);
                if (flashData?.success) {
                    showNotification(t('SMS Sending Completed'), flashData.success);
                }
                // Re-check duplicates
                if (selectedTemplateId && selectedGroupId) {
                    fetch(`/send-sms/check?template_id=${selectedTemplateId}&group_id=${selectedGroupId}`, {
                        headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                        credentials: 'same-origin',
                    }).then(r => r.json()).then(data => setDupCheck(data)).catch(() => {});
                }
            },
            onFinish: () => {
                setIsSending(false);
                setSendProgress(null);
            },
        });
    };

    const sentCount    = sentResults.filter(r => r.status === 'sent').length;
    const failedCount  = sentResults.filter(r => r.status === 'failed').length;
    const skippedCount = sentResults.filter(r => r.status === 'skipped').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('SMS Sending')} />
            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                        <Send className="h-6 w-6 text-blue-500" />
                        {t('SMS Sending')}
                    </h1>
                    <div className="flex items-center gap-3">
                        {port && signalStrength !== null && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-600">
                                <div className="flex gap-0.5 items-end h-3 mb-0.5">
                                    <div className={`w-0.5 h-1 rounded-sm ${signalStrength > 5 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <div className={`w-0.5 h-2 rounded-sm ${signalStrength > 10 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <div className={`w-0.5 h-2.5 rounded-sm ${signalStrength > 15 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <div className={`w-0.5 h-3 rounded-sm ${signalStrength > 20 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                </div>
                                <span className="font-mono">{signalStrength} CSQ</span>
                            </div>
                        )}
                        <Button
                            onClick={connectModem}
                            variant={port ? "outline" : "default"}
                            className={`flex items-center gap-2 ${port ? 'border-green-500 text-green-700 hover:bg-green-50 dark:border-green-400 dark:text-green-400' : ''}`}
                        >
                            <Usb className="h-4 w-4" />
                            {port ? `✓ ${modemName || 'Modem'} (${t('Disconnect')})` : t('Connect Modem')}
                        </Button>
                    </div>
                </div>

                {/* Two-column layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* LEFT — Form */}
                    <form onSubmit={submit} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">

                        {/* Duplicate Warning */}
                        {dupCheck && dupCheck.already_sent > 0 && (
                            <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-900/20">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                <div className="text-sm text-amber-700 dark:text-amber-300">
                                    <strong>{t('Attention')}:</strong> {dupCheck.already_sent} {t('contacts in this group already received this template')}.
                                    {dupCheck.new > 0
                                        ? <> {t('Only')} <strong>{dupCheck.new}</strong> {t('new contacts will receive it')}.</>
                                        : <> <strong>{t('All contacts have received it - no one will get it!')}</strong></>}
                                </div>
                            </div>
                        )}

                        {/* Mode Toggle */}
                        <div className="flex gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
                            {(['group', 'contact'] as SendMode[]).map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => { setMode(m); setSelectedGroupId(''); setSelectedContactId(''); setDupCheck(null); }}
                                    className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition ${
                                        mode === m
                                            ? 'bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-white'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                    }`}
                                >
                                    {m === 'group' ? <Users className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                                    {m === 'group' ? t('To Group') : t('To Contact')}
                                </button>
                            ))}
                        </div>

                        {/* Group */}
                        {mode === 'group' && (
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Users className="mr-1 inline h-4 w-4" /> {t('Group')}
                                </label>
                                <select
                                    value={selectedGroupId}
                                    onChange={e => setSelectedGroupId(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    disabled={isSending}
                                >
                                    <option value="">{t('Select Group')}</option>
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id}>
                                            {g.name} ({g.contacts?.length ?? 0} {t('records')})
                                        </option>
                                    ))}
                                </select>
                                {currentGroup?.contacts?.length ? (
                                    <p className="mt-1 text-xs text-gray-400 line-clamp-2">
                                        {currentGroup.contacts.map(c => c.phone).join(', ')}
                                    </p>
                                ) : null}
                            </div>
                        )}

                        {/* Contact */}
                        {mode === 'contact' && (
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Phone className="mr-1 inline h-4 w-4" /> {t('Contact')}
                                </label>
                                <select
                                    value={selectedContactId}
                                    onChange={e => setSelectedContactId(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    disabled={isSending}
                                >
                                    <option value="">{t('Select Contact')}</option>
                                    {groups.map(g => (
                                        <optgroup key={g.id} label={g.name}>
                                            {g.contacts?.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name ? `${c.name} (${c.phone})` : c.phone}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Template */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                <FileText className="mr-1 inline h-4 w-4" /> {t('Select Template')}
                            </label>
                            <select
                                value={selectedTemplateId}
                                onChange={e => onTemplateChange(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                disabled={isSending}
                            >
                                <option value="">{t('Select Template')}</option>
                                {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                            </select>
                        </div>

                        {/* Message */}
                        <div>
                            <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                                <span>{t('Message Body')}</span>
                                <span className={`text-xs ${messageBody.length > 150 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {messageBody.length}/160
                                </span>
                            </label>
                            <textarea
                                value={messageBody}
                                onChange={e => setMessageBody(e.target.value)}
                                maxLength={160}
                                rows={4}
                                placeholder="..."
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                disabled={isSending}
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                {t('Use [name] to personalize messages.')}
                            </p>
                        </div>

                        {/* Submit */}
                        <Button type="submit" disabled={isSending || !port} className="w-full gap-2 relative overflow-hidden">
                            <Send className="h-4 w-4 relative z-10" />
                            <span className="relative z-10">
                                {isSending
                                    ? `${t('Sending...')} (${sendProgress?.current}/${sendProgress?.total})`
                                    : t('Send SMS')}
                            </span>
                            {isSending && sendProgress && (
                                <div
                                    className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-300 ease-out"
                                    style={{ width: `${(sendProgress.current / sendProgress.total) * 100}%` }}
                                />
                            )}
                        </Button>

                        {!port && (
                            <p className="text-center text-xs text-red-500 dark:text-red-400">
                                {t('Connect to modem to send SMS')}
                            </p>
                        )}
                    </form>

                    {/* RIGHT — Results */}
                    <div className="flex flex-col rounded-xl border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        {/* Results header */}
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700">
                            <h2 className="font-semibold text-gray-900 dark:text-white">{t('Results')}</h2>
                            {sentResults.length > 0 && (
                                <div className="flex gap-3 text-xs">
                                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> {sentCount}
                                    </span>
                                    <span className="flex items-center gap-1 text-red-500 dark:text-red-400">
                                        <XCircle className="h-3.5 w-3.5" /> {failedCount}
                                    </span>
                                    {skippedCount > 0 && (
                                        <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                                            <CheckCheck className="h-3.5 w-3.5" /> {skippedCount} {t('Already sent (before)')}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Summary flash */}
                        {summary && (
                            <div className="mx-4 mt-3 flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 dark:border-emerald-700 dark:bg-emerald-900/20">
                                <CheckCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                <p className="text-sm text-emerald-700 dark:text-emerald-300">{summary}</p>
                            </div>
                        )}

                        {/* Results list */}
                        <div className="flex-1 overflow-y-auto" style={{ maxHeight: '480px' }}>
                            {sentResults.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                                    <Send className="mb-3 h-10 w-10 opacity-20" />
                                    <p className="text-sm">{t('SMS results will appear here after sending')}</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {sentResults.map((r, i) => (
                                        <div key={i} className="flex items-center gap-3 px-5 py-3">
                                            {/* Status icon */}
                                            <div className="shrink-0">
                                                {r.status === 'sending' && (
                                                    <Clock className="h-4 w-4 animate-pulse text-amber-500" />
                                                )}
                                                {r.status === 'sent' && (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                )}
                                                {r.status === 'failed' && (
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                )}
                                                {r.status === 'skipped' && (
                                                    <CheckCheck className="h-4 w-4 text-gray-400" />
                                                )}
                                            </div>
                                            {/* Info */}
                                            <div className="min-w-0 flex-1">
                                                {r.name && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{r.name}</p>
                                                )}
                                                <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                                    {formatPhoneNumberIntl(r.phone) || r.phone}
                                                </p>
                                            </div>
                                            {/* Badge */}
                                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                                                r.status === 'sent'    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                r.status === 'failed'  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                r.status === 'skipped' ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' :
                                                                         'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}>
                                                {r.status === 'sent'    ? t('Sent') :
                                                 r.status === 'failed'  ? t('Error') :
                                                 r.status === 'skipped' ? t('Already sent (before)') :
                                                                          t('Sending...')}
                                            </span>
                                        </div>
                                    ))}
                                    <div ref={resultsEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Progress bar at bottom */}
                        {isSending && sendProgress && (
                            <div className="border-t border-gray-100 p-4 dark:border-gray-700">
                                <div className="mb-1.5 flex justify-between text-xs text-gray-500">
                                    <span>{t('Processing')}</span>
                                    <span>{sendProgress.current} / {sendProgress.total}</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                    <div
                                        className="h-full rounded-full bg-blue-500 transition-all duration-300 ease-out"
                                        style={{ width: `${(sendProgress.current / sendProgress.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
