from rest_framework import serializers
from .models import WasteType, WasteRecord


class WasteTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteType
        fields = ["id", "label", "display_name", "color"]


class WasteRecordSerializer(serializers.ModelSerializer):
    type_id = serializers.IntegerField(source="type.id")
    type = serializers.CharField(source="type.label")
    image = serializers.SerializerMethodField()

    class Meta:
        model = WasteRecord
        fields = ["id", "type_id", "type", "confidence", "timestamp", "image"]
        read_only_fields = ["id", "timestamp"]

    def get_image(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class WasteRecordCreateSerializer(serializers.ModelSerializer):
    type_id = serializers.IntegerField()

    class Meta:
        model = WasteRecord
        fields = ["type_id", "confidence", "image"]

    def create(self, validated_data):
        type_id = validated_data.pop("type_id")
        waste_type = WasteType.objects.get(id=type_id)
        waste_record = WasteRecord.objects.create(type=waste_type, **validated_data)
        return waste_record
