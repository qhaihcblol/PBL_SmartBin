import requests

API_ENDPOINT = "http://172.20.10.2:8000/api/waste-records/"

def send_to_server(detection_result, image_path):
    try:
        with open(image_path, 'rb') as img_file:
            files = {
                'image': ('image.jpg', img_file, 'image/jpeg')
            }

            data = {
                'type_id': detection_result['type_id'],
                'confidence': detection_result['confidence']
            }

            response = requests.post(
                API_ENDPOINT,
                data=data,
                files=files,
                timeout=5  # Thêm timeout
            )

            if response.status_code == 201:
                print("Gửi dữ liệu và ảnh thành công")
                print(f"Phản hồi từ server: {response.json()}")
                return True
            else:
                print(f"Lỗi: Mã trạng thái {response.status_code}")
                print(f"Nội dung phản hồi: {response.text}")
                return False
    except requests.exceptions.Timeout:
        print("⏱️ Lỗi: Gửi dữ liệu bị timeout.")
        return False
    except requests.exceptions.RequestException as e:
        print(f"🌐 Lỗi khi gửi dữ liệu: {e}")
        return False
    except Exception as e:
        print(f"🔥 Lỗi không xác định: {e}")
        return False
