import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, RefreshCw } from 'lucide-react';

interface CameraCaptureProps {
  label: string;
  facingMode?: 'user' | 'environment';
  onCapture: (blob: Blob, dataUrl: string) => void;
  captureText?: string;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  label,
  facingMode = 'user',
  onCapture,
  captureText = 'Capture Photo',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const openCamera = async () => {
    try {
      setPreview(null);
      setIsOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: 'Camera unavailable',
        description: 'Please allow camera access and try again.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setIsOpen(false);
  };

  const takePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPreview(dataUrl);
      onCapture(blob, dataUrl);
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-sm font-medium">{label}</p>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={openCamera}
            className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 flex-1 sm:flex-none"
          >
            <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> 
            <span className="truncate">Open Camera</span>
          </Button>
          {preview && (
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={openCamera}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 flex-1 sm:flex-none"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> 
              <span className="truncate">Retake</span>
            </Button>
          )}
        </div>
      </div>

      {preview && (
        <img 
          src={preview} 
          alt={`${label} preview`} 
          className="w-full max-w-sm mx-auto rounded-lg border" 
        />
      )}

      {isOpen && (
        <div className="space-y-3">
          <div className="rounded-lg overflow-hidden border relative max-w-sm mx-auto">
            <video 
              ref={videoRef} 
              className="w-full h-auto bg-black aspect-[3/4] object-cover" 
              playsInline 
              muted 
            />
          </div>
          <Button 
            type="button" 
            className="w-full max-w-sm mx-auto block py-3 text-sm sm:text-base" 
            onClick={takePhoto}
          >
            {captureText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
