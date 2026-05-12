import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    MessageSquare, 
    Send, 
    Users, 
    FileText, 
    Shield, 
    Zap, 
    Globe, 
    CheckCircle2, 
    ChevronRight,
    Github,
    ArrowRight
} from 'lucide-react';
import LanguageSwitcher from '@/components/language-switcher';
import { useTranslate } from '@/hooks/use-translate';

export default function Welcome() {
    const { auth, locale, appUrl } = usePage<SharedData & { locale: string; appUrl: string }>().props;
    const { t } = useTranslate();

    const seoTitle       = t('seo_title');
    const seoDescription = t('seo_description');
    const seoKeywords    = t('seo_keywords');
    const canonicalUrl   = (appUrl ?? 'https://sms.1call.uz').replace(/\/$/, '');

    // hreflang alternate URLs
    const alternateLangs = [
        { hreflang: 'uz', href: `${canonicalUrl}/?locale=uz` },
        { hreflang: 'ru', href: `${canonicalUrl}/?locale=ru` },
        { hreflang: 'en', href: `${canonicalUrl}/?locale=en` },
        { hreflang: 'x-default', href: canonicalUrl },
    ];

    const features = [
        {
            title: t('Mass Messaging'),
            description: t('Send thousands of SMS instantly with high delivery rates and reliable throughput.'),
            icon: Send,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            title: t('Contact Management'),
            description: t('Organize your audience into groups. Import contacts from Excel or CSV files easily.'),
            icon: Users,
            color: 'text-violet-500',
            bg: 'bg-violet-500/10'
        },
        {
            title: t('Smart Templates'),
            description: t('Create and reuse message templates with dynamic placeholders for personalized communication.'),
            icon: FileText,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
        },
        {
            title: t('Detailed History'),
            description: t('Track every message sent. Monitor delivery status, failures, and success in real-time.'),
            icon: MessageSquare,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        }
    ];

    const stats = [
        { label: t('Messages Sent'), value: '1M+' },
        { label: t('Active Users'), value: '5k+' },
        { label: t('Delivery Rate'), value: '99.9%' },
        { label: t('Countries'), value: '150+' }
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900 selection:bg-indigo-100 dark:bg-[#0a0a0a] dark:text-gray-100">
            <Head>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                <meta name="keywords" content={seoKeywords} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={canonicalUrl} />

                {/* hreflang for multilingual SEO */}
                {alternateLangs.map(({ hreflang, href }) => (
                    <link key={hreflang} rel="alternate" hrefLang={hreflang} href={href} />
                ))}

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:image" content={`${canonicalUrl}/images/smslogo.png`} />
                <meta property="og:locale" content={locale === 'uz' ? 'uz_UZ' : locale === 'ru' ? 'ru_RU' : 'en_US'} />
                <meta property="og:site_name" content="GsmSms" />

                {/* Twitter / X Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDescription} />
                <meta name="twitter:image" content={`${canonicalUrl}/images/smslogo.png`} />

                {/* JSON-LD Structured Data */}
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "SoftwareApplication",
                    "name": "GsmSms",
                    "url": canonicalUrl,
                    "applicationCategory": "BusinessApplication",
                    "operatingSystem": "Web",
                    "description": seoDescription,
                    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
                    "author": { "@type": "Organization", "name": "GsmSms", "url": canonicalUrl }
                })}</script>
            </Head>

            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20" />
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/20 blur-[120px] rounded-full dark:bg-indigo-900/10" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-200/20 blur-[120px] rounded-full dark:bg-violet-900/10" />
            </div>

            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 dark:bg-[#0a0a0a]/80 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-500/10">
                            <img src="/images/smslogo.png" alt="Logo" className="h-full w-full object-cover" />
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                            GsmSms
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                            >
                                {t('Dashboard')}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                                >
                                    {t('Login')}
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                                >
                                    {t('Get Started')}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="relative pt-20 pb-32 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-8 dark:bg-indigo-900/30 dark:text-indigo-300">
                            <Zap className="h-3 w-3" />
                            {t('New: GSM Modem Support Integration')}
                        </div>
                        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                            {t('Professional Bulk SMS')}
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-300% animate-gradient">
                                {t('Simplified For Everyone')}
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            {t('Connect with your customers instantly. Manage groups, templates, and track delivery with our powerful SMS gateway platform.')}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href={route('register')}
                                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all hover:scale-105 shadow-xl shadow-indigo-500/25"
                            >
                                {t('Start For Free')}
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Link>
                            <a
                                href="https://github.com/IslamAbdurahman"
                                target="_blank"
                                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <Github className="mr-2 h-5 w-5" />
                                {t('GitHub')}
                            </a>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-12 border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase mb-3 dark:text-indigo-400">
                                {t('Features')}
                            </h2>
                            <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                {t('Everything you need to manage your SMS campaigns')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {features.map((feature) => (
                                <div key={feature.title} className="group p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 dark:bg-gray-900 dark:border-gray-800">
                                    <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        <feature.icon className={`h-7 w-7 ${feature.color}`} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Trust Section */}
                <section className="py-32 bg-indigo-600 dark:bg-indigo-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-8">
                            {t('Ready to scale your communication?')}
                        </h2>
                        <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
                            {t('Join thousands of businesses worldwide that use SmsGateway to reach their customers faster.')}
                        </p>
                        <Link
                            href={route('register')}
                            className="inline-flex items-center px-10 py-5 text-xl font-bold text-indigo-600 bg-white rounded-2xl hover:bg-indigo-50 transition-all hover:scale-105 shadow-2xl shadow-black/20"
                        >
                            {t('Get Started Now')}
                            <ArrowRight className="ml-2 h-6 w-6" />
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-20 border-t border-gray-100 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded flex items-center justify-center overflow-hidden">
                                    <img src="/images/smslogo.png" alt="Logo" className="h-full w-full object-cover" />
                                </div>
                                <span className="text-lg font-bold tracking-tight">{t('GsmSms')}</span>
                            </div>
                            
                            <div className="flex gap-8 text-sm text-gray-500 dark:text-gray-400">
                                <a href="#" className="hover:text-indigo-600 transition-colors">{t('Privacy Policy')}</a>
                                <a href="#" className="hover:text-indigo-600 transition-colors">{t('Terms of Service')}</a>
                                <a href="https://github.com/IslamAbdurahman" target="_blank" className="hover:text-indigo-600 transition-colors">{t('GitHub')}</a>
                            </div>

                            <div className="text-sm text-gray-400">
                                © {new Date().getFullYear()} GsmSms. {t('All rights reserved.')}
                            </div>
                        </div>
                    </div>
                </footer>
            </main>

            <style>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient {
                    background-size: 300% 300%;
                    animation: gradient 8s ease infinite;
                }
            `}</style>
        </div>
    );
}
