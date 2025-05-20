@echo off
REM run_daphne.bat

REM Collect static files
python manage.py collectstatic --noinput

REM Run Daphne
daphne -b 0.0.0.0 -p 8000 config.asgi:application