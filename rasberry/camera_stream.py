from flask import Flask, Response
from picamera2 import Picamera2
import threading
import time
import io
import cv2  # dùng OpenCV để encode ảnh JPEG

app = Flask(__name__)

# Khởi tạo camera
picam2 = Picamera2()
frame_lock = threading.Lock()

# Cấu hình camera tối ưu
video_config = picam2.create_video_configuration(
    main={"size": (640, 480), "format": "RGB888"},  # RGB888 nhanh hơn XBGR8888
    controls={"FrameDurationLimits": (10000, 33333)}  # ~30 FPS
)
picam2.configure(video_config)
picam2.start()

def generate_frames():
    while True:
        with frame_lock:
            frame = picam2.capture_array("main")
        
        # Encode ảnh sang JPEG với chất lượng 70 để giảm kích thước
        ret, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 70])
        if not ret:
            continue
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        # Delay nhỏ để giảm tải CPU (~30 fps)
        time.sleep(0.03)

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

def start_stream():
    # Chạy Flask server để hiển thị livestream
    app.run(host="0.0.0.0", port=5000)
