import 'react-phone-number-input/style.css';
import PhoneInputLib from 'react-phone-number-input';
import { useState, useEffect } from 'react';

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
}

export function PhoneInput({ value, onChange, placeholder, required }: PhoneInputProps) {
    // Attempt to guess the default country based on timezone
    const [defaultCountry, setDefaultCountry] = useState<any>('UZ');

    useEffect(() => {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (timezone.includes('Tashkent')) setDefaultCountry('UZ');
            else if (timezone.includes('Moscow')) setDefaultCountry('RU');
            else if (timezone.includes('Almaty')) setDefaultCountry('KZ');
            // ... more logic could be added or just use a lib
        } catch (e) {
            // Fallback to UZ
        }
    }, []);

    return (
        <div className="phone-input-container">
            <PhoneInputLib
                international
                defaultCountry={defaultCountry}
                value={value}
                onChange={(val) => onChange(val || '')}
                placeholder={placeholder || 'Telefon raqamini kiriting'}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-gray-700 dark:text-white"
            />
            <style>{`
                .phone-input-container .PhoneInputInput {
                    background: transparent;
                    border: none;
                    outline: none;
                    width: 100%;
                    padding-left: 10px;
                    color: inherit;
                }
                .phone-input-container .PhoneInputCountrySelect {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: black;
                }
                .dark .phone-input-container .PhoneInputCountrySelect {
                    color: white;
                    background: #374151;
                }
                .phone-input-container .PhoneInput {
                    display: flex;
                    align-items: center;
                }
            `}</style>
        </div>
    );
}
