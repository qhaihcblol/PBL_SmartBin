import tensorflow as tf
import numpy as np
from tensorflow.keras.applications.mobilenet_v3 import preprocess_input
from tensorflow.keras.preprocessing import image
import matplotlib.pyplot as plt

# Load mô hình đã huấn luyện
model = tf.keras.models.load_model("outputs/checkpoints/best_model_98.keras")

# Kích thước ảnh và nhãn
IMG_SIZE = (224, 224)
categories = ['glass', 'metal', 'paper', 'plastic']

def predict_image(img_path):
    # Load và resize ảnh
    img = image.load_img(img_path, target_size=IMG_SIZE)
    img_array = image.img_to_array(img)

    # Cast và chuẩn hóa theo MobileNetV3
    img_array = tf.cast(img_array, tf.float32)
    img_array = preprocess_input(img_array)

    # Thêm batch dimension
    img_batch = tf.expand_dims(img_array, axis=0)

    # Dự đoán
    preds = model.predict(img_batch)
    pred_class = np.argmax(preds[0])
    confidence = np.max(preds[0])

    return pred_class, confidence
