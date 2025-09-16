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
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={openCamera}>
            <Camera className="h-4 w-4 mr-2" /> Open Camera
          </Button>
          {preview && (
            <Button type="button" variant="ghost" size="sm" onClick={openCamera}>
              <RefreshCw className="h-4 w-4 mr-2" /> Retake
            </Button>
          )}
        </div>
      </div>

      {preview && (
        <img src={preview} alt={`${label} preview`} className="w-full rounded-lg border" />
      )}

      {isOpen && (
        <div className="space-y-3">
          <div className="rounded-lg overflow-hidden border relative">
            <video ref={videoRef} className="w-full h-auto bg-black" playsInline muted />
          </div>
          <Button type="button" className="w-full" onClick={takePhoto}>
            {captureText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
