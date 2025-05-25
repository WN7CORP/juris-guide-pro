
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState = React.memo(({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'md'
}: EmptyStateProps) => {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'h-8 w-8',
      title: 'text-lg',
      description: 'text-sm'
    },
    md: {
      container: 'py-12',
      icon: 'h-12 w-12',
      title: 'text-xl',
      description: 'text-base'
    },
    lg: {
      container: 'py-16',
      icon: 'h-16 w-16',
      title: 'text-2xl',
      description: 'text-lg'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center space-y-4',
      classes.container,
      className
    )}>
      {Icon && (
        <div className="flex items-center justify-center rounded-full bg-gray-800/50 p-4">
          <Icon className={cn('text-gray-400', classes.icon)} />
        </div>
      )}
      
      <div className="space-y-2">
        <h3 className={cn('font-semibold text-gray-300', classes.title)}>
          {title}
        </h3>
        {description && (
          <p className={cn('text-gray-500 max-w-md', classes.description)}>
            {description}
          </p>
        )}
      </div>

      {action && (
        <Button 
          onClick={action.onClick}
          variant="outline"
          className="border-gray-600 hover:bg-gray-700/50"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';
