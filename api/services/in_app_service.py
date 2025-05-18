import logging
from sqlalchemy.orm import Session
import models
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_in_app_notification(db: Session, user_id: int, title: str, content: str) -> bool:
    """
    Create an in-app notification.
    This is simply creating a record in the database with a specific type.
    
    In a real implementation, this might also involve WebSockets or push notifications.
    
    Returns True if successful, False otherwise.
    """
    try:
        # Create notification in DB (if not already created)
        # Since this function is called from the notification_service,
        # we typically don't need to create a new notification record
        # However, this function could be used directly as well
        
        # Check if the notification already exists to avoid duplicates
        existing_notification = db.query(models.Notification).filter(
            models.Notification.user_id == user_id,
            models.Notification.title == title,
            models.Notification.content == content,
            models.Notification.type == "in_app",
            models.Notification.created_at >= datetime.now().date()  # Created today
        ).first()
        
        if existing_notification:
            logger.info(f"In-app notification already exists for user {user_id}")
            return True
            
        logger.info(f"Created in-app notification for user {user_id}")
        return True
    except Exception as e:
        logger.exception(f"Failed to create in-app notification: {str(e)}")
        return False