from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Notification Schemas
class NotificationBase(BaseModel):
    user_id: int
    type: str
    title: str
    content: str

    @validator('type')
    def validate_notification_type(cls, v):
        allowed_types = ['email', 'sms', 'in_app']
        if v not in allowed_types:
            raise ValueError(f'type must be one of {allowed_types}')
        return v

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: int
    status: str
    created_at: datetime
    sent_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        orm_mode = True

# Notification Preference Schemas
class NotificationPreferenceBase(BaseModel):
    email_enabled: bool = True
    sms_enabled: bool = True
    in_app_enabled: bool = True

class NotificationPreferenceCreate(NotificationPreferenceBase):
    user_id: int

class NotificationPreferenceResponse(NotificationPreferenceBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Queue Item Schemas
class QueueItemBase(BaseModel):
    notification_id: int
    status: str = "pending"
    retry_count: int = 0

class QueueItemCreate(QueueItemBase):
    pass

class QueueItemResponse(QueueItemBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True