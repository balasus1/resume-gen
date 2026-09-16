'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LayoutGrid from 'lucide-react/dist/esm/icons/layout-grid';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Wrench from 'lucide-react/dist/esm/icons/wrench';
import Github from 'lucide-react/dist/esm/icons/github';
import { useTranslations } from '@/lib/i18n';

export const SwissGrid = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslations();
  let pathname = '/dashboard';
  try {
    pathname = usePathname() || '/dashboard';
  } catch {
    pathname = '/dashboard';
  }

  const navItems = [
    { href: '/dashboard', label: t('nav.dashboard') || 'Dashboard', icon: FileText },
    { href: '/tailor', label: 'Tailor', icon: Sparkles },
    { href: '/tracker', label: t('nav.applicationTracker') || 'Tracker', icon: LayoutGrid },
    { href: '/settings', label: t('nav.settings') || 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen w-full bg-[#18181A] text-[#F5F5F5] font-sans antialiased flex flex-col relative selection:bg-[#FF521D]/30 selection:text-[#FF521D]">
      {/* 1. Kimchi Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[56px] bg-[#18181A]/95 backdrop-blur-md border-b border-white/[0.08] px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#FF521D] flex items-center justify-center text-white font-bold font-mono text-sm shadow-[0_2px_10px_-2px_rgba(255,82,29,0.5)] group-hover:scale-105 transition-transform">
              RM
            </div>
            <span className="font-sans text-sm font-bold tracking-tight text-white group-hover:text-[#FF521D] transition-colors">
              Resume Matcher
            </span>
          </Link>
          <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-[#A1A1AA]">
            v2.5 AI
          </span>
        </div>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-1 font-sans text-sm font-medium">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                  isActive
                    ? 'text-[#FF521D] bg-[#FF521D]/10 font-semibold'
                    : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FF521D]' : 'text-[#A1A1AA]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Actions / Metadata */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/srbhr/Resume-Matcher"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 h-7 px-3 text-xs font-mono font-medium text-[#A1A1AA] bg-transparent border border-white/12 rounded-md hover:border-white/30 hover:text-white hover:bg-white/5 transition-all"
          >
            <Github className="w-3.5 h-3.5 text-white" />
            <span>GitHub</span>
          </a>
          <Link
            href="/tailor"
            className="inline-flex items-center justify-center h-8 px-3.5 text-xs font-medium text-white bg-[#FF521D] rounded-lg shadow-[0_4px_16px_-4px_rgba(255,82,29,0.4)] hover:bg-[#E04515] hover:scale-[1.02] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            <span>Tailor Resume</span>
          </Link>
        </div>
      </nav>

      {/* 2. Top Radial Glowing Background Gradient */}
      <div
        className="pointer-events-none absolute top-[-200px] left-1/2 -translate-x-1/2 w-[1200px] h-[700px] opacity-40 z-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 82, 29, 0.35) 0%, transparent 55%)',
        }}
      />

      {/* 3. Main Hero & Container Layout */}
      <div className="pt-[72px] pb-12 px-4 md:px-8 max-w-7xl mx-auto w-full flex-1 flex flex-col relative z-10">
        {/* Hero Section Header */}
        <div className="py-8 md:py-10 border-b border-white/10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#FF521D] mb-2 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF521D] animate-pulse" />
              Governed AI Workspace
            </div>
            <h1 className="font-sans text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              The Intelligent <span className="text-[#FF521D]">AI Resume Platform</span>
            </h1>
            <p className="mt-2 text-sm md:text-base text-[#A1A1AA] max-w-2xl font-sans leading-relaxed">
              Parse, organize, and optimize fullstack, frontend, and backend resumes with automated ATS keyword extraction and targeted employer matching.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <Link
              href="/tracker"
              className="inline-flex items-center gap-2 h-9 px-4 text-xs font-mono font-medium text-[#F5F5F5] bg-[#1E1E20] border border-white/12 rounded-lg hover:border-white/30 hover:bg-[#252528] transition-all"
            >
              <LayoutGrid className="w-4 h-4 text-[#4ED996]" />
              <span>{t('nav.applicationTracker') || 'Tracker Board'}</span>
            </Link>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 h-9 px-4 text-xs font-mono font-medium text-[#F5F5F5] bg-[#1E1E20] border border-white/12 rounded-lg hover:border-white/30 hover:bg-[#252528] transition-all"
            >
              <Settings className="w-4 h-4 text-[#A1A1AA]" />
              <span>{t('nav.settings') || 'Settings'}</span>
            </Link>
          </div>
        </div>

        {/* 4. Children Grid View */}
        <div className="flex-1 w-full">
          {children}
        </div>
      </div>
    </div>
  );
};
