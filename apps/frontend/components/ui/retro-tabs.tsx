'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Swiss International Style Tabs Component
 *
 * Design Principles:
 * - Square corners (rounded-none) - Brutalist aesthetic
 * - Hard shadows on active tab
 * - Black borders for high contrast
 * - Monospace uppercase text
 */

export interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface RetroTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const RetroTabs: React.FC<RetroTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <div className={cn('flex gap-0 border-b border-white/10', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isDisabled = tab.disabled;

        return (
          <button
            key={tab.id}
            onClick={() => !isDisabled && onTabChange(tab.id)}
            disabled={isDisabled}
            className={cn(
              'px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all',
              'border border-b-0 border-white/10 -mb-px',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
              isActive && [
                'bg-[#27272a] text-white font-bold',
                'shadow-[2px_-2px_0px_0px_rgba(0,0,0,0.2)]',
                'border-b-[#27272a]',
              ],
              !isActive &&
                !isDisabled && ['bg-[#18181a] text-zinc-300 hover:bg-[#202024] hover:text-white'],
              isDisabled && ['bg-[#141416] text-zinc-500 cursor-not-allowed opacity-40']
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
