import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Star, 
  Award, 
  Users, 
  Clock, 
  MapPin,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

interface ProfileStatsProps {
  profile: any;
  joinDate: Date;
}

const ProfileStats = ({ profile, joinDate }: ProfileStatsProps) => {
  const daysSinceJoined = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
  const isNewUser = daysSinceJoined < 30;
  const profileCompletion = calculateProfileCompletion(profile);
  
  function calculateProfileCompletion(profile: any): number {
    const fields = [
      'full_name', 'bio', 'contact_number', 'location_text', 
      'avatar_url', 'whatsapp_link'
    ];
    const completedFields = fields.filter(field => profile[field]?.trim());
    return Math.round((completedFields.length / fields.length) * 100);
  }

  const achievements = [
    {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Joined within the first month',
      icon: Award,
      unlocked: isNewUser,
      color: 'text-yellow-600'
    },
    {
      id: 'profile_complete',
      name: 'Profile Master',
      description: 'Complete your profile 100%',
      icon: CheckCircle,
      unlocked: profileCompletion === 100,
      color: 'text-green-600'
    },
    {
      id: 'social_butterfly',
      name: 'Social Butterfly',
      description: 'Added all social links',
      icon: Users,
      unlocked: profile.whatsapp_link && profile.facebook_link,
      color: 'text-blue-600'
    },
    {
      id: 'veteran',
      name: 'Platform Veteran',
      description: 'Member for 100+ days',
      icon: Star,
      unlocked: daysSinceJoined >= 100,
      color: 'text-purple-600'
    }
  ];

  const quickStats = [
    {
      label: 'Days Active',
      value: daysSinceJoined,
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      label: 'Profile Complete',
      value: `${profileCompletion}%`,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      label: 'Account Type',
      value: profile.user_type?.charAt(0).toUpperCase() + profile.user_type?.slice(1),
      icon: Users,
      color: 'text-purple-600'
    },
    {
      label: 'Location',
      value: profile.location_text?.split(',')[0] || 'Not set',
      icon: MapPin,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Profile Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <div key={index} className="text-center p-3 rounded-lg bg-muted/50">
                <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                <div className="text-lg font-semibold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profile Completion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Profile Completion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-2" />
          </div>
          {profileCompletion < 100 && (
            <div className="text-sm text-muted-foreground">
              Complete your profile to improve visibility and build trust with other users.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.unlocked
                    ? 'border-primary bg-primary/5'
                    : 'border-dashed border-muted bg-muted/25'
                }`}
              >
                <div className="flex items-start gap-3">
                  <achievement.icon 
                    className={`h-6 w-6 mt-1 ${
                      achievement.unlocked ? achievement.color : 'text-muted-foreground'
                    }`} 
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${
                        achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {achievement.name}
                      </h4>
                      {achievement.unlocked && (
                        <Badge variant="secondary" className="text-xs">
                          Unlocked
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm ${
                      achievement.unlocked ? 'text-muted-foreground' : 'text-muted-foreground/70'
                    }`}>
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileStats;