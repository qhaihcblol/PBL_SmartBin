@echo off
echo Running Django backend setup...

cd backend

echo Creating migrations...
python manage.py makemigrations api

echo Applying migrations...
python manage.py migrate

echo Loading initial waste types...
python manage.py load_waste_types

echo Generating sample data...
python manage.py generate_sample_data --count 50

echo Setup complete!
echo.
echo You can now:
echo  1. Create a superuser with: python manage.py createsuperuser
echo  2. Start the server with: python manage.py runserver
echo.
echo Admin interface will be available at: http://localhost:8000/admin/
echo API endpoints will be available at: http://localhost:8000/api/
