from django.core.management.base import BaseCommand
from api.models import WasteType


class Command(BaseCommand):
    help = "Load initial waste types into the database"

    def handle(self, *args, **kwargs):
        waste_types = [
            {"label": "plastic", "display_name": "Plastic", "color": "#3B82F6"},
            {"label": "paper", "display_name": "Paper", "color": "#EAB308"},
            {"label": "metal", "display_name": "Metal", "color": "#6B7280"},
            {"label": "glass", "display_name": "Glass", "color": "#10B981"},
        ]

        for waste_type in waste_types:
            WasteType.objects.get_or_create(
                label=waste_type["label"],
                defaults={
                    "display_name": waste_type["display_name"],
                    "color": waste_type["color"],
                },
            )

        self.stdout.write(self.style.SUCCESS("Successfully loaded initial waste types"))
