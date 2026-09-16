'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n';

export interface CoverLetterPersonalInfo {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface CoverLetterPreviewProps {
  /** Cover letter content */
  content: string;
  /** Personal info for header */
  personalInfo: CoverLetterPersonalInfo;
  /** Page size for styling */
  pageSize?: 'A4' | 'LETTER';
  /** Additional class names */
  className?: string;
}

export function CoverLetterPreview({
  content,
  personalInfo,
  pageSize = 'A4',
  className,
}: CoverLetterPreviewProps) {
  const { t, locale } = useTranslations();
  const today = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  // Parse content into paragraphs
  const paragraphs = content.split('\n\n').filter((p) => p.trim().length > 0);

  return (
    <div
      className={cn(
        'bg-[#27272a] border border-white/10 text-white',
        'shadow-sw-sm',
        'overflow-hidden',
        'mx-auto',
        className
      )}
    >
      {/* Letter Content */}
      <div
        className={cn('p-8 md:p-12', pageSize === 'A4' ? 'min-h-[297mm]' : 'min-h-[11in]')}
        style={{
          maxWidth: pageSize === 'A4' ? '210mm' : '8.5in',
        }}
      >
        {/* Header - Personal Info */}
        <header className="mb-8 border-b border-white/10 pb-4">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
            {personalInfo.name || t('coverLetter.preview.defaultName')}
          </h1>
          <div className="mt-2 font-mono text-xs text-zinc-300 flex flex-wrap gap-x-4 gap-y-1">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          </div>
        </header>

        {/* Date */}
        <div className="mb-8">
          <p className="font-mono text-sm text-zinc-300">{today}</p>
        </div>

        {/* Body */}
        <div className="space-y-4">
          {paragraphs.length > 0 ? (
            paragraphs.map((para, idx) => (
              <p key={idx} className="font-serif text-base leading-relaxed text-zinc-100">
                {para}
              </p>
            ))
          ) : (
            <div className="text-center py-12 text-zinc-400">
              <p className="font-mono text-sm">{t('coverLetter.preview.emptyTitle')}</p>
              <p className="font-mono text-xs mt-2">{t('coverLetter.preview.emptyDescription')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
