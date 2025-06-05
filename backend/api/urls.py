from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"waste-types", views.WasteTypeViewSet)
router.register(r"waste-records", views.WasteRecordViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/waste-stats/", views.waste_stats, name="waste-stats"),
    path(
        "api/waste-distribution/", views.waste_distribution, name="waste-distribution"
    ),
    path("api/waste-confidence/", views.waste_confidence, name="waste-confidence"),
    path("api/waste-over-time/", views.waste_over_time, name="waste-over-time"),
    path("api/recent-detections/", views.recent_detections, name="recent-detections"),
    
]
