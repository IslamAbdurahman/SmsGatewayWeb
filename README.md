# SMS Gateway Web

Professional SMS management and broadcasting system built with **Laravel 13** and **React (Inertia.js)**. This application allows users to manage contacts, groups, templates, and send SMS messages through connected hardware modems.

## 🚀 Key Features

- **Multi-language Support:** Fully localized in Uzbek, Russian, and English.
- **SMS Management:** Send messages to individual contacts or entire groups.
- **Contact & Group Management:** Organise your audience into groups for targeted messaging.
- **Templates:** Create and reuse SMS templates to save time.
- **Real-time Statistics:** Dashboard with live charts and recent activity history.
- **Advanced Settings:** Profile management, security settings, and theme customization (Light/Dark mode).
- **Role-Based Access:** Managed access for Admins and Clients.

## 🛠 Tech Stack

- **Backend:** Laravel 13 (PHP 8.3+)
- **Frontend:** React with Inertia.js
- **Styling:** Tailwind CSS & Shadcn UI
- **Database:** SQLite (default) / MySQL
- **Tooling:** Vite, Composer, NPM

## 📦 Setup Instructions

Follow these steps to set up the project locally:

### 1. Prerequisites
- **PHP 8.3** or higher
- **Composer**
- **Node.js & NPM**
- **SQLite** extension enabled in your `php.ini`

### 2. Clone the Repository
```bash
git clone git@github.com:IslamAbdurahman/SmsGatewayWeb.git
cd SmsGatewayWeb
```

### 3. Install Dependencies
```bash
composer install
npm install
```

### 4. Environment Configuration
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Generate an application key:
```bash
php artisan key:generate
```

### 5. Database Setup
Create the database file (for SQLite):
```bash
touch database/database.sqlite
```
Run migrations and seeders:
```bash
php artisan migrate --seed
```

Fix permissions for storage and cache:
```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 777 storage bootstrap/cache
```

### 6. Run the Application
Start the development server and Vite:
```bash
# In separate terminal windows or using concurrently
php artisan serve
npm run dev
```

### 7. Queue Worker (Supervisor)
For production environments, use Supervisor to keep the queue worker running.

1. Create a configuration file:
```bash
sudo nano /etc/supervisor/conf.d/gsmsms-worker.conf
```

2. Paste the following configuration (**IMPORTANT:** Replace `/var/www/gsmsms` with your actual project path, e.g., `/var/www/sms_1call_uz_usr/data/www/sms.1call.uz`):
```ini
[program:gsmsms-worker]
process_name=%(program_name)s_%(process_num)02d
command=php artisan queue:work --sleep=3 --tries=3 --max-time=3600
directory=/var/www/gsmsms_uz_usr/data/www/gsmsms.uz
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=root
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/gsmsms_uz_usr/data/www/gsmsms.uz/storage/logs/worker.log
stopwaitsecs=3600
```

3. Update and start Supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start gsmsms-worker:*
```

## 🚀 Production Deployment & Domain Change

If you are moving the project to a new domain or server, follow these steps:

1.  **Update `.env`**: Update the `APP_URL` to your new domain.
2.  **Fix Permissions**: Always ensure the storage and cache directories are writable by the web server:
    ```bash
    sudo chown -R www-data:www-data storage bootstrap/cache
    sudo chmod -R 777 storage bootstrap/cache
    ```
3.  **Supervisor**: Update the paths in `/etc/supervisor/conf.d/gsmsms-worker.conf` if the project directory has changed.
4.  **Google Auth**: If using Google Login, add your new domain to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) under "Authorized redirect URIs":
    `https://your-new-domain.com/auth/google/callback`
5.  **Caches**: Clear all caches after moving:
    ```bash
    php artisan optimize:clear
    php artisan queue:restart
    ```

## 👨‍💻 Developer

Built with ❤️ by **Islam Abdurahman**.

- **GitHub:** [@IslamAbdurahman](https://github.com/IslamAbdurahman)

## 📄 License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
