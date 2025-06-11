from django.core.management.base import BaseCommand
from api.models import WasteType, WasteRecord
from django.utils import timezone
import random
from datetime import timedelta
from django.core.files.base import ContentFile
import os
import io
from PIL import Image, ImageDraw, ImageFont


class Command(BaseCommand):
    help = "Generate sample waste records for testing"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count", type=int, default=50, help="Number of records to generate"
        )

    def handle(self, *args, **kwargs):
        count = kwargs["count"]
        waste_types = WasteType.objects.all()

        if not waste_types.exists():
            self.stdout.write(
                self.style.ERROR("No waste types found. Run load_waste_types first.")
            )
            return

        now = timezone.now()

        for i in range(count):
            # Select a random waste type
            waste_type = random.choice(waste_types)

            # Generate a random date within the last 7 days
            days_ago = random.randint(0, 6)
            hours_ago = random.randint(0, 23)
            minutes_ago = random.randint(0, 59)

            timestamp = now - timedelta(
                days=days_ago, hours=hours_ago, minutes=minutes_ago
            )

            # Generate a placeholder image
            img = self.generate_placeholder_image(waste_type.label, waste_type.color)

            # Create an in-memory file-like object
            img_io = io.BytesIO()
            img.save(img_io, format="PNG")
            img_io.seek(0)

            # Create the waste record
            record = WasteRecord(
                type=waste_type,
                confidence=random.uniform(
                    70.0, 99.9
                ),  # Random confidence between 70% and 99.9%
            )

            # Save the image to the model's ImageField
            record.image.save(
                f"{waste_type.label}_{timestamp.strftime('%Y%m%d_%H%M%S')}.png",
                ContentFile(img_io.read()),
            )

            record.save()

        self.stdout.write(
            self.style.SUCCESS(f"Successfully generated {count} sample waste records")
        )

    def generate_placeholder_image(self, text, color):
        """Generate a simple colored image with text"""
        width, height = 300, 300
        background_color = color

        # Convert hex color to RGB tuple
        if background_color.startswith("#"):
            bg_r = int(background_color[1:3], 16)
            bg_g = int(background_color[3:5], 16)
            bg_b = int(background_color[5:7], 16)
            background_color = (bg_r, bg_g, bg_b)
        else:
            background_color = (200, 200, 200)  # Default gray

        # Create a new image
        image = Image.new("RGB", (width, height), background_color)
        draw = ImageDraw.Draw(image)

        # Determine text color (black or white depending on background brightness)
        brightness = sum(background_color) / 3
        text_color = (0, 0, 0) if brightness > 128 else (255, 255, 255)

        # Add text
        try:
            # Try to use a system font, but this might fail in some environments
            # font = ImageFont.truetype("arial.ttf", 36)
            # draw.text((width/4, height/2), text, font=font, fill=text_color)
            draw.text((width / 4, height / 2), text, fill=text_color)
        except:
            # Fallback to default font
            draw.text((width / 4, height / 2), text, fill=text_color)

        return image
