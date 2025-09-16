import React, { useState } from 'react';
import { Facebook, ExternalLink, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface FacebookMarketplaceProps {
  className?: string;
}

export const FacebookMarketplace: React.FC<FacebookMarketplaceProps> = ({ className = "" }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleFacebookSignIn = () => {
    // Facebook OAuth integration would go here
    // For now, redirect to Facebook login page
    window.open('https://www.facebook.com/login', '_blank');
  };

  const handleSearchMarketplace = () => {
    if (searchQuery.trim()) {
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      const marketplaceUrl = `https://www.facebook.com/marketplace/search/?query=${encodedQuery}`;
      window.open(marketplaceUrl, '_blank');
    }
  };

  const handleViewAllServices = () => {
    window.open('https://www.facebook.com/marketplace/category/services', '_blank');
  };

  const popularCategories = [
    { name: 'Home Services', query: 'home services namibia' },
    { name: 'Construction', query: 'construction workers namibia' },
    { name: 'Cleaning', query: 'cleaning services windhoek' },
    { name: 'Gardening', query: 'gardening services namibia' },
    { name: 'Handyman', query: 'handyman services windhoek' },
    { name: 'Plumbing', query: 'plumber windhoek namibia' }
  ];

  const handleCategoryClick = (query: string) => {
    const encodedQuery = encodeURIComponent(query);
    const marketplaceUrl = `https://www.facebook.com/marketplace/search/?query=${encodedQuery}`;
    window.open(marketplaceUrl, '_blank');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Facebook className="h-5 w-5 text-blue-600" />
          Facebook Marketplace Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Facebook Sign In */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Connect with Facebook</h4>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Sign in to view and post services on Facebook Marketplace
              </p>
            </div>
          </div>
          <Button
            onClick={handleFacebookSignIn}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Facebook className="h-4 w-4 mr-2" />
            Sign in with Facebook
          </Button>
        </div>

        {/* Search Marketplace */}
        <div className="space-y-3">
          <h4 className="font-medium">Search Facebook Marketplace</h4>
          <div className="flex gap-2">
            <Input
              placeholder="Search for services on Facebook..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchMarketplace()}
            />
            <Button
              onClick={handleSearchMarketplace}
              disabled={!searchQuery.trim()}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Popular Categories */}
        <div className="space-y-3">
          <h4 className="font-medium">Popular Service Categories</h4>
          <div className="grid grid-cols-2 gap-2">
            {popularCategories.map((category) => (
              <Badge
                key={category.name}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 justify-center p-2 text-center"
                onClick={() => handleCategoryClick(category.query)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Button
            onClick={handleViewAllServices}
            variant="outline"
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View All Services on Facebook
          </Button>
        </div>

        {/* Info */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Facebook Marketplace integration allows you to discover additional services
            and connect with more service providers in your area.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};