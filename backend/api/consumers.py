# api/consumers.py

import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)


class WasteConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("waste_updates", self.channel_name)
        await self.accept()
        logger.info(f"WebSocket connected: {self.channel_name}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("waste_updates", self.channel_name)
        logger.info(f"WebSocket disconnected: {self.channel_name}, code: {close_code}")

    async def waste_update(self, event):
        """
        Send waste update to WebSocket
        """
        data = event["data"]

        try:
            # Send message to WebSocket
            await self.send(text_data=json.dumps({"type": "update", "data": data}))
            logger.info(f"Sent update to {self.channel_name}")
        except Exception as e:
            logger.error(f"Error sending WebSocket update: {e}")
