import torch
from torchvision import models, transforms
from PIL import Image
from config.config import DEVICE, DATA_DIR, BATCH_SIZE, N_EPOCHS, IMG_SIZE, NUM_CLASSES

class_names = ['glass', 'metal', 'paper', 'plastic']

# Tạo lại kiến trúc giống lúc training
model = models.mobilenet_v3_large(weights=None)  

# Sửa số lớp output đúng với số lớp của bài toán của bạn
model.classifier[3] = torch.nn.Linear(model.classifier[3].in_features, NUM_CLASSES)  

# Load trọng số đã fine-tune
model.load_state_dict(torch.load("D:/DaiHoc/Nam_3/HK2/Code/MobileNet-v3/outputs/checkpoints/best_model.pth", map_location='cpu'))
model.eval()

transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406], 
        std=[0.229, 0.224, 0.225]
        )
    ])

def classify_image(image_path):
    image = Image.open(image_path).convert("RGB")
    input_tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        output = model(input_tensor)
        predicted_class = torch.argmax(output, dim=1).item()

    return class_names[predicted_class]

result = classify_image(r"D:\DaiHoc\Nam_3\HK2\Code\MobileNet-v3\test\glass.jpg")
print(f"Predicted class: {result}")