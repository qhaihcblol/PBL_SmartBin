# api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"waste-types", views.WasteTypeViewSet)
router.register(r"waste-records", views.WasteRecordViewSet, basename="waste-record")

urlpatterns = [
    path("", include(router.urls)),
    path("waste-stats/", views.waste_stats, name="waste-stats"),
    path("waste-distribution/", views.waste_distribution, name="waste-distribution"),
    path("waste-confidence/", views.waste_confidence, name="waste-confidence"),
    path("waste-over-time/", views.waste_over_time, name="waste-over-time"),
]
