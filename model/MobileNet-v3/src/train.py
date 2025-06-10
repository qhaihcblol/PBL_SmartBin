import torch
import os
from torch.utils.data import DataLoader, Subset
from torchvision.datasets import ImageFolder
from torch.utils.tensorboard import SummaryWriter
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from tqdm import tqdm
from datetime import datetime

from config.config import DEVICE, DATA_DIR, BATCH_SIZE, N_EPOCHS, IMG_SIZE, NUM_CLASSES
from src.mobileNetv3 import get_model
from utils.transforms import get_train_transform, get_val_transform
from utils.visualization import show_augmented_images
from src.evaluate import validate


def train_step(model, train_loader, criterion, optimizer, device, epoch, tensorboard):
    # Train
    model.train()
    running_loss = 0.0
    running_acc = 0.0
    y_train_true, y_train_pred = [], []

    progress_bar = tqdm(train_loader, colour="green", ncols=100)

    for iter, (images, labels) in enumerate(progress_bar):

        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)

        loss.backward()
        optimizer.step()

        running_loss += loss.item()
        _, predicted = torch.max(outputs, 1)
        
        batch_acc = (predicted == labels).sum().item() / len(labels) 
        running_acc += batch_acc
        # Cập nhật progress bar
        progress_bar.set_description("Epoch {}/{} | Iteration {}/{} ".format(
            epoch + 1, N_EPOCHS, iter+1, len(train_loader)))
        progress_bar.set_postfix(loss=running_loss/(iter+1), acc=running_acc/(iter+1))
        
        
        y_train_true.extend(labels.cpu().numpy())
        y_train_pred.extend(predicted.cpu().numpy())


    train_accuracy = accuracy_score(y_train_true, y_train_pred) 
    train_loss = running_loss / len(train_loader)   

    tensorboard.add_scalar("Loss/train", train_loss, epoch)
    tensorboard.add_scalar("Accuracy/train", train_accuracy, epoch)
    return train_loss, train_accuracy


def save_model(val_acc, model, best_val_acc):
    if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(
                model.state_dict(), 
                "outputs/checkpoints/best_model.pth"
            )

        # Lưu mô hình mỗi epoch (hoặc cuối cùng)
    torch.save(model.state_dict(), "outputs/checkpoints/last_model.pth")
    return best_val_acc

# Huấn luyện mô hình
def train_model(n_epochs, model, train_loader, val_loader, criterion, optimizer, DEVICE, tensorboard):
    best_val_acc = 0.0
    for epoch in range(n_epochs):
        # Train
        train_loss, train_acc = train_step(model, train_loader, criterion, optimizer, DEVICE, epoch, tensorboard)
        # Validation
        val_loss, val_acc = validate(model, val_loader, criterion, DEVICE, tensorboard, epoch)
        print(f"[Train] Loss: {train_loss:.4f} | Accuracy: {train_acc:.4f}")
        print(f"[Validation] Loss: {val_loss:.4f} | Accuracy: {val_acc:.4f}")
        # Lưu mô hình tốt nhất (dựa trên độ chính xác trên tập validation)
        best_val_acc = save_model(val_acc, model, best_val_acc)

if __name__ == "__main__":

    # Tạo 2 transform riêng
    train_transform = get_train_transform(IMG_SIZE)
    val_transform = get_val_transform(IMG_SIZE)

    # Tạo dataset 2 lần (1 lần cho train, 1 lần cho val)
    full_dataset_train = ImageFolder(root=DATA_DIR, transform=train_transform)
    full_dataset_val = ImageFolder(root=DATA_DIR, transform=val_transform)

    # Chia chỉ số ảnh
    indices = list(range(len(full_dataset_train)))
    labels = full_dataset_train.targets

    train_idx, val_idx = train_test_split(
        indices, test_size=0.3, stratify=labels, random_state=42)

    # Tạo Subset với transform tương ứng
    train_dataset = Subset(full_dataset_train, train_idx)
    val_dataset = Subset(full_dataset_val, val_idx)

    # Tạo DataLoader
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)


    model, criterion, optimizer = get_model(NUM_CLASSES, DEVICE)
    logdir = f"runs/train_{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    tensorboard = SummaryWriter(log_dir=logdir)
    os.makedirs("outputs/checkpoints", exist_ok=True)


    train_model(N_EPOCHS, model, train_loader, val_loader, criterion, optimizer, DEVICE, tensorboard)