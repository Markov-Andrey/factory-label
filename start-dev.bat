@echo off
start "Frontend" cmd /k "npm run dev"
start "Backend" cmd /k "cd api && php artisan serve"