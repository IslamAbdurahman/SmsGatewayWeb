import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslate } from '@/hooks/use-translate';

interface Props {
    links: { url: string | null; label: string; active: boolean }[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
}

export function Pagination({ links, meta }: Props) {
    const { t } = useTranslate();

    if (meta.last_page <= 1) return null;

    return (
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                {links[0].url ? (
                    <Link
                        href={links[0].url}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        {t('Previous')}
                    </Link>
                ) : (
                    <span className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-600">
                        {t('Previous')}
                    </span>
                )}
                {links[links.length - 1].url ? (
                    <Link
                        href={links[links.length - 1].url}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        {t('Next')}
                    </Link>
                ) : (
                    <span className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-600">
                        {t('Next')}
                    </span>
                )}
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                        {t('Showing')} <span className="font-medium">{meta.from}</span> {t('to')}{' '}
                        <span className="font-medium">{meta.to}</span> {t('of')}{' '}
                        <span className="font-medium">{meta.total}</span> {t('results')}
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        {links.map((link, i) => {
                            const isFirst = i === 0;
                            const isLast = i === links.length - 1;
                            const label = link.label
                                .replace('&laquo; ', '')
                                .replace(' &raquo;', '')
                                .replace('Previous', '')
                                .replace('Next', '');

                            if (!link.url) {
                                return (
                                    <span
                                        key={i}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-300 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 dark:ring-gray-600 dark:text-gray-600 ${
                                            isFirst ? 'rounded-l-md' : ''
                                        } ${isLast ? 'rounded-r-md' : ''}`}
                                    >
                                        {isFirst && <ChevronLeft className="h-4 w-4" />}
                                        {isLast && <ChevronRight className="h-4 w-4" />}
                                        {!isFirst && !isLast && label}
                                    </span>
                                );
                            }

                            return (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                        link.active
                                            ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700'
                                    } ${isFirst ? 'rounded-l-md' : ''} ${isLast ? 'rounded-r-md' : ''}`}
                                >
                                    {isFirst && <ChevronLeft className="h-4 w-4" />}
                                    {isLast && <ChevronRight className="h-4 w-4" />}
                                    {!isFirst && !isLast && label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
}
