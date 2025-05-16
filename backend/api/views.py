from django.shortcuts import render
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import WasteType, WasteRecord
from .serializers import (
    WasteTypeSerializer,
    WasteRecordSerializer,
    WasteRecordCreateSerializer,
)


class WasteTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WasteType.objects.all()
    serializer_class = WasteTypeSerializer


class WasteRecordViewSet(viewsets.ModelViewSet):
    queryset = WasteRecord.objects.all()

    def get_serializer_class(self):
        if self.action == "create":
            return WasteRecordCreateSerializer
        return WasteRecordSerializer

    def get_queryset(self):
        queryset = WasteRecord.objects.all()

        # Support for limit parameter
        limit = self.request.query_params.get("limit")
        if limit:
            try:
                limit = int(limit)
                queryset = queryset[:limit]
            except ValueError:
                pass

        return queryset


@api_view(["GET"])
def waste_stats(request):
    """
    Get statistics about waste collection:
    - Total items
    - Count for each waste type
    """
    total_items = WasteRecord.objects.count()

    # Get counts for each waste type
    waste_types = WasteType.objects.all()
    stats = {"totalItems": total_items}

    for waste_type in waste_types:
        type_count = WasteRecord.objects.filter(type=waste_type).count()
        stats[f"{waste_type.label}Count"] = type_count

    return Response(stats)


@api_view(["GET"])
def waste_distribution(request):
    """
    Get distribution of waste types for charts
    """
    total_items = WasteRecord.objects.count()
    waste_types = WasteType.objects.all()

    distribution = []
    for waste_type in waste_types:
        count = WasteRecord.objects.filter(type=waste_type).count()
        percentage = round((count / total_items) * 100) if total_items > 0 else 0

        distribution.append(
            {
                "name": waste_type.display_name,
                "value": count,
                "color": waste_type.color,
                "percentage": percentage,
            }
        )

    return Response(distribution)


@api_view(["GET"])
def waste_confidence(request):
    """
    Get average confidence scores for each waste type
    """
    waste_types = WasteType.objects.all()

    confidence_data = []
    for waste_type in waste_types:
        records = WasteRecord.objects.filter(type=waste_type)
        avg_confidence = records.aggregate(avg=Avg("confidence"))["avg"] or 0

        confidence_data.append(
            {
                "name": waste_type.display_name,
                "confidence": round(avg_confidence),
                "color": waste_type.color,
            }
        )

    return Response(confidence_data)


@api_view(["GET"])
def waste_over_time(request):
    """
    Get waste records grouped by day for the last 7 days
    """
    waste_types = WasteType.objects.all()
    result = []

    # Generate data for the last 7 days
    today = timezone.now().date()

    for i in range(6, -1, -1):
        date = today - timedelta(days=i)
        next_date = date + timedelta(days=1)

        # Get records for this day
        day_records = WasteRecord.objects.filter(timestamp__date=date)

        # Create data point with dynamic waste type counts
        data_point = {"date": date.strftime("%b %d"), "total": 0}  # Format: "May 14"

        for waste_type in waste_types:
            type_count = day_records.filter(type=waste_type).count()
            data_point[waste_type.label] = type_count
            data_point["total"] += type_count

        result.append(data_point)

    return Response(result)


@api_view(["GET"])
def recent_detections(request):
    """
    Get the most recent waste detections
    """
    limit = request.query_params.get("limit", 5)
    try:
        limit = int(limit)
    except ValueError:
        limit = 5

    recent_records = WasteRecord.objects.all()[:limit]
    serializer = WasteRecordSerializer(recent_records, many=True)

    return Response(serializer.data)
