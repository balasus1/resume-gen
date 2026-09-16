import * as React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'outline' | 'ghost';
  noPadding?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', noPadding = false, ...props }, ref) => {
    const baseStyles = 'rounded-xl flex flex-col relative overflow-hidden transition-all duration-150 cubic-bezier(0.16, 1, 0.3, 1)';

    const variants = {
      default: 'bg-[#161618] border border-white/10 text-[#F5F5F5]',
      interactive: cn(
        'bg-[#161618] border border-white/10 text-[#F5F5F5]',
        'cursor-pointer group',
        'hover:border-[#FF521D]/50 hover:bg-[#1C1C1E] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-[2px]'
      ),
      outline: 'bg-[#161618] border border-white/14 text-[#F5F5F5]',
      ghost: 'bg-transparent border-none shadow-none text-[#F5F5F5]',
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], !noPadding && 'p-6 md:p-7', className)}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('font-sans text-xl font-bold leading-tight tracking-tight text-white', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-xs text-[#A1A1AA] font-mono tracking-wide', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('flex-1', className)} {...props} />
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center pt-4 mt-auto border-t border-white/10', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
