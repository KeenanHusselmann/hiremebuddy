import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  Calendar, 
  MapPin, 
  Search, 
  BookOpen,
  Settings,
  Share2,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface QuickActionsProps {
  userType: string;
}

const QuickActions = ({ userType }: QuickActionsProps) => {
  const { toast } = useToast();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'HireMeBuddy Profile',
          text: 'Check out my profile on HireMeBuddy!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share canceled');
      }
    } else {
      // Fallback for browsers without Web Share API
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Profile link copied to clipboard!",
      });
    }
  };

  const handleExportData = () => {
    // Simple data export functionality
    const userData = {
      exportDate: new Date().toISOString(),
      profileUrl: window.location.href,
      userType: userType
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hiremebuddy-profile-data.json';
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Your profile data has been downloaded.",
    });
  };

  const actions = [
    {
      title: 'Browse Services',
      description: 'Find skilled workers',
      icon: Search,
      href: '/services',
      variant: 'default' as const
    },
    {
      title: 'View Bookings',
      description: 'Check your bookings',
      icon: Calendar,
      href: '/bookings',
      variant: 'outline' as const
    },
    {
      title: 'Explore Map',
      description: 'Find workers nearby',
      icon: MapPin,
      href: '/#map',
      variant: 'outline' as const
    },
    {
      title: 'How It Works',
      description: 'Learn the platform',
      icon: BookOpen,
      href: '/how-it-works',
      variant: 'ghost' as const
    }
  ];

  const utilityActions = [
    {
      title: 'Share Profile',
      description: 'Share your profile link',
      icon: Share2,
      action: handleShare,
      variant: 'outline' as const
    },
    {
      title: 'Export Data',
      description: 'Download profile data',
      icon: Download,
      action: handleExportData,
      variant: 'ghost' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                className="h-auto p-4 justify-start"
                asChild
              >
                <Link to={action.href}>
                  <div className="flex items-center gap-3 w-full">
                    <action.icon className="h-5 w-5 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Utility Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Profile Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {utilityActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                className="h-auto p-4 justify-start"
                onClick={action.action}
              >
                <div className="flex items-center gap-3 w-full">
                  <action.icon className="h-5 w-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fun Tip */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-primary mt-1" />
            <div>
              <h4 className="font-medium text-primary">Pro Tip</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {userType === 'labourer' 
                  ? "Complete your profile and add portfolio images to attract more clients!"
                  : "Use detailed descriptions when booking services to get the best results!"
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickActions;