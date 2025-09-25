import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const DatabaseTest: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [deviceCount, setDeviceCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      // Test basic connection
      const { data, error, count } = await supabase
        .from('anonymous_device_tokens')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Connection test failed:', error);
        setIsConnected(false);
        toast.error('Database connection failed');
      } else {
        setIsConnected(true);
        setDeviceCount(count || 0);
        toast.success('Database connected successfully!');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setIsConnected(false);
      toast.error('Connection error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testRPCFunction = async () => {
    setLoading(true);
    try {
      const testDeviceId = `test-device-${Date.now()}`;
      const testToken = `test-fcm-token-${Date.now()}`;

      // Test the RPC function
      const { data, error } = await supabase.rpc('insert_anonymous_device_token', {
        p_device_id: testDeviceId,
        p_fcm_token: testToken,
        p_location_lat: 37.7749,
        p_location_lng: -122.4194,
        p_preferred_categories: ['cleaning', 'gardening']
      });

      if (error) {
        console.error('RPC test failed:', error);
        toast.error('RPC function test failed');
      } else {
        console.log('RPC test successful:', data);
        toast.success('RPC function test successful!');
        testConnection(); // Refresh count
      }
    } catch (error) {
      console.error('RPC error:', error);
      toast.error('RPC error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <div 
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span>
            Status: {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <div>
          <p>Device Tokens Count: {deviceCount}</p>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={testConnection} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </Button>
          
          <Button 
            onClick={testRPCFunction} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test RPC Function'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseTest;