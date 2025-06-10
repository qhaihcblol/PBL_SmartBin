import torch
from sklearn.metrics import accuracy_score

def validate(model, val_loader, criterion, device, writer=None, epoch=0):
    model.eval()
    val_loss = 0.0
    y_true, y_pred = [], []

    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)
            val_loss += loss.item()

            _, predicted = torch.max(outputs, 1)
            y_true.extend(labels.cpu().numpy())
            y_pred.extend(predicted.cpu().numpy())

    acc = accuracy_score(y_true, y_pred)
    loss_avg = val_loss / len(val_loader)

    if writer:
        writer.add_scalar("Loss/val", loss_avg, epoch)
        writer.add_scalar("Accuracy/val", acc, epoch)

    return loss_avg, acc
