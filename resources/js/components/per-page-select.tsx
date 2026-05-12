import { router } from '@inertiajs/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslate } from '@/hooks/use-translate';

interface Props {
    value: string | number;
    url: string;
}

export function PerPageSelect({ value, url }: Props) {
    const { t } = useTranslate();

    const handleValueChange = (newValue: string) => {
        router.get(url, { per_page: newValue }, { preserveState: true });
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{t('Per page')}:</span>
            <Select value={String(value || '20')} onValueChange={handleValueChange}>
                <SelectTrigger className="h-8 w-[80px] dark:bg-gray-700 dark:text-white">
                    <SelectValue placeholder="20" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="all">{t('All')}</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
