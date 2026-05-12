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

### 6. Run the Application
Start the development server and Vite:
```bash
# In separate terminal windows or using concurrently
php artisan serve
npm run dev
```

### 7. Queue Worker (Supervisor)
For production environments, use Supervisor to keep the queue worker running:

```ini
[program:gsmsms-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/your/project/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/path/to/your/project/storage/logs/worker.log
stopwaitsecs=3600
```

## 👨‍💻 Developer

Built with ❤️ by **Islam Abdurahman**.

- **GitHub:** [@IslamAbdurahman](https://github.com/IslamAbdurahman)

## 📄 License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
