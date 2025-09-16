import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Database,
  Mail,
  Shield,
  Globe,
  Bell,
  Save,
  RefreshCw
} from 'lucide-react';

interface AdminSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
}

const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Default settings structure
  const defaultSettings = {
    platform_name: 'HireMeBuddy',
    platform_description: 'Connect with skilled workers in Namibia',
    email_notifications: true,
    sms_notifications: false,
    auto_verify_providers: false,
    booking_auto_expire_hours: 24,
    commission_rate: 0.10,
    maintenance_mode: false,
    max_portfolio_images: 5,
    allow_anonymous_browsing: true
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: adminSettings, error } = await supabase
        .from('admin_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;

      setSettings(adminSettings || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load admin settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (settingKey: string, value: any, description?: string) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: settingKey,
          setting_value: value,
          description: description || `Setting for ${settingKey}`,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Setting updated successfully",
      });

      fetchSettings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getSettingValue = (key: string, defaultValue: any = '') => {
    const setting = settings.find(s => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
  };

  const handleStringSettingChange = (key: string, value: string, description: string) => {
    updateSetting(key, value, description);
  };

  const handleBooleanSettingChange = (key: string, value: boolean, description: string) => {
    updateSetting(key, value, description);
  };

  const handleNumberSettingChange = (key: string, value: number, description: string) => {
    updateSetting(key, value, description);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Platform Settings
        </h1>
        <p className="text-muted-foreground">
          Configure platform-wide settings and preferences
        </p>
      </div>

      {/* Platform Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Platform Information
          </CardTitle>
          <CardDescription>Basic platform configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="platform_name">Platform Name</Label>
              <Input
                id="platform_name"
                defaultValue={getSettingValue('platform_name', defaultSettings.platform_name)}
                onBlur={(e) => handleStringSettingChange('platform_name', e.target.value, 'Platform display name')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission_rate">Commission Rate (%)</Label>
              <Input
                id="commission_rate"
                type="number"
                step="0.01"
                min="0"
                max="1"
                defaultValue={getSettingValue('commission_rate', defaultSettings.commission_rate) * 100}
                onBlur={(e) => handleNumberSettingChange('commission_rate', parseFloat(e.target.value) / 100, 'Platform commission rate')}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="platform_description">Platform Description</Label>
            <Textarea
              id="platform_description"
              defaultValue={getSettingValue('platform_description', defaultSettings.platform_description)}
              onBlur={(e) => handleStringSettingChange('platform_description', e.target.value, 'Platform description')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Configure notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Send notifications via email</p>
            </div>
            <Switch
              checked={getSettingValue('email_notifications', defaultSettings.email_notifications)}
              onCheckedChange={(checked) => handleBooleanSettingChange('email_notifications', checked, 'Enable email notifications')}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
            </div>
            <Switch
              checked={getSettingValue('sms_notifications', defaultSettings.sms_notifications)}
              onCheckedChange={(checked) => handleBooleanSettingChange('sms_notifications', checked, 'Enable SMS notifications')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Provider Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Provider Management
          </CardTitle>
          <CardDescription>Configure provider verification and limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Verify Providers</Label>
              <p className="text-sm text-muted-foreground">Automatically verify new service providers</p>
            </div>
            <Switch
              checked={getSettingValue('auto_verify_providers', defaultSettings.auto_verify_providers)}
              onCheckedChange={(checked) => handleBooleanSettingChange('auto_verify_providers', checked, 'Auto-verify new providers')}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="max_portfolio_images">Max Portfolio Images</Label>
              <Input
                id="max_portfolio_images"
                type="number"
                min="1"
                max="20"
                defaultValue={getSettingValue('max_portfolio_images', defaultSettings.max_portfolio_images)}
                onBlur={(e) => handleNumberSettingChange('max_portfolio_images', parseInt(e.target.value), 'Maximum portfolio images per service')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking_auto_expire">Booking Auto-Expire (hours)</Label>
              <Input
                id="booking_auto_expire"
                type="number"
                min="1"
                max="168"
                defaultValue={getSettingValue('booking_auto_expire_hours', defaultSettings.booking_auto_expire_hours)}
                onBlur={(e) => handleNumberSettingChange('booking_auto_expire_hours', parseInt(e.target.value), 'Hours before pending bookings auto-expire')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription>System-wide configuration options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Put the platform in maintenance mode</p>
            </div>
            <Switch
              checked={getSettingValue('maintenance_mode', defaultSettings.maintenance_mode)}
              onCheckedChange={(checked) => handleBooleanSettingChange('maintenance_mode', checked, 'Enable maintenance mode')}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Anonymous Browsing</Label>
              <p className="text-sm text-muted-foreground">Allow non-registered users to browse services</p>
            </div>
            <Switch
              checked={getSettingValue('allow_anonymous_browsing', defaultSettings.allow_anonymous_browsing)}
              onCheckedChange={(checked) => handleBooleanSettingChange('allow_anonymous_browsing', checked, 'Allow anonymous service browsing')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Administrative actions and maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={fetchSettings} variant="outline" disabled={saving}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Settings
            </Button>
            <Button disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'All settings auto-save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;