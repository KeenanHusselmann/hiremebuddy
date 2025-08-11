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
        // Use RPC to fetch ratings without RLS issues on bookings
        const { data: agg, error } = await supabase.rpc('get_service_ratings', {
          service_ids: serviceIds,
        });

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

        // Apply aggregated results
        if (agg && Array.isArray(agg)) {
          agg.forEach((row: any) => {
            const serviceId = row.service_id as string;
            if (!serviceId) return;
            ratingsMap[serviceId] = {
              serviceId,
              averageRating: row.average_rating !== null ? Number(row.average_rating) : null,
              reviewCount: Number(row.review_count || 0),
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