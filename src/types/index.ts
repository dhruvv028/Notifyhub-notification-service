export type NotificationType = 'email' | 'sms' | 'in_app';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  content: string;
  status: 'queued' | 'sent' | 'failed' | 'skipped';
  created_at: string;
  sent_at?: string;
  error_message?: string;
}

export interface NotificationPreference {
  id: number;
  user_id: number;
  email_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  created_at: string;
  updated_at?: string;
}

export interface QueueItem {
  id: number;
  notification_id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retry_count: number;
  created_at: string;
  updated_at?: string;
}