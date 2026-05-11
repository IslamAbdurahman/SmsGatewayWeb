import { usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
    const { locale } = usePage<any>().props;

    const languages = [
        { code: 'uz', name: "O'zbekcha" },
        { code: 'ru', name: 'Русский' },
        { code: 'en', name: 'English' },
    ];

    const currentLanguage = languages.find(l => l.code === locale) || languages[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline">{currentLanguage.name}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem key={lang.code} asChild>
                        <Link
                            href={route('lang.switch', { locale: lang.code })}
                            className="w-full cursor-pointer"
                        >
                            {lang.name}
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
