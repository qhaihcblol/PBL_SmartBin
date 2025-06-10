import threading
import camera_stream  # import module vừa tạo

# Khởi động camera live stream ở thread khác
stream_thread = threading.Thread(target=camera_stream.start_stream, daemon=True)
stream_thread.start()


import serial
import time
import camera
import model_inference
import send_to_server

# Kết nối serial với Arduino
ser = serial.Serial('/dev/ttyUSB0', 9600)
time.sleep(2)
ser.reset_input_buffer()  # Xóa bộ đệm đầu vào

# Gửi tín hiệu BEGIN cho Arduino (chỉ 1 lần)
ser.write(b"BEGIN\n")
print("[INFO] Đã gửi 'BEGIN' cho Arduino.")

class_names = ['glass', 'metal', 'paper', 'plastic']

while True:
    if ser.in_waiting:
        line = ser.readline().decode().strip()
        if line == "DETECT":
            print("Rác được phát hiện. Đang chụp ảnh...")
            try:
                time.sleep(2)
                camera.capture_image()
                predict, confidence = model_inference.predict_image("rubbish.jpg")
                confidentce = round(confidence * 100, 2)  # Làm tròn đến 2 chữ số thập phân
                print("Loại rác:", class_names[predict])
                ser.write((class_names[predict] + '\n').encode())  # Gửi lại kết quả cho Arduino
                detection_result = {
                    'type_id': predict+1,
                    'confidence': confidence
                }
                success = send_to_server.send_to_server(detection_result, "rubbish.jpg")
                if not success:
                    print("[WARNING] Gửi dữ liệu lên server thất bại, nhưng hệ thống vẫn tiếp tục hoạt động.")
            except Exception as e:
                print("Lỗi:", e)

