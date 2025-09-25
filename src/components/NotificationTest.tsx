import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAnonymousPreferences } from '@/hooks/useAnonymousPreferences';

export const NotificationTest = () => {
  const [title, setTitle] = useState('Test Notification');
  const [body, setBody] = useState('This is a test notification from HireMeBuddy');
  const [sendToAll, setSendToAll] = useState(true);
  const [specificDeviceId, setSpecificDeviceId] = useState('');
  const [serviceCategory, setServiceCategory] = useState('plumbing');
  const [isSending, setIsSending] = useState(false);
  const { getDeviceId } = useAnonymousPreferences();

  const sendTestNotification = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Please fill in both title and body');
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          ...(sendToAll ? { send_to_all_anonymous: true } : { device_id: specificDeviceId || getDeviceId() }),
          title: title.trim(),
          body: body.trim(),
          service_categories: [serviceCategory],
          data: {
            type: 'test',
            url: '/',
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) {
        console.error('Error sending notification:', error);
        toast.error(`Failed to send notification: ${error.message}`);
      } else {
        console.log('Notification sent successfully:', data);
        toast.success(`Notification sent successfully! Delivered to ${data.sent || 0} devices.`);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  const getCurrentDeviceId = () => {
    const deviceId = getDeviceId();
    setSpecificDeviceId(deviceId);
    toast.success(`Current device ID: ${deviceId}`);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Push Notification Test</CardTitle>
        <CardDescription>
          Test the background push notification system
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
          <Label htmlFor="body">Notification Body</Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Enter notification message"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Service Category</Label>
          <select
            id="category"
            value={serviceCategory}
            onChange={(e) => setServiceCategory(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="carpentry">Carpentry</option>
            <option value="painting">Painting</option>
            <option value="gardening">Gardening</option>
            <option value="cleaning">Cleaning</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="sendToAll"
            checked={sendToAll}
            onCheckedChange={setSendToAll}
          />
          <Label htmlFor="sendToAll">Send to all anonymous devices</Label>
        </div>

        {!sendToAll && (
          <div className="space-y-2">
            <Label htmlFor="deviceId">Specific Device ID</Label>
            <div className="flex space-x-2">
              <Input
                id="deviceId"
                value={specificDeviceId}
                onChange={(e) => setSpecificDeviceId(e.target.value)}
                placeholder="Enter device ID or use current"
              />
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentDeviceId}
                size="sm"
              >
                Use Current
              </Button>
            </div>
          </div>
        )}

        <Button
          onClick={sendTestNotification}
          disabled={isSending}
          className="w-full"
        >
          {isSending ? 'Sending...' : 'Send Test Notification'}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Make sure notifications are enabled in your device settings</p>
          <p>• Test notifications will be sent to devices interested in the selected category</p>
          <p>• Close the app to test background notification delivery</p>
        </div>
      </CardContent>
    </Card>
  );
};