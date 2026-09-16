import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'destructive'
    | 'success'
    | 'warning'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = cn(
      'relative inline-flex items-center justify-center gap-2',
      'whitespace-nowrap text-xs font-medium font-mono uppercase tracking-wider',
      'transition-all duration-150 cubic-bezier(0.16, 1, 0.3, 1)',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF521D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#18181A]',
      'disabled:pointer-events-none disabled:opacity-40',
      "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
      'rounded-lg'
    );

    const iconHitArea = "before:absolute before:-inset-1.5 before:content-['']";

    const variants = {
      // PRIMARY - Kimchi Orange (#FF521D)
      default: cn(
        'bg-[#FF521D] text-white font-sans font-semibold normal-case text-sm tracking-normal',
        'border border-transparent',
        'shadow-[0_4px_20px_-4px_rgba(255,82,29,0.4)]',
        'hover:bg-[#E04515] hover:scale-[1.01] hover:shadow-[0_6px_24px_-4px_rgba(255,82,29,0.5)]',
        'active:scale-[0.99]'
      ),

      // DESTRUCTIVE - Alert Red
      destructive: cn(
        'bg-red-500/10 text-red-400 border border-red-500/20 font-sans font-semibold normal-case text-sm',
        'hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300',
        'active:scale-[0.99]'
      ),

      // SUCCESS - Kimchi Mint Green (#4ED996)
      success: cn(
        'bg-[#4ED996]/10 text-[#4ED996] border border-[#4ED996]/30 font-sans font-semibold normal-case text-sm',
        'hover:bg-[#4ED996]/20 hover:border-[#4ED996]/50',
        'active:scale-[0.99]'
      ),

      // WARNING - Orange Accent
      warning: cn(
        'bg-[#FF521D]/10 text-[#FF521D] border border-[#FF521D]/30 font-sans font-semibold normal-case text-sm',
        'hover:bg-[#FF521D]/20 hover:border-[#FF521D]/50',
        'active:scale-[0.99]'
      ),

      // OUTLINE - Dark Subtle Outline
      outline: cn(
        'bg-transparent text-[#A1A1AA]',
        'border border-white/14',
        'hover:text-white hover:border-white/30 hover:bg-white/[0.05]',
        'active:scale-[0.99]'
      ),

      // SECONDARY - Surface Panel
      secondary: cn(
        'bg-[#1E1E20] text-[#F5F5F5]',
        'border border-white/10',
        'hover:bg-[#252528] hover:border-white/20 hover:text-white',
        'active:scale-[0.99]'
      ),

      // GHOST - Minimal
      ghost: cn(
        'bg-transparent text-[#A1A1AA]',
        'hover:bg-white/[0.06] hover:text-white'
      ),

      // LINK - Underline
      link: cn(
        'bg-transparent text-[#FF521D] underline-offset-4 hover:underline p-0 h-auto'
      ),
    };

    const sizes = {
      default: 'h-9 px-4 py-2 text-xs',
      sm: 'h-8 px-3 text-xs',
      lg: 'h-11 px-6 text-sm',
      icon: cn('h-9 w-9 p-0', iconHitArea),
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
