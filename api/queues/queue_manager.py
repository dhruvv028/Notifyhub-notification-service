import logging
from sqlalchemy.orm import Session
import models
from datetime import datetime, timedelta
from services.notification_service import send_notification

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Maximum number of retries for a notification
MAX_RETRIES = 3

async def add_to_queue(db: Session, notification_id: int) -> bool:
    """
    Add a notification to the queue.
    Returns True if successful, False otherwise.
    """
    try:
        # Create queue item
        queue_item = models.QueueItem(
            notification_id=notification_id,
            status="pending"
        )
        db.add(queue_item)
        db.commit()
        logger.info(f"Added notification {notification_id} to queue")
        return True
    except Exception as e:
        logger.exception(f"Failed to add notification to queue: {str(e)}")
        db.rollback()
        return False

async def process_queue_item(db: Session) -> bool:
    """
    Process a single item from the queue.
    Returns True if an item was processed, False otherwise.
    """
    try:
        # Get the oldest pending queue item
        queue_item = db.query(models.QueueItem).filter(
            models.QueueItem.status == "pending"
        ).order_by(models.QueueItem.created_at).first()
        
        if not queue_item:
            logger.info("No pending queue items")
            return False
        
        # Update status to processing
        queue_item.status = "processing"
        queue_item.updated_at = datetime.now()
        db.commit()
        
        # Process the notification
        success = await send_notification(db, queue_item.notification_id)
        
        if success:
            # Update status to completed
            queue_item.status = "completed"
            queue_item.updated_at = datetime.now()
            db.commit()
            logger.info(f"Successfully processed notification {queue_item.notification_id}")
            return True
        else:
            # Increment retry counter and handle retries
            queue_item.retry_count += 1
            
            if queue_item.retry_count >= MAX_RETRIES:
                # Max retries reached, mark as failed
                queue_item.status = "failed"
                logger.warning(f"Max retries reached for notification {queue_item.notification_id}")
            else:
                # Reset to pending for retry
                queue_item.status = "pending"
                logger.info(f"Scheduled retry {queue_item.retry_count} for notification {queue_item.notification_id}")
            
            queue_item.updated_at = datetime.now()
            db.commit()
            return False
    except Exception as e:
        logger.exception(f"Error processing queue item: {str(e)}")
        if queue_item:
            # On exception, reset to pending for retry
            queue_item.status = "pending"
            queue_item.retry_count += 1
            queue_item.updated_at = datetime.now()
            db.commit()
        return False

async def cleanup_queue(db: Session) -> int:
    """
    Clean up the queue by removing old completed and failed items.
    Returns the number of items removed.
    """
    try:
        # Remove completed items older than 7 days
        seven_days_ago = datetime.now() - timedelta(days=7)
        result = db.query(models.QueueItem).filter(
            models.QueueItem.status.in_(["completed", "failed"]),
            models.QueueItem.updated_at < seven_days_ago
        ).delete(synchronize_session=False)
        
        db.commit()
        logger.info(f"Removed {result} old queue items")
        return result
    except Exception as e:
        logger.exception(f"Error cleaning up queue: {str(e)}")
        db.rollback()
        return 0