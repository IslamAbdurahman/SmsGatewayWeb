import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslate } from '@/hooks/use-translate';

interface PaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
    from?: number;
    to?: number;
}

interface Props {
    links: PaginationLinks;
    meta: PaginationMeta;
}

export function Pagination({ links, meta }: Props) {
    const { t } = useTranslate();

    if (!meta || meta.last_page <= 1) return null;

    const pages = Array.from({ length: meta.last_page }, (_, i) => i + 1);

    // Build page URL by replacing page param in first link or constructing
    const buildPageUrl = (page: number): string => {
        const base = links.first ?? links.next ?? links.prev ?? '';
        try {
            const url = new URL(base);
            url.searchParams.set('page', String(page));
            return url.pathname + url.search;
        } catch {
            return `?page=${page}`;
        }
    };

    // Show at most ~7 page buttons around current page
    const getVisiblePages = () => {
        const total = meta.last_page;
        const current = meta.current_page;
        if (total <= 7) return pages;
        const start = Math.max(1, current - 2);
        const end = Math.min(total, current + 2);
        const visible: (number | '...')[] = [];
        if (start > 1) { visible.push(1); if (start > 2) visible.push('...'); }
        for (let i = start; i <= end; i++) visible.push(i);
        if (end < total) { if (end < total - 1) visible.push('...'); visible.push(total); }
        return visible;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-3">
            {/* Record info */}
            {meta.from !== undefined && meta.to !== undefined && (
                <p className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                    {t('Showing')} <span className="font-medium">{meta.from}</span> {t('to')}{' '}
                    <span className="font-medium">{meta.to}</span> {t('of')}{' '}
                    <span className="font-medium">{meta.total}</span> {t('results')}
                </p>
            )}

            {/* Page buttons */}
            <nav className="flex items-center gap-1 order-1 sm:order-2" aria-label="Pagination">
                {/* Prev */}
                {links.prev ? (
                    <Link
                        href={links.prev}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                ) : (
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 bg-white text-gray-300 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600">
                        <ChevronLeft className="h-4 w-4" />
                    </span>
                )}

                {/* Page numbers */}
                {getVisiblePages().map((page, i) =>
                    page === '...' ? (
                        <span key={`ellipsis-${i}`} className="inline-flex items-center justify-center h-8 w-8 text-sm text-gray-400">
                            …
                        </span>
                    ) : (
                        <Link
                            key={page}
                            href={buildPageUrl(page)}
                            className={`inline-flex items-center justify-center h-8 w-8 rounded-md text-sm font-medium transition-colors ${
                                page === meta.current_page
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                        >
                            {page}
                        </Link>
                    )
                )}

                {/* Next */}
                {links.next ? (
                    <Link
                        href={links.next}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                ) : (
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 bg-white text-gray-300 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600">
                        <ChevronRight className="h-4 w-4" />
                    </span>
                )}
            </nav>
        </div>
    );
}
