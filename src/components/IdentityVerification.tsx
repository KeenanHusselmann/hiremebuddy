import { useState } from 'react';
import { Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import CameraCapture from '@/components/CameraCapture';

interface IdentityVerificationProps {
  onVerificationComplete: (data: {
    frontImagePath: string;
    backImagePath: string;
    selfieImagePath: string;
  }) => void;
}

const IdentityVerification = ({ onVerificationComplete }: IdentityVerificationProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImages, setCapturedImages] = useState({
    front: null as string | null,
    back: null as string | null,
    selfie: null as string | null,
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const handleImageCapture = async (blob: Blob, dataUrl: string, type: 'front' | 'back' | 'selfie') => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to capture images",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const fileName = `${user.id}/${type}_${Date.now()}.jpeg`;

      const { data, error } = await supabase.storage
        .from('kyc-photos')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('kyc-photos')
        .getPublicUrl(data.path);

      setCapturedImages(prev => ({
        ...prev,
        [type]: publicUrl
      }));

      toast({
        title: "Success",
        description: `${type === 'front' ? 'ID Front' : type === 'back' ? 'ID Back' : 'Selfie'} captured successfully`,
      });

      // Check if all images are captured
      const updatedImages = { ...capturedImages, [type]: publicUrl };
      if (updatedImages.front && updatedImages.back && updatedImages.selfie) {
        onVerificationComplete({
          frontImagePath: updatedImages.front,
          backImagePath: updatedImages.back,
          selfieImagePath: updatedImages.selfie,
        });
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save captured image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileTypeText = (type: 'front' | 'back' | 'selfie') => {
    switch (type) {
      case 'front': return 'National ID (Front)';
      case 'back': return 'National ID (Back)';
      case 'selfie': return 'Selfie with ID';
    }
  };

  const getFacingMode = (type: 'front' | 'back' | 'selfie') => {
    return type === 'selfie' ? 'user' : 'environment';
  };

  const getCaptureText = (type: 'front' | 'back' | 'selfie') => {
    switch (type) {
      case 'front': return 'Capture ID Front';
      case 'back': return 'Capture ID Back';
      case 'selfie': return 'Take Selfie with ID';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-card rounded-lg border">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">Identity Verification</h3>
        <p className="text-sm text-muted-foreground">
          To ensure the security of our platform, we require identity verification. 
          Please use your camera to capture clear photos of your National ID (front and back) and a selfie holding your ID.
        </p>
      </div>

      <div className="space-y-6">
        {(['front', 'back', 'selfie'] as const).map((type) => (
          <div key={type} className="space-y-4">
            <CameraCapture
              label={getFileTypeText(type)}
              facingMode={getFacingMode(type)}
              captureText={getCaptureText(type)}
              onCapture={(blob, dataUrl) => handleImageCapture(blob, dataUrl, type)}
            />
          </div>
        ))}
      </div>

      {capturedImages.front && capturedImages.back && capturedImages.selfie && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            ✓ All verification documents captured successfully!
          </p>
          <p className="text-xs text-green-600 dark:text-green-300 mt-1">
            Your submission will be reviewed by our team within 24-48 hours.
          </p>
        </div>
      )}

      {isProcessing && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Processing captured image...
          </p>
        </div>
      )}
    </div>
  );
};

export default IdentityVerification;