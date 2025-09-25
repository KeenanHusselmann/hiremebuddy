import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Bell, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface NotificationQueueItem {
  id: string;
  notification_id: string;
  user_id: string;
  title: string;
  body: string;
  data: any;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
  processed_at?: string;
}

const NotificationQueueTest: React.FC = () => {
  const { profile } = useAuth();
  const [title, setTitle] = useState('Test Notification');
  const [message, setMessage] = useState('This is a test notification from HireMeBuddy');
  const [isCreating, setIsCreating] = useState(false);
  const [queueItems, setQueueItems] = useState<NotificationQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch queue items
  const fetchQueueItems = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('notification_queue')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching queue items:', error);
      } else {
        setQueueItems(data || []);
      }
    } catch (error) {
      console.error('Error fetching queue items:', error);
    }
  };

  // Create a test notification
  const createTestNotification = async () => {
    if (!profile?.id) {
      toast.error('Please log in to test notifications');
      return;
    }

    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in both title and message');
      return;
    }

    setIsCreating(true);
    try {
      // Create a notification in the database
      // This should trigger the queue_push_notification function
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: profile.id,
          type: 'test',
          message: message.trim(),
          category: 'test',
          target_url: '/notifications'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        toast.error(`Failed to create notification: ${error.message}`);
      } else {
        console.log('Notification created successfully:', data);
        toast.success('Test notification created and queued for push delivery!');
        
        // Clear form
        setTitle('Test Notification');
        setMessage('This is a test notification from HireMeBuddy');
        
        // Refresh queue items
        setTimeout(fetchQueueItems, 1000);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Failed to create notification');
    } finally {
      setIsCreating(false);
    }
  };

  // Process pending notifications manually
  const processQueue = async () => {
    setIsProcessing(true);
    try {
      // Call the Supabase function to send push notifications for queued items
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: profile?.id
        }
      });

      if (error) {
        console.error('Error processing queue:', error);
        toast.error(`Failed to process queue: ${error.message}`);
      } else {
        console.log('Queue processing result:', data);
        toast.success(`Queue processed! Sent ${data?.sent || 0} notifications.`);
        
        // Refresh queue items
        fetchQueueItems();
      }
    } catch (error) {
      console.error('Error processing queue:', error);
      toast.error('Failed to process notification queue');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchQueueItems();
  }, [profile?.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!profile) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notification Queue Test
          </CardTitle>
          <CardDescription>
            Please log in to test the notification queue system
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notification Queue Test
          </CardTitle>
          <CardDescription>
            Create test notifications and see them get queued for push delivery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Notification Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Notification Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={createTestNotification}
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? (
                <>Creating...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create Test Notification
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Notification Queue</CardTitle>
            <Button
              onClick={processQueue}
              disabled={isProcessing}
              variant="outline"
              size="sm"
            >
              {isProcessing ? 'Processing...' : 'Process Queue'}
            </Button>
          </div>
          <CardDescription>
            Recent notifications queued for push delivery
          </CardDescription>
        </CardHeader>
        <CardContent>
          {queueItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No notifications in queue. Create a test notification to see it here.
            </p>
          ) : (
            <div className="space-y-3">
              {queueItems.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.body}</p>
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(item.created_at).toLocaleString()}
                    {item.processed_at && (
                      <span className="ml-4">
                        Processed: {new Date(item.processed_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationQueueTest;