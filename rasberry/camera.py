from camera_stream import picam2, frame_lock
import time

def capture_image(output_path="rubbish.jpg"):
    with frame_lock:
        picam2.capture_file(output_path)
