#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from api.models import WasteType, WasteRecord


def check_database():
    print("=== Database Status ===")

    # Check WasteTypes
    waste_types = WasteType.objects.all()
    print(f"WasteTypes count: {waste_types.count()}")
    for wt in waste_types:
        print(f"  - {wt.id}: {wt.label} ({wt.display_name}) - {wt.color}")

    # Check WasteRecords
    waste_records = WasteRecord.objects.all()
    print(f"\nWasteRecords count: {waste_records.count()}")

    if waste_records.count() > 0:
        print("Recent records:")
        for wr in waste_records[:5]:
            print(f"  - {wr.id}: {wr.type.label} ({wr.confidence}%) - {wr.timestamp}")


def create_sample_data():
    print("=== Creating Sample Data ===")

    # Create WasteTypes if they don't exist
    waste_types_data = [
        {"label": "plastic", "display_name": "Plastic", "color": "#3B82F6"},
        {"label": "paper", "display_name": "Paper", "color": "#EAB308"},
        {"label": "metal", "display_name": "Metal", "color": "#6B7280"},
        {"label": "glass", "display_name": "Glass", "color": "#10B981"},
    ]

    for wt_data in waste_types_data:
        waste_type, created = WasteType.objects.get_or_create(
            label=wt_data["label"],
            defaults={
                "display_name": wt_data["display_name"],
                "color": wt_data["color"],
            },
        )
        if created:
            print(f"Created WasteType: {waste_type.label}")
        else:
            print(f"WasteType already exists: {waste_type.label}")

    print("Sample data creation completed!")


if __name__ == "__main__":
    print("Django Database Check Script")
    print("=" * 50)

    check_database()

    if WasteType.objects.count() == 0:
        print("\nNo WasteTypes found. Creating sample data...")
        create_sample_data()
        print("\nAfter creating sample data:")
        check_database()
