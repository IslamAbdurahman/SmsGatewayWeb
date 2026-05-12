import * as React from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Command } from 'cmdk';
import { useTranslate } from '@/hooks/use-translate';

interface Option {
    value: string;
    label: string;
}

interface Props {
    options: Option[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    allLabel?: string;
    className?: string;
    triggerClassName?: string;
}

export function SearchableSelect({
    options,
    value,
    onValueChange,
    placeholder,
    allLabel,
    className = '',
    triggerClassName = '',
}: Props) {
    const { t } = useTranslate();
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');

    const all = allLabel ?? t('All');
    const selectedLabel = value ? options.find(o => o.value === value)?.label : null;

    const filtered = options.filter(o =>
        o.label.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
            <PopoverPrimitive.Trigger asChild>
                <button
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    className={`flex h-9 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${triggerClassName}`}
                >
                    <span className="truncate text-left">
                        {selectedLabel ?? <span className="text-gray-400">{placeholder ?? all}</span>}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverPrimitive.Trigger>

            <PopoverPrimitive.Portal>
                <PopoverPrimitive.Content
                    className={`z-50 w-[var(--radix-popover-trigger-width)] min-w-[200px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 ${className}`}
                    align="start"
                    sideOffset={4}
                >
                    {/* Search input */}
                    <div className="flex items-center border-b border-gray-200 px-3 dark:border-gray-700">
                        <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
                        <input
                            className="flex h-9 w-full bg-transparent py-2 text-sm outline-none placeholder:text-gray-400 dark:text-white"
                            placeholder={t('Search placeholder') || 'Search...'}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Options list */}
                    <div className="max-h-60 overflow-y-auto p-1">
                        {/* "All" option */}
                        <button
                            type="button"
                            onClick={() => { onValueChange(''); setSearch(''); setOpen(false); }}
                            className={`flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white ${!value ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}`}
                        >
                            <Check className={`h-4 w-4 shrink-0 ${!value ? 'opacity-100 text-blue-600' : 'opacity-0'}`} />
                            {all}
                        </button>

                        {filtered.length === 0 ? (
                            <p className="py-6 text-center text-sm text-gray-400">{t('No results found')}</p>
                        ) : (
                            filtered.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => { onValueChange(option.value); setSearch(''); setOpen(false); }}
                                    className={`flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white ${value === option.value ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}`}
                                >
                                    <Check className={`h-4 w-4 shrink-0 ${value === option.value ? 'opacity-100 text-blue-600' : 'opacity-0'}`} />
                                    {option.label}
                                </button>
                            ))
                        )}
                    </div>
                </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
    );
}
