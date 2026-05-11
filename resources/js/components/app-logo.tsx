import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md overflow-hidden">
                <img src="/images/smslogo.png" alt="GsmSms Logo" className="object-cover w-full h-full" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-bold text-lg">GsmSms</span>
            </div>
        </>
    );
}
