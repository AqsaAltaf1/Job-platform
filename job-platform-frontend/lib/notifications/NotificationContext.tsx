'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'reference' | 'application' | 'interview' | 'profile_view' | 'reference_completed' | 'work_history_verified' | 'work_history_declined';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: any; // Additional data for specific notification types
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => void;
  clearAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        console.log('🔔 No JWT token found');
        return;
      }

      console.log('🔔 Fetching notifications...');
      console.log('🔔 API URL:', getApiUrl('/notifications'));
      console.log('🔔 Token exists:', !!token);
      console.log('🔔 Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      const response = await fetch(getApiUrl('/notifications'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔔 Notifications response:', data);
        console.log('🔔 Number of notifications:', data.notifications?.length || 0);
        if (data.notifications && data.notifications.length > 0) {
          console.log('🔔 First notification:', data.notifications[0]);
        }
        setNotifications(data.notifications || []);
      } else {
        const errorText = await response.text();
        console.error('🔔 Failed to fetch notifications:', response.status, response.statusText, errorText);
        console.error('🔔 Response headers:', response.headers);
      }
    } catch (error) {
      console.error('🔔 Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      console.log('🔔 Marking notification as read:', notificationId);
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        console.log('🔔 No token found for markAsRead');
        return;
      }

      const response = await fetch(getApiUrl(`/notifications/${notificationId}/read`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('🔔 Successfully marked notification as read');
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
      } else {
        console.error('🔔 Failed to mark notification as read:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('🔔 Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) return;

      const response = await fetch(getApiUrl('/notifications/mark-all-read'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) return;

      const response = await fetch(getApiUrl(`/notifications/${notificationId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notification => notification.id !== notificationId)
        );
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast notification
    switch (notification.type) {
      case 'success':
        toast.success(notification.title, { description: notification.message });
        break;
      case 'error':
        toast.error(notification.title, { description: notification.message });
        break;
      case 'warning':
        toast.warning(notification.title, { description: notification.message });
        break;
      case 'reference':
        toast.info(notification.title, { description: notification.message });
        break;
      case 'application':
        toast.info(notification.title, { description: notification.message });
        break;
      case 'interview':
        toast.info(notification.title, { description: notification.message });
        break;
      case 'reference_completed':
        toast.success(notification.title, { description: notification.message });
        break;
      case 'work_history_verified':
        toast.success(notification.title, { description: notification.message });
        break;
      case 'work_history_declined':
        toast.warning(notification.title, { description: notification.message });
        break;
      default:
        toast(notification.title, { description: notification.message });
    }
  };

  const clearAllNotifications = async () => {
    try {
      console.log('🔔 Clearing all notifications...');
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        console.log('🔔 No token found for clearAllNotifications');
        return;
      }

      const response = await fetch(getApiUrl('/notifications/clear-all'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('🔔 Successfully cleared all notifications');
        setNotifications([]);
      } else {
        console.error('🔔 Failed to clear notifications:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('🔔 Error clearing all notifications:', error);
    }
  };

  // Fetch notifications on mount
  useEffect(() => {
    console.log('🔔 NotificationProvider mounted, fetching notifications...');
    fetchNotifications();
    
    // Test API connectivity
    setTimeout(async () => {
      try {
        console.log('🔔 Testing API connectivity...');
        const testResponse = await fetch(getApiUrl('/notifications'), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('🔔 Test API response status:', testResponse.status);
        const testData = await testResponse.text();
        console.log('🔔 Test API response:', testData);
      } catch (error) {
        console.error('🔔 Test API error:', error);
      }
    }, 1000);
  }, []);

  // Set up polling for new notifications (every 20 seconds for live updates)
  useEffect(() => {
    console.log('🔔 Setting up notification polling...');
    const interval = setInterval(() => {
      console.log('🔔 Polling for notifications...');
      fetchNotifications();
    }, 20000); // Increased to 20 seconds

    return () => {
      console.log('🔔 Clearing notification polling...');
      clearInterval(interval);
    };
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
