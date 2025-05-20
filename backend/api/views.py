# api/views.py

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Count, Avg, F
from django.db.models.functions import TruncDay
from django.utils import timezone
from datetime import timedelta
from .models import WasteType, WasteRecord
from .serializers import (
    WasteTypeSerializer,
    WasteRecordSerializer,
    WasteRecordCreateSerializer,
)
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
import logging

logger = logging.getLogger(__name__)


class WasteTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WasteType.objects.all()
    serializer_class = WasteTypeSerializer


class WasteRecordViewSet(viewsets.ModelViewSet):
    serializer_class = WasteRecordSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = WasteRecord.objects.all()
        limit = self.request.query_params.get("limit")
        if limit:
            try:
                limit = int(limit)
                queryset = queryset[:limit]
            except ValueError:
                pass
        return queryset

    def get_serializer_class(self):
        if self.action == "create":
            return WasteRecordCreateSerializer
        return WasteRecordSerializer

    def create(self, request, *args, **kwargs):
        logger.info(f"Received waste record creation request: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            record = serializer.save()

            # Serialize the record for the response and WebSocket
            record_serializer = WasteRecordSerializer(record)
            record_data = record_serializer.data

            # Fix image URL to include host
            if record.image:
                # Get the host from the request
                host = request.get_host()
                scheme = "https" if request.is_secure() else "http"
                record_data["image"] = f"{scheme}://{host}{record_data['image']}"

            logger.info(f"Created waste record: {record_data}")

            # Send WebSocket update
            try:
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    "waste_updates", {"type": "waste_update", "data": record_data}
                )
                logger.info("WebSocket update sent successfully")
            except Exception as e:
                logger.error(f"Error sending WebSocket update: {e}")

            return Response(record_data, status=status.HTTP_201_CREATED)

        logger.error(f"Invalid data for waste record: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def waste_stats(request):
    """Get waste statistics"""
    # Tính tổng số records
    total_items = WasteRecord.objects.count()

    # Get counts for each waste type sử dụng annotate để tối ưu truy vấn
    stats = {"totalItems": total_items}

    waste_types = WasteType.objects.annotate(count=Count('records')).all()
    for waste_type in waste_types:
        stats[f"{waste_type.label}Count"] = waste_type.count

    return Response(stats)


@api_view(["GET"])
def waste_distribution(request):
    """Get waste distribution data for charts"""
    # Sử dụng annotate để tối ưu số lượng truy vấn
    waste_types = WasteType.objects.annotate(count=Count('records')).all()
    total_items = WasteRecord.objects.count()

    distribution = []
    for waste_type in waste_types:
        count = waste_type.count
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
    """Get average confidence by waste type"""
    # Sử dụng annotate để tối ưu truy vấn, lấy confidence trung bình trong một lần
    waste_types = (
        WasteType.objects.annotate(
            avg_confidence=Avg('records__confidence')
        ).all()
    )

    confidence_data = []
    for waste_type in waste_types:
        # Xử lý giá trị None nếu không có records
        avg_confidence = waste_type.avg_confidence
        avg_confidence = round(avg_confidence) if avg_confidence else 0

        confidence_data.append(
            {
                "name": waste_type.display_name,
                "confidence": avg_confidence,
                "color": waste_type.color,
            }
        )

    return Response(confidence_data)


from django.db.models import Count, Avg, F
from django.db.models.functions import TruncDay

@api_view(["GET"])
def waste_over_time(request):
    """Get waste data over time (last 7 days)"""
    end_date = timezone.now()
    start_date = end_date - timedelta(days=6)

    waste_types = WasteType.objects.all()
    waste_type_labels = {wt.id: wt.label for wt in waste_types}
    
    # Truy vấn dữ liệu gộp theo ngày và loại waste
    # Sử dụng annotate để giảm số lượng truy vấn
    daily_records = (
        WasteRecord.objects.filter(timestamp__gte=start_date, timestamp__lte=end_date)
        .annotate(day=TruncDay('timestamp'))
        .values('day', 'type')
        .annotate(count=Count('id'))
        .order_by('day', 'type')
    )

    # Chuẩn bị cấu trúc kết quả
    date_map = {}
    for i in range(7):
        day = start_date + timedelta(days=i)
        formatted_date = day.strftime("%b %d")
        date_map[day.date()] = {"date": formatted_date, "total": 0}
        
        # Khởi tạo count cho mỗi loại waste là 0
        for waste_type in waste_types:
            date_map[day.date()][waste_type.label] = 0
    
    # Gộp dữ liệu từ truy vấn
    for record in daily_records:
        day = record['day'].date()
        waste_type_id = record['type']
        count = record['count']
        
        if day in date_map:
            waste_label = waste_type_labels.get(waste_type_id, 'unknown')
            date_map[day][waste_label] = count
            date_map[day]["total"] += count
    
    # Chuyển từ dict sang list để trả về
    result = [data for day, data in sorted(date_map.items())]
    
    return Response(result)
