import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border border-white/10 bg-[#1E1E20] px-3.5 py-2.5 font-mono text-xs text-[#F5F5F5] placeholder:text-[#A1A1AA]/60 focus-visible:outline-none focus-visible:border-[#FF521D] focus-visible:ring-1 focus-visible:ring-[#FF521D] disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
