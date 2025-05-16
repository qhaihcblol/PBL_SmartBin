# API Documentation

This document describes the API endpoints available in the waste detection backend system.

## Base URL

All API endpoints are prefixed with `/api/`. For local development, the full base URL is:

```
http://localhost:8000/api/
```

## Authentication

API endpoints are configured with `IsAuthenticatedOrReadOnly` permission. This means:

- GET requests are allowed without authentication
- POST, PUT, PATCH, DELETE requests require authentication

For Raspberry Pi integration, you may need to:

1. Create a user account through the Django admin interface
2. Generate an authentication token
3. Include the token in your requests

## Endpoints

### Waste Types

#### GET /api/waste-types/

Returns a list of all waste types in the system.

**Response Example:**

```json
{
  "count": 4,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "label": "plastic",
      "display_name": "Plastic",
      "color": "#3B82F6"
    },
    {
      "id": 2,
      "label": "paper",
      "display_name": "Paper",
      "color": "#EAB308"
    },
    {
      "id": 3,
      "label": "metal",
      "display_name": "Metal",
      "color": "#6B7280"
    },
    {
      "id": 4,
      "label": "glass",
      "display_name": "Glass",
      "color": "#10B981"
    }
  ]
}
```

#### GET /api/waste-types/{id}/

Returns a specific waste type by ID.

### Waste Records

#### GET /api/waste-records/

Returns a list of waste records. Supports pagination and filtering.

**Query Parameters:**

- `limit`: Number of records to return (e.g., `?limit=5`)

**Response Example:**

```json
{
  "count": 50,
  "next": "http://localhost:8000/api/waste-records/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "type_id": 1,
      "type": "plastic",
      "confidence": 85.7,
      "timestamp": "2023-05-14T15:30:45Z",
      "image": "http://localhost:8000/media/waste_images/plastic_20230514_153045.png"
    },
    ...
  ]
}
```

#### POST /api/waste-records/

Creates a new waste record. Used by the Raspberry Pi to send detection results.

**Request:**

- Content-Type: `multipart/form-data`

**Form Data:**

- `type_id`: ID of the waste type (integer)
- `confidence`: Confidence score (float)
- `image`: Image file

**Response Example:**

```json
{
  "id": 51,
  "type_id": 1,
  "type": "plastic",
  "confidence": 85.7,
  "timestamp": "2023-05-14T15:30:45Z",
  "image": "http://localhost:8000/media/waste_images/plastic_20230514_153045.png"
}
```

### Statistics and Charts

#### GET /api/waste-stats/

Returns statistics about waste collection.

**Response Example:**

```json
{
  "totalItems": 50,
  "plasticCount": 15,
  "paperCount": 12,
  "metalCount": 10,
  "glassCount": 13
}
```

#### GET /api/waste-distribution/

Returns distribution of waste types for charts.

**Response Example:**

```json
[
  {
    "name": "Plastic",
    "value": 15,
    "color": "#3B82F6",
    "percentage": 30
  },
  {
    "name": "Paper",
    "value": 12,
    "color": "#EAB308",
    "percentage": 24
  },
  {
    "name": "Metal",
    "value": 10,
    "color": "#6B7280",
    "percentage": 20
  },
  {
    "name": "Glass",
    "value": 13,
    "color": "#10B981",
    "percentage": 26
  }
]
```

#### GET /api/waste-confidence/

Returns average confidence scores for each waste type.

**Response Example:**

```json
[
  {
    "name": "Plastic",
    "confidence": 87,
    "color": "#3B82F6"
  },
  {
    "name": "Paper",
    "confidence": 82,
    "color": "#EAB308"
  },
  {
    "name": "Metal",
    "confidence": 90,
    "color": "#6B7280"
  },
  {
    "name": "Glass",
    "confidence": 85,
    "color": "#10B981"
  }
]
```

#### GET /api/waste-over-time/

Returns waste records grouped by day for the last 7 days.

**Response Example:**

```json
[
  {
    "date": "May 8",
    "plastic": 2,
    "paper": 1,
    "metal": 2,
    "glass": 3,
    "total": 8
  },
  {
    "date": "May 9",
    "plastic": 3,
    "paper": 2,
    "metal": 1,
    "glass": 0,
    "total": 6
  },
  ...
  {
    "date": "May 14",
    "plastic": 1,
    "paper": 2,
    "metal": 0,
    "glass": 3,
    "total": 6
  }
]
```

#### GET /api/recent-detections/

Returns the most recent waste detections.

**Query Parameters:**

- `limit`: Number of records to return (default: 5)

**Response Example:**

```json
[
  {
    "id": 50,
    "type_id": 1,
    "type": "plastic",
    "confidence": 88.5,
    "timestamp": "2023-05-14T15:30:45Z",
    "image": "http://localhost:8000/media/waste_images/plastic_20230514_153045.png"
  },
  ...
]
```
