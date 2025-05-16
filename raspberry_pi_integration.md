# Raspberry Pi Integration Guide

This guide provides instructions on how to integrate a Raspberry Pi with the waste detection backend system.

## Requirements

- Raspberry Pi with camera module
- Python 3.6+
- Internet connectivity to send data to the backend server

## Setup

1. Install required Python packages:

```bash
pip install requests Pillow
```

2. Use the following example script to capture an image and send waste detection data to the server:

```python
import requests
import json
import time
import io
from PIL import Image
from picamera import PiCamera

# Configure these variables
API_ENDPOINT = "http://your-server-address:8000/api/waste-records/"
# Mapping of waste types to their IDs in the backend
WASTE_TYPES = {
    "plastic": 1,
    "paper": 2,
    "metal": 3,
    "glass": 4
}

def capture_image():
    """Capture image from Pi Camera"""
    camera = PiCamera()
    # Allow camera to warm up
    time.sleep(2)

    # Create in-memory stream
    stream = io.BytesIO()
    camera.capture(stream, format='jpeg')
    stream.seek(0)

    # Close camera
    camera.close()

    return stream

def detect_waste(image_stream):
    """
    Placeholder for waste detection logic
    In a real application, this would call your ML model
    """
    # This is where your waste detection model would run
    # For this example, we'll just return dummy values
    detected_type = "plastic"  # Example result
    confidence = 85.7  # Example confidence score

    return {
        "type": detected_type,
        "type_id": WASTE_TYPES.get(detected_type, 1),  # Default to plastic if type not found
        "confidence": confidence
    }

def send_to_server(detection_result, image_stream):
    """Send detection result and image to backend server"""
    files = {
        'image': ('image.jpg', image_stream, 'image/jpeg')
    }

    data = {
        'type_id': detection_result['type_id'],
        'confidence': detection_result['confidence']
    }

    try:
        response = requests.post(API_ENDPOINT, data=data, files=files)

        if response.status_code == 201:
            print("Successfully sent waste record to server")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"Error: Server returned status code {response.status_code}")
            print(f"Response: {response.text}")
            return False

    except Exception as e:
        print(f"Error sending data to server: {e}")
        return False

def main():
    """Main function to run the waste detection process"""
    print("Starting waste detection...")

    # Capture image
    image_stream = capture_image()

    # Detect waste type
    detection_result = detect_waste(image_stream)
    print(f"Detected: {detection_result['type']} with {detection_result['confidence']}% confidence")

    # Reset stream position for reading
    image_stream.seek(0)

    # Send to server
    send_to_server(detection_result, image_stream)

if __name__ == "__main__":
    main()
```

## Custom Implementation

For a production system, you'll need to:

1. Replace the `detect_waste` function with your actual machine learning model that can classify waste types
2. Set up a schedule to run the script when the waste detection process should occur (e.g., when motion is detected)
3. Add error handling and retry logic for network failures
4. Secure your connection with API tokens or authentication

## Authentication (Optional)

If your backend requires authentication, modify the script to include an authentication token:

```python
def send_to_server(detection_result, image_stream):
    """Send detection result and image to backend server with authentication"""
    headers = {
        'Authorization': 'Token your-auth-token-here'
    }

    files = {
        'image': ('image.jpg', image_stream, 'image/jpeg')
    }

    data = {
        'type_id': detection_result['type_id'],
        'confidence': detection_result['confidence']
    }

    try:
        response = requests.post(API_ENDPOINT, headers=headers, data=data, files=files)
        # ... rest of the function remains the same
    except Exception as e:
        print(f"Error sending data to server: {e}")
        return False
```

## Troubleshooting

- If you get connection errors, verify the server address and that your Raspberry Pi has internet connectivity
- Make sure the waste type IDs match the ones in your backend system
- Check that your image format is supported by the backend
