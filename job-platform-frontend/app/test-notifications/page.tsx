'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useNotifications } from '@/lib/notifications/NotificationContext';
import { Bell, Plus, Trash2 } from 'lucide-react';

export default function TestNotificationsPage() {
  const { addNotification, notifications, clearAllNotifications } = useNotifications();
  const [testCount, setTestCount] = useState(0);

  const addTestNotification = () => {
    setTestCount(prev => prev + 1);
    addNotification({
      type: 'reference',
      title: 'New Reference Received',
      message: `Test notification #${testCount + 1} - Someone has submitted a reference for you.`,
      data: { test: true }
    });
  };

  const addApplicationNotification = () => {
    setTestCount(prev => prev + 1);
    addNotification({
      type: 'application',
      title: 'Application Update',
      message: `Test notification #${testCount + 1} - Your application status has been updated.`,
      data: { test: true }
    });
  };

  const addInterviewNotification = () => {
    setTestCount(prev => prev + 1);
    addNotification({
      type: 'interview',
      title: 'Interview Scheduled',
      message: `Test notification #${testCount + 1} - Interview has been scheduled for tomorrow.`,
      data: { test: true }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Bell Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Notification Bell Display */}
            <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Notification Bell:</span>
                <NotificationBell />
              </div>
            </div>

            {/* Test Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Controls</h3>
              <div className="flex flex-wrap gap-4">
                <Button onClick={addTestNotification} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Reference Notification
                </Button>
                <Button onClick={addApplicationNotification} variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Application Notification
                </Button>
                <Button onClick={addInterviewNotification} variant="secondary" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Interview Notification
                </Button>
                <Button onClick={clearAllNotifications} variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </Button>
              </div>
            </div>

            {/* Current Notifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Current Notifications ({notifications.length})</h3>
              {notifications.length === 0 ? (
                <p className="text-muted-foreground">No notifications yet. Click the buttons above to test!</p>
              ) : (
                <div className="space-y-2">
                  {notifications.slice(0, 5).map((notification, index) => (
                    <div key={notification.id} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{notification.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {notification.read ? 'Read' : 'Unread'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                  ))}
                  {notifications.length > 5 && (
                    <p className="text-sm text-muted-foreground">
                      ... and {notifications.length - 5} more notifications
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">How to Test:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Click any "Add" button to create a test notification</li>
                <li>• Watch the notification bell ring and animate</li>
                <li>• Click the bell to see the notification dropdown</li>
                <li>• The bell will ring each time a new notification is added</li>
                <li>• Try adding multiple notifications quickly to see the effect</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
