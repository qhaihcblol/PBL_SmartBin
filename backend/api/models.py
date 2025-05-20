from django.db import models
import os
import uuid


def waste_image_path(instance, filename):
    """Generate a unique path for waste images"""
    ext = filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join("waste_images", filename)


class WasteType(models.Model):
    label = models.CharField(max_length=50, unique=True)
    display_name = models.CharField(max_length=100)
    color = models.CharField(max_length=20)

    def __str__(self):
        return self.display_name

    class Meta:
        ordering = ["id"]


class WasteRecord(models.Model):
    type = models.ForeignKey(
        WasteType, on_delete=models.CASCADE, related_name="records"
    )
    confidence = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to=waste_image_path, null=True, blank=True)

    def __str__(self):
        return f"{self.type.display_name} - {self.timestamp}"

    class Meta:
        ordering = ["-timestamp"]
