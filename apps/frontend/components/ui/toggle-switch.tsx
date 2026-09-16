'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  className,
}) => {
  const labelId = React.useId();

  const handleToggle = () => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-xl border border-white/10 bg-[#161618] transition-all',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div className="flex-1 mr-4">
        <div id={labelId} className="font-mono text-xs font-bold uppercase tracking-wider text-[#F5F5F5]">
          {label}
        </div>
        {description && <div className="font-sans text-xs text-[#A1A1AA] mt-1 leading-relaxed">{description}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF521D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#18181A]',
          'disabled:cursor-not-allowed',
          checked ? 'bg-[#FF521D] border border-[#FF521D]' : 'bg-[#1E1E20] border border-white/15'
        )}
      >
        <span
          className={cn(
            'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-md',
            'transition-transform duration-200 ease-in-out',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
};
