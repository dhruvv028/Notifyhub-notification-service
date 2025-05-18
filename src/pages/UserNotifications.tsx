import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, Mail, MessageSquare, BellRing, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { getUserNotifications, getUsers } from '../api/apiClient';
import { Notification, NotificationType } from '../types';

const UserNotifications = () => {
  const { userId } = useParams<{ userId: string }>();
  const numericUserId = parseInt(userId || '0', 10);

  const { data: notifications, isLoading, error, refetch } = useQuery(
    ['userNotifications', numericUserId],
    () => getUserNotifications(numericUserId),
    {
      enabled: !!numericUserId && numericUserId > 0,
    }
  );

  const { data: users } = useQuery('users', getUsers);
  const user = users?.find(u => u.id === numericUserId);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'sms':
        return <MessageSquare className="h-5 w-5" />;
      case 'in_app':
        return <BellRing className="h-5 w-5" />;
      default:
        return <BellRing className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'queued':
        return <Clock className="h-5 w-5 text-amber-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading notifications. Please try again or check if the API is running.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-600 underline"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">{user ? `${user.name}'s Notifications` : 'User Notifications'}</h1>
        <p className="mt-2 text-gray-600">
          Viewing all notifications for {user ? user.email : `user ${userId}`}
        </p>
      </div>

      {notifications?.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <BellRing className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
          <p className="text-gray-500">This user hasn't received any notifications yet.</p>
          <Link
            to="/send"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Send a Notification
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flow-root">
            <ul className="divide-y divide-gray-200">
              {notifications?.map((notification: Notification) => (
                <li key={notification.id} className="p-4 sm:px-6 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 mr-4 p-2 rounded-full ${
                      notification.type === 'email' 
                        ? 'bg-blue-100 text-blue-500' 
                        : notification.type === 'sms' 
                          ? 'bg-purple-100 text-purple-500'
                          : 'bg-indigo-100 text-indigo-500'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          {getStatusIcon(notification.status)}
                          <span className="ml-1.5 capitalize">{notification.status}</span>
                        </div>
                      </div>
                      <div className="mt-1 sm:flex sm:justify-between">
                        <p className="text-sm text-gray-500 truncate">
                          {notification.content}
                        </p>
                        <p className="mt-1 text-xs text-gray-400 sm:mt-0">
                          {format(new Date(notification.created_at), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                      {notification.error_message && (
                        <div className="mt-1 text-xs text-red-500">
                          Error: {notification.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserNotifications;