import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface IdentityVerificationProps {
  onVerificationComplete: (data: {
    frontImagePath: string;
    backImagePath: string;
    selfieImagePath: string;
  }) => void;
}

const IdentityVerification = ({ onVerificationComplete }: IdentityVerificationProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    front: null as string | null,
    back: null as string | null,
    selfie: null as string | null,
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'front' | 'back' | 'selfie'
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('kyc-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('kyc-photos')
        .getPublicUrl(data.path);

      setUploadedFiles(prev => ({
        ...prev,
        [type]: publicUrl
      }));

      toast({
        title: "Success",
        description: `${type === 'front' ? 'ID Front' : type === 'back' ? 'ID Back' : 'Selfie'} uploaded successfully`,
      });

      // Check if all files are uploaded
      const updatedFiles = { ...uploadedFiles, [type]: publicUrl };
      if (updatedFiles.front && updatedFiles.back && updatedFiles.selfie) {
        onVerificationComplete({
          frontImagePath: updatedFiles.front,
          backImagePath: updatedFiles.back,
          selfieImagePath: updatedFiles.selfie,
        });
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getUploadText = (type: 'front' | 'back' | 'selfie') => {
    if (uploadedFiles[type]) return 'Uploaded ✓';
    return 'Click to upload or drag and drop';
  };

  const getFileTypeText = (type: 'front' | 'back' | 'selfie') => {
    switch (type) {
      case 'front': return 'National ID (Front)';
      case 'back': return 'National ID (Back)';
      case 'selfie': return 'Selfie with ID';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-card rounded-lg border">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">Identity Verification</h3>
        <p className="text-sm text-muted-foreground">
          To ensure the security of our platform, we require identity verification. 
          Please upload clear photos of your National ID (front and back) and a selfie holding your ID.
        </p>
      </div>

      <div className="space-y-6">
        {(['front', 'back', 'selfie'] as const).map((type) => (
          <div key={type} className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {getFileTypeText(type)}
            </label>
            
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, type)}
                className="hidden"
                id={`upload-${type}`}
                disabled={isUploading}
              />
              
              <label
                htmlFor={`upload-${type}`}
                className={`
                  flex flex-col items-center justify-center w-full h-32 
                  border-2 border-dashed rounded-lg cursor-pointer
                  transition-colors duration-200
                  ${uploadedFiles[type] 
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                  }
                  ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className={`w-8 h-8 mb-2 ${
                    uploadedFiles[type] ? 'text-green-600' : 'text-muted-foreground'
                  }`} />
                  <p className={`text-sm font-medium ${
                    uploadedFiles[type] ? 'text-green-600' : 'text-foreground'
                  }`}>
                    {getUploadText(type)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG or JPEG (max. 5MB)
                  </p>
                </div>
              </label>
            </div>
          </div>
        ))}
      </div>

      {uploadedFiles.front && uploadedFiles.back && uploadedFiles.selfie && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            ✓ All verification documents uploaded successfully!
          </p>
          <p className="text-xs text-green-600 dark:text-green-300 mt-1">
            Your submission will be reviewed by our team within 24-48 hours.
          </p>
        </div>
      )}
    </div>
  );
};

export default IdentityVerification;