import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  to?: string;
  className?: string;
  children?: React.ReactNode;
}

export const BackButton = ({ to = '/', className = '', children }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      // Try to go back in history, fallback to home
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className={`flex items-center space-x-2 p-2 tap-target ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className="h-5 w-5" />
      {children && <span>{children}</span>}
    </Button>
  );
};

export default BackButton;