from django.db import models


class WasteType(models.Model):
    label = models.CharField(max_length=50, unique=True)
    display_name = models.CharField(max_length=100)
    color = models.CharField(max_length=9)  # For hex color codes like #RRGGBB

    def __str__(self):
        return self.display_name

    class Meta:
        ordering = ["id"]


class WasteRecord(models.Model):
    type = models.ForeignKey(
        WasteType, on_delete=models.CASCADE, related_name="records"
    )
    confidence = models.FloatField()  # Store as float for better precision
    timestamp = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to="waste_images/")

    def __str__(self):
        return (
            f"{self.type.display_name} - {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"
        )

    class Meta:
        ordering = ["-timestamp"]  # Newest first
