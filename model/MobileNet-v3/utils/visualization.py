import matplotlib.pyplot as plt
import torchvision
import torch

def show_augmented_images(dataset, num_images=8, title=None):
    
    loader = torch.utils.data.DataLoader(dataset, batch_size=num_images, shuffle=True)
    images, labels = next(iter(loader))

    # Hủy normalize để hiển thị đúng màu
    def unnormalize(img):
        mean = torch.tensor([0.485, 0.456, 0.406]).view(3,1,1)
        std = torch.tensor([0.229, 0.224, 0.225]).view(3,1,1)
        return img * std + mean

    images = [unnormalize(img) for img in images]

    # Vẽ ảnh
    grid_img = torchvision.utils.make_grid(images, nrow=4)
    plt.figure(figsize=(12,6))
    plt.imshow(grid_img.permute(1, 2, 0).numpy())
    plt.axis("off")
    if title:
        plt.title(title)
    plt.show()
