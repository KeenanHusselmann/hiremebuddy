import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RatingData {
  serviceId: string;
  averageRating: number | null;
  reviewCount: number;
}

export const useServiceRatings = (serviceIds: string[]) => {
  const [ratings, setRatings] = useState<Record<string, RatingData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!serviceIds.length) {
        setLoading(false);
        return;
      }

      try {
        // Get all reviews for services through bookings
        const { data: reviewData, error } = await supabase
          .from('reviews')
          .select(`
            rating,
            booking_id,
            bookings!inner(
              service_id,
              services!inner(id)
            )
          `)
          .in('bookings.service_id', serviceIds);

        if (error) throw error;

        // Calculate ratings per service
        const ratingsMap: Record<string, RatingData> = {};
        
        // Initialize all services with no ratings
        serviceIds.forEach(serviceId => {
          ratingsMap[serviceId] = {
            serviceId,
            averageRating: null,
            reviewCount: 0
          };
        });

        // Calculate actual ratings
        if (reviewData) {
          const serviceReviews: Record<string, number[]> = {};
          
          reviewData.forEach(review => {
            const serviceId = review.bookings?.service_id;
            if (serviceId) {
              if (!serviceReviews[serviceId]) {
                serviceReviews[serviceId] = [];
              }
              serviceReviews[serviceId].push(review.rating);
            }
          });

          Object.entries(serviceReviews).forEach(([serviceId, ratings]) => {
            const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
            ratingsMap[serviceId] = {
              serviceId,
              averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
              reviewCount: ratings.length
            };
          });
        }

        setRatings(ratingsMap);
      } catch (error) {
        console.error('Error fetching service ratings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [serviceIds]);

  return { ratings, loading };
};

// Helper function for a single service rating
export const useServiceRating = (serviceId: string) => {
  const { ratings, loading } = useServiceRatings(serviceId ? [serviceId] : []);
  return {
    rating: ratings[serviceId] || { serviceId, averageRating: null, reviewCount: 0 },
    loading
  };
};

// Helper function to format rating display
export const formatRating = (averageRating: number | null, reviewCount: number) => {
  if (!averageRating || reviewCount === 0) {
    return 'New';
  }
  return averageRating.toFixed(1);
};

// Helper function to render star rating
export const renderStars = (rating: number | null, size: 'sm' | 'md' | 'lg' = 'md') => {
  const stars = [];
  const actualRating = rating || 0;
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={`${sizeClasses[size]} inline-block ${
          i <= Math.floor(actualRating)
            ? 'text-yellow-400'
            : i <= actualRating
            ? 'text-yellow-200'
            : 'text-gray-300'
        }`}
      >
        ★
      </span>
    );
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
};