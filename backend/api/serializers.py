# api/serializers.py

from rest_framework import serializers
from .models import WasteType, WasteRecord


class WasteTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteType
        fields = ["id", "label", "display_name", "color"]


class WasteRecordSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source="type.label", read_only=True)
    type_id = serializers.IntegerField(source="type.id", read_only=True)

    class Meta:
        model = WasteRecord
        fields = ["id", "type_id", "type", "confidence", "timestamp", "image"]
        read_only_fields = ["id", "timestamp"]

    def create(self, validated_data):
        return WasteRecord.objects.create(**validated_data)


class WasteRecordCreateSerializer(serializers.Serializer):
    type_label = serializers.CharField()
    confidence = serializers.FloatField()
    image = serializers.ImageField(required=False)

    def create(self, validated_data):
        type_label = validated_data.pop("type_label")
        try:
            waste_type = WasteType.objects.get(label=type_label)
        except WasteType.DoesNotExist:
            raise serializers.ValidationError(
                f"Waste type with label '{type_label}' does not exist"
            )

        return WasteRecord.objects.create(type=waste_type, **validated_data)
