from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uvicorn

from database import get_db, engine
import models
import schemas
from services.notification_service import send_notification
from services.email_service import send_email
from services.sms_service import send_sms
from services.in_app_service import create_in_app_notification
from queues.queue_manager import add_to_queue, process_queue_item

# Create the tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Notification Service API",
    description="A robust notification service capable of sending Email, SMS, and in-app notifications",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Notification Service API"}

@app.post("/notifications", response_model=schemas.NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(
    notification: schemas.NotificationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Send a notification to a user.
    The notification will be processed asynchronously.
    """
    # Create notification in DB
    db_notification = models.Notification(
        user_id=notification.user_id,
        type=notification.type,
        title=notification.title,
        content=notification.content,
        status="queued"
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    
    # Add to queue for async processing
    background_tasks.add_task(
        add_to_queue,
        db=db,
        notification_id=db_notification.id
    )
    
    return schemas.NotificationResponse(
        id=db_notification.id,
        user_id=db_notification.user_id,
        type=db_notification.type,
        title=db_notification.title,
        content=db_notification.content,
        status=db_notification.status,
        created_at=db_notification.created_at
    )

@app.get("/notifications/{notification_id}", response_model=schemas.NotificationResponse)
def get_notification(notification_id: int, db: Session = Depends(get_db)):
    """
    Get a notification by ID.
    """
    notification = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@app.get("/users/{user_id}/notifications", response_model=List[schemas.NotificationResponse])
def get_user_notifications(user_id: int, db: Session = Depends(get_db)):
    """
    Get all notifications for a specific user.
    """
    notifications = db.query(models.Notification).filter(models.Notification.user_id == user_id).all()
    return notifications

@app.post("/process-queue", status_code=status.HTTP_202_ACCEPTED)
def process_queue(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Process the notification queue.
    This endpoint is for demonstration purposes.
    In production, this would be handled by a worker process.
    """
    background_tasks.add_task(process_queue_item, db=db)
    return {"message": "Queue processing started"}

@app.get("/users", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    """
    Get all users.
    This is for demo purposes.
    """
    users = db.query(models.User).all()
    if not users:
        # Create some demo users if none exist
        demo_users = [
            models.User(name="Alice Smith", email="alice@example.com", phone="+1234567890"),
            models.User(name="Bob Johnson", email="bob@example.com", phone="+0987654321"),
            models.User(name="Charlie Brown", email="charlie@example.com", phone="+1122334455")
        ]
        db.add_all(demo_users)
        db.commit()
        users = demo_users
    
    return users

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)