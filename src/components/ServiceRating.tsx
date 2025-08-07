import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ServiceRatingProps {
  bookingId: string;
  serviceProviderId: string;
  serviceProviderName: string;
  onRatingSubmitted?: () => void;
}

interface ExistingReview {
  id: string;
  rating: number;
  comment: string | null;
}

export const ServiceRating: React.FC<ServiceRatingProps> = ({
  bookingId,
  serviceProviderId,
  serviceProviderName,
  onRatingSubmitted
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState<ExistingReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    checkExistingReview();
  }, [bookingId, profile?.id]);

  const checkExistingReview = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, comment')
        .eq('booking_id', bookingId)
        .eq('reviewer_id', profile.id)
        .single();

      if (data) {
        setExistingReview(data);
        setRating(data.rating);
        setComment(data.comment || '');
      }
    } catch (error) {
      // No existing review found, which is fine
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!profile?.id || rating === 0) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          booking_id: bookingId,
          reviewer_id: profile.id,
          reviewed_id: serviceProviderId,
          rating,
          comment: comment.trim() || null
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Rating Submitted",
        description: `Thank you for rating ${serviceProviderName}!`,
      });

      onRatingSubmitted?.();
      checkExistingReview(); // Refresh to show submitted review
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={index}
          type="button"
          className={`p-1 transition-colors ${
            existingReview ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
          onMouseEnter={() => !existingReview && setHoveredRating(starValue)}
          onMouseLeave={() => !existingReview && setHoveredRating(0)}
          onClick={() => !existingReview && setRating(starValue)}
          disabled={!!existingReview}
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              isFilled 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-muted-foreground'
            }`}
          />
        </button>
      );
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
            <div className="flex gap-2 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-8 h-8 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          {existingReview ? 'Your Rating' : 'Rate Service Provider'}
        </CardTitle>
        <CardDescription>
          {existingReview 
            ? `You rated ${serviceProviderName}` 
            : `How was your experience with ${serviceProviderName}?`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-1">
          {renderStars()}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {rating} out of 5 stars
            </span>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Comment (optional)
          </label>
          <Textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={!!existingReview}
            rows={3}
          />
        </div>

        {!existingReview && (
          <Button
            onClick={handleSubmitRating}
            disabled={rating === 0 || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </Button>
        )}

        {existingReview && (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            ✓ Rating submitted on {new Date().toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};