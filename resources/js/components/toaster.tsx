import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Toaster() {
    const { flash } = usePage<any>().props;
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setMessage(flash.success || flash.error);
            setType(flash.success ? 'success' : 'error');
            setVisible(true);

            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-100 flex w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className={cn(
                "flex w-full items-start gap-4 rounded-lg border p-4 shadow-lg backdrop-blur-md",
                type === 'success' 
                    ? "bg-green-50/90 border-green-200 dark:bg-green-900/80 dark:border-green-800" 
                    : "bg-red-50/90 border-red-200 dark:bg-red-900/80 dark:border-red-800"
            )}>
                <div className="shrink-0">
                    {type === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                </div>
                <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {message}
                </div>
                <button
                    onClick={() => setVisible(false)}
                    className="shrink-0 rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/5"
                >
                    <X className="h-4 w-4 text-gray-500" />
                </button>
            </div>
        </div>
    );
}
