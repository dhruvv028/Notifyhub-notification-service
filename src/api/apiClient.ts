import axios from 'axios';
import { NotificationType, Notification, User } from '../types';

// Create axios instance with base URL that works with Vite's proxy
const api = axios.create({
  baseURL: '/api', // Changed to use relative path for proxy
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const sendNotification = async (
  userId: number,
  type: NotificationType,
  title: string,
  content: string
): Promise<Notification> => {
  const response = await api.post('/notifications', {
    user_id: userId,
    type,
    title,
    content,
  });
  return response.data;
};

export const getUserNotifications = async (userId: number): Promise<Notification[]> => {
  const response = await api.get(`/users/${userId}/notifications`);
  return response.data;
};

export const getNotification = async (notificationId: number): Promise<Notification> => {
  const response = await api.get(`/notifications/${notificationId}`);
  return response.data;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data;
};

export const processQueue = async (): Promise<void> => {
  await api.post('/process-queue');
};

export default api;