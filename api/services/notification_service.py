from sqlalchemy.orm import Session
from datetime import datetime
import models
import logging

from services.email_service import send_email
from services.sms_service import send_sms
from services.in_app_service import create_in_app_notification

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def send_notification(db: Session, notification_id: int) -> bool:
    """
    Send a notification based on its type.
    Returns True if successful, False otherwise.
    """
    # Get the notification from the database
    notification = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    
    if not notification:
        logger.error(f"Notification {notification_id} not found")
        return False
    
    # Get the user from the database
    user = db.query(models.User).filter(models.User.id == notification.user_id).first()
    
    if not user:
        logger.error(f"User {notification.user_id} not found")
        update_notification_status(db, notification_id, "failed", "User not found")
        return False
    
    # Get user preferences
    preferences = db.query(models.NotificationPreference).filter(
        models.NotificationPreference.user_id == notification.user_id
    ).first()
    
    # If no preferences exist, create default preferences
    if not preferences:
        preferences = models.NotificationPreference(user_id=notification.user_id)
        db.add(preferences)
        db.commit()
        db.refresh(preferences)
    
    # Check if the notification type is enabled for the user
    if notification.type == "email" and not preferences.email_enabled:
        update_notification_status(db, notification_id, "skipped", "Email notifications disabled by user")
        return True
    elif notification.type == "sms" and not preferences.sms_enabled:
        update_notification_status(db, notification_id, "skipped", "SMS notifications disabled by user")
        return True
    elif notification.type == "in_app" and not preferences.in_app_enabled:
        update_notification_status(db, notification_id, "skipped", "In-app notifications disabled by user")
        return True
    
    # Send the notification based on its type
    try:
        if notification.type == "email":
            success = await send_email(user.email, notification.title, notification.content)
        elif notification.type == "sms":
            success = await send_sms(user.phone, notification.content)
        elif notification.type == "in_app":
            success = create_in_app_notification(db, user.id, notification.title, notification.content)
        else:
            logger.error(f"Unknown notification type: {notification.type}")
            update_notification_status(db, notification_id, "failed", f"Unknown notification type: {notification.type}")
            return False
        
        if success:
            update_notification_status(db, notification_id, "sent")
            return True
        else:
            update_notification_status(db, notification_id, "failed", "Failed to send notification")
            return False
    except Exception as e:
        logger.exception(f"Error sending notification: {str(e)}")
        update_notification_status(db, notification_id, "failed", str(e))
        return False

def update_notification_status(db: Session, notification_id: int, status: str, error_message: str = None) -> bool:
    """
    Update the status of a notification.
    Returns True if successful, False otherwise.
    """
    notification = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    
    if not notification:
        logger.error(f"Notification {notification_id} not found")
        return False
    
    notification.status = status
    if status == "sent":
        notification.sent_at = datetime.now()
    if error_message:
        notification.error_message = error_message
    
    try:
        db.commit()
        return True
    except Exception as e:
        logger.exception(f"Error updating notification status: {str(e)}")
        db.rollback()
        return False