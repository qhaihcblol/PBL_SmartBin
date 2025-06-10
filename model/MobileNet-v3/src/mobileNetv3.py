import torch
from torchvision import models

def get_model(num_classes, device):
    model = models.mobilenet_v3_large(weights=models.MobileNet_V3_Large_Weights.DEFAULT)

    for param in model.features.parameters():
        param.requires_grad = False
    
    model.classifier[3] = torch.nn.Linear(model.classifier[3].in_features, num_classes)
    for name, param in model.named_parameters():
        if 'classifier.0' in name or 'classifier.3' in name:
            param.requires_grad = True
        else:
            param.requires_grad = False

    model = model.to(device)
    criterion = torch.nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.classifier.parameters(), lr=0.001)

    return model, criterion, optimizer

model = models.mobilenet_v3_large(weights=models.MobileNet_V3_Large_Weights.DEFAULT)
print(model)