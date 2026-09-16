'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Linkedin, Mail } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

export interface OutreachPreviewProps {
  /** Outreach message content */
  content: string;
  /** Additional class names */
  className?: string;
}

export function OutreachPreview({ content, className }: OutreachPreviewProps) {
  const { t } = useTranslations();
  return (
    <div
      className={cn(
        'bg-[#27272a] border border-white/10 text-white',
        'shadow-sw-default',
        'overflow-hidden',
        className
      )}
    >
      {/* Preview Header */}
      <div className="p-4 border-b border-white/10 bg-[#1e1e20] text-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Linkedin className="w-4 h-4 text-[#0077B5]" />
            <span className="font-mono text-xs uppercase text-zinc-300">
              {t('outreach.preview.channels.linkedin')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <span className="font-mono text-xs uppercase text-zinc-300">
              {t('outreach.preview.channels.email')}
            </span>
          </div>
        </div>
      </div>

      {/* Message Preview */}
      <div className="p-6 md:p-8">
        {content ? (
          <div className="space-y-4">
            {/* Message Bubble Style */}
            <div className="bg-[#1e1e20] border border-white/10 p-4 shadow-sw-sm text-white">
              <p className="font-sans text-sm leading-relaxed whitespace-pre-wrap text-white">{content}</p>
            </div>

            {/* Usage Tips */}
            <div className="pt-4 border-t border-white/10">
              <p className="font-mono text-xs text-zinc-400 uppercase mb-2">
                {t('outreach.preview.howToUseTitle')}
              </p>
              <ul className="font-mono text-xs text-zinc-400 space-y-1">
                <li>{t('outreach.preview.steps.step1')}</li>
                <li>{t('outreach.preview.steps.step2')}</li>
                <li>{t('outreach.preview.steps.step3')}</li>
                <li>{t('outreach.preview.steps.step4')}</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-steel-grey">
            <p className="font-mono text-sm">{t('outreach.preview.emptyTitle')}</p>
            <p className="font-mono text-xs mt-2">{t('outreach.preview.emptyDescription')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
