
import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
}

export const Loading = React.memo(({ 
  size = 'md', 
  text = 'Carregando...', 
  className,
  variant = 'spinner'
}: LoadingProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center space-x-2', className)}>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-law-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-law-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-law-accent rounded-full animate-bounce"></div>
        </div>
        {text && <span className={cn('text-gray-400 ml-3', textSizeClasses[size])}>{text}</span>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center justify-center space-x-3', className)}>
        <div className={cn('bg-law-accent rounded-full animate-pulse', sizeClasses[size])}></div>
        {text && <span className={cn('text-gray-400', textSizeClasses[size])}>{text}</span>}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center space-x-3', className)}>
      <Loader2 className={cn('animate-spin text-law-accent', sizeClasses[size])} />
      {text && <span className={cn('text-gray-400', textSizeClasses[size])}>{text}</span>}
    </div>
  );
});

Loading.displayName = 'Loading';
