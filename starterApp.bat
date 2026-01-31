@echo off
echo Starting Backend and Frontend...

REM Start Backend (Django)
start cmd /k "cd backend && python manage.py runserver"

REM Start Frontend (npm)
start cmd /k "cd frontend && npm run dev"

echo All services started.
