# api/admin.py

from django.contrib import admin
from .models import WasteType, WasteRecord


@admin.register(WasteType)
class WasteTypeAdmin(admin.ModelAdmin):
    list_display = ("id", "label", "display_name", "color")
    search_fields = ("label", "display_name")


@admin.register(WasteRecord)
class WasteRecordAdmin(admin.ModelAdmin):
    list_display = ("id", "get_type_name", "confidence", "timestamp")
    list_filter = ("type", "timestamp")
    search_fields = ("type__display_name",)
    date_hierarchy = "timestamp"

    def get_type_name(self, obj):
        return obj.type.display_name

    get_type_name.short_description = "Waste Type"
