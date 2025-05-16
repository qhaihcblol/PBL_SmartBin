# Smart Waste Detection System

This project consists of a Django backend and Next.js frontend for a waste detection and classification system.

## Backend Setup

### Prerequisites

- Python 3.9+
- PostgreSQL

### Setup Instructions

1. Navigate to the backend directory:

```
cd backend
```

2. Create and activate a virtual environment (optional but recommended):

```
python -m venv venv
.\venv\Scripts\Activate
```

3. Install dependencies:

```
pip install -r requirements.txt
```

4. Configure the database:

   - Make sure PostgreSQL is running
   - Create a database named `waste_detection_db`
   - Update database settings in `config/settings.py` if needed

5. Run database migrations:

```
python manage.py makemigrations api
python manage.py migrate
```

6. Load initial waste types:

```
python manage.py load_waste_types
```

7. Create a superuser for admin access:

```
python manage.py createsuperuser
```

8. Start the development server:

```
python manage.py runserver
```

The backend will be available at http://localhost:8000/

- Admin interface: http://localhost:8000/admin/
- API endpoints: http://localhost:8000/api/

## Frontend Setup

1. Navigate to the frontend directory:

```
cd frontend
```

2. Install dependencies:

```
npm install
# or
pnpm install
```

3. Start the development server:

```
npm run dev
# or
pnpm dev
```

The frontend will be available at http://localhost:3000/

## API Endpoints

### GET Endpoints (for Frontend)

- `GET /api/waste-types/`: List all waste types
- `GET /api/waste-records/`: List all waste records (supports `?limit=` parameter)
- `GET /api/waste-stats/`: Get waste statistics
- `GET /api/waste-distribution/`: Get waste distribution for charts
- `GET /api/waste-confidence/`: Get confidence scores by waste type
- `GET /api/waste-over-time/`: Get waste data over the last 7 days
- `GET /api/recent-detections/`: Get recent detections (supports `?limit=` parameter)

### POST Endpoint (for Raspberry Pi)

- `POST /api/waste-records/`: Create a new waste record

Example POST data:

```json
{
  "type_id": 1,
  "confidence": 85.5,
  "image": [binary image data]
}
```

## Directory Structure

### Backend

- `api/`: Django app with models, views, and serializers
- `config/`: Project configuration

### Frontend

- `app/`: Next.js application routes
- `components/`: React components
- `lib/`: Utility functions and API client
