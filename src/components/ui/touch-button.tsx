import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const TouchButton: React.FC<TouchButtonProps> = ({
  variant = 'default',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'min-h-[40px] px-3 text-sm',
    md: 'min-h-[44px] px-4 text-base',
    lg: 'min-h-[48px] px-6 text-lg',
    icon: 'h-[44px] w-[44px]'
  };

  const buttonContent = (
    <>
      {Icon && iconPosition === 'left' && (
        <Icon className={cn(
          'flex-shrink-0',
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
          children && 'mr-2'
        )} />
      )}
      {loading ? (
        <div className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent',
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
        )} />
      ) : (
        children
      )}
      {Icon && iconPosition === 'right' && (
        <Icon className={cn(
          'flex-shrink-0',
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
          children && 'ml-2'
        )} />
      )}
    </>
  );

  return (
    <Button
      variant={variant}
      disabled={disabled || loading}
      className={cn(
        'tap-target active:scale-95 transition-transform duration-75',
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {buttonContent}
    </Button>
  );
};

export default TouchButton;