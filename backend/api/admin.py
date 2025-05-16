from django.contrib import admin
from .models import WasteType, WasteRecord


@admin.register(WasteType)
class WasteTypeAdmin(admin.ModelAdmin):
    list_display = ("id", "label", "display_name", "color")
    search_fields = ("label", "display_name")


@admin.register(WasteRecord)
class WasteRecordAdmin(admin.ModelAdmin):
    list_display = ("id", "get_type_label", "confidence", "timestamp")
    list_filter = ("type", "timestamp")
    search_fields = ("type__label", "type__display_name")
    readonly_fields = ("image_preview",)

    def get_type_label(self, obj):
        return obj.type.display_name

    get_type_label.short_description = "Waste Type"

    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" width="300" />')
        return "No Image"

    image_preview.short_description = "Image Preview"


# Needed for the image preview in admin
from django.utils.safestring import mark_safe
