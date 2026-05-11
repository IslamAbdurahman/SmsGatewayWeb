import { usePage } from '@inertiajs/react';

export function useTranslate() {
    const { translations } = usePage<any>().props;

    const t = (key: string, replacements: Record<string, string | number> = {}) => {
        let translation = translations[key] || key;

        Object.keys(replacements).forEach((replace) => {
            translation = translation.replace(`:${replace}`, String(replacements[replace]));
        });

        return translation;
    };

    return { t };
}
