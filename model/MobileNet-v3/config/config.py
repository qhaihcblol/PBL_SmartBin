import torch

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
DATA_DIR = "data/dataset-resized"  
BATCH_SIZE = 32
N_EPOCHS = 20
IMG_SIZE = 224  # MobileNetV3 dùng ảnh 224x224
NUM_CLASSES = 4