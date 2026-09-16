'use client';

import { SwissGrid } from '@/components/home/swiss-grid';
import { ResumeUploadDialog } from '@/components/dashboard/resume-upload-dialog';
import { MasterResumeChoiceDialog } from '@/components/dashboard/master-resume-choice-dialog';
import { useState, useEffect, useCallback, useRef, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';

// Optimized Imports for Performance (No Barrel Imports)
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Settings from 'lucide-react/dist/esm/icons/settings';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';

import {
  fetchResume,
  fetchResumeList,
  deleteResume,
  retryProcessing,
  fetchJobDescription,
  type ResumeListItem,
} from '@/lib/api/resume';
import { useStatusCache } from '@/lib/context/status-cache';
import { hasMeaningfulResumeContent } from '@/lib/utils/resume-content';

type ProcessingStatus = 'pending' | 'processing' | 'ready' | 'failed' | 'loading';

export default function DashboardPage() {
  const { t, locale } = useTranslations();
  const [masterResumeId, setMasterResumeId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('loading');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [listError, setListError] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [tailoredResumes, setTailoredResumes] = useState<ResumeListItem[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isMasterChoiceDialogOpen, setIsMasterChoiceDialogOpen] = useState(false);
  const router = useRouter();

  // Status cache for optimistic counter updates and LLM status check
  const {
    status: systemStatus,
    isLoading: statusLoading,
    incrementResumes,
    decrementResumes,
    setHasMasterResume,
  } = useStatusCache();

  // Request id guard for concurrent loadTailoredResumes invocations
  const loadRequestIdRef = useRef(0);
  const statusRequestIdRef = useRef(0);
  const retryMasterRef = useRef<string | null>(null);
  const pollAttemptsRef = useRef(0);
  const [statusRevision, setStatusRevision] = useState(0);
  const activeMasterIdRef = useRef<string | null>(null);
  const mountedRef = useRef(true);
  // Lightweight in-memory cache for job snippets to avoid N+1 refetches
  const jobSnippetCacheRef = useRef<Record<string, string>>({});

  // Check if LLM is configured (API key is set)
  const isLlmConfigured = !statusLoading && systemStatus?.llm_configured;

  const isTailorEnabled =
    Boolean(masterResumeId) && processingStatus === 'ready' && isLlmConfigured;

  const formatDate = (value: string) => {
    if (!value) return t('common.unknown');
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t('common.unknown');

    // Intl resolves plain language tags itself; the old ternary silently sent
    // ko/fr/pt to en-US. Every other call site already passes `locale` directly.
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const adoptMasterResume = useCallback((resumeId: string | null) => {
    if (activeMasterIdRef.current !== resumeId) {
      statusRequestIdRef.current += 1;
      retryMasterRef.current = null;
      pollAttemptsRef.current = 0;
      setIsRetrying(false);
    }
    activeMasterIdRef.current = resumeId;
    setMasterResumeId(resumeId);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const checkResumeStatus = useCallback(
    async (resumeId: string, background = false) => {
      if (
        !mountedRef.current ||
        activeMasterIdRef.current !== resumeId ||
        retryMasterRef.current === resumeId
      )
        return;
      if (!background) pollAttemptsRef.current = 0;
      const requestId = ++statusRequestIdRef.current;
      const isCurrent = () =>
        mountedRef.current &&
        requestId === statusRequestIdRef.current &&
        activeMasterIdRef.current === resumeId;
      try {
        if (!background) setProcessingStatus('loading');
        const data = await fetchResume(resumeId);
        if (!isCurrent()) return;
        const savedStatus = data.raw_resume?.processing_status || 'pending';
        // Older backend versions accepted `{}` as a valid ResumeData object.
        // Surface that legacy state as failed so users can retry it safely.
        const status =
          savedStatus === 'ready' && !hasMeaningfulResumeContent(data.processed_resume)
            ? 'failed'
            : savedStatus;
        setProcessingStatus(status as ProcessingStatus);
      } catch (err: unknown) {
        if (!isCurrent()) return;
        console.error('Failed to check resume status:', err);
        // If resume not found (404), clear the stale localStorage
        if (err instanceof Error && err.message.includes('404')) {
          localStorage.removeItem('master_resume_id');
          adoptMasterResume(null);
          return;
        }
        setProcessingStatus('failed');
      } finally {
        if (isCurrent()) setStatusRevision((version) => version + 1);
      }
    },
    [adoptMasterResume]
  );

  useEffect(() => {
    const storedId = localStorage.getItem('master_resume_id');
    if (storedId) {
      adoptMasterResume(storedId);
      checkResumeStatus(storedId);
    }
  }, [adoptMasterResume, checkResumeStatus]);

  // A bounded backoff preserves the processing label and never overlaps requests.
  // Focus or an explicit refresh starts a fresh observation window.
  useEffect(() => {
    if (
      !masterResumeId ||
      isRetrying ||
      !['pending', 'processing'].includes(processingStatus) ||
      pollAttemptsRef.current >= 12
    )
      return;
    const requestId = statusRequestIdRef.current;
    const delay = Math.min(30_000, 3_000 * 2 ** pollAttemptsRef.current);
    const timer = window.setTimeout(() => {
      if (requestId !== statusRequestIdRef.current || document.hidden) return;
      pollAttemptsRef.current += 1;
      void checkResumeStatus(masterResumeId, true);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [masterResumeId, processingStatus, isRetrying, statusRevision, checkResumeStatus]);

  const loadTailoredResumes = useCallback(async () => {
    const requestId = ++loadRequestIdRef.current;
    const isCurrent = () => mountedRef.current && requestId === loadRequestIdRef.current;
    try {
      setListError(false);
      const data = await fetchResumeList(true);
      if (!isCurrent()) return;

      // Sort by latest updated/created timestamp descending
      data.sort((a, b) => {
        const timeA = new Date(a.updated_at || a.created_at).getTime();
        const timeB = new Date(b.updated_at || b.created_at).getTime();
        return timeB - timeA;
      });

      const masterFromList = data.find((r) => r.is_master);
      const storedId = localStorage.getItem('master_resume_id');
      const resolvedMasterId = masterFromList?.resume_id || storedId;

      if (resolvedMasterId) {
        localStorage.setItem('master_resume_id', resolvedMasterId);
        adoptMasterResume(resolvedMasterId);
        checkResumeStatus(resolvedMasterId);
        setHasMasterResume(true);
      } else {
        localStorage.removeItem('master_resume_id');
        adoptMasterResume(null);
        setHasMasterResume(false);
      }

      setTailoredResumes(data);

      // Only fetch job descriptions for resumes that are actually tailored
      // (identified by having a non-null parent_id). This avoids N+1 calls
      // for untailored resumes.
      const tailoredWithParent = data.filter((r) => r.parent_id);

      // Fetch job description snippets for tailored resumes in parallel and attach to state
      // Use a small in-memory cache to avoid re-fetching the same snippet repeatedly.
      const jobSnippets: Record<string, string> = {};
      await Promise.all(
        tailoredWithParent.map(async (r) => {
          // Use cached snippet when available
          if (jobSnippetCacheRef.current[r.resume_id]) {
            jobSnippets[r.resume_id] = jobSnippetCacheRef.current[r.resume_id];
            return;
          }
          try {
            const jd = await fetchJobDescription(r.resume_id);
            const snippet = (jd?.content || '').slice(0, 80);
            if (isCurrent()) jobSnippetCacheRef.current[r.resume_id] = snippet;
            jobSnippets[r.resume_id] = snippet;
          } catch {
            // ignore missing job descriptions and cache empty result
            if (isCurrent()) jobSnippetCacheRef.current[r.resume_id] = '';
            jobSnippets[r.resume_id] = '';
          }
        })
      );

      // Only apply results if this invocation is the latest (prevents stale overwrite)
      if (isCurrent()) {
        setTailoredResumes((prev) =>
          prev.map((r) => ({ ...r, jobSnippet: jobSnippets[r.resume_id] || '' }))
        );
      }
    } catch (err) {
      if (!isCurrent()) return;
      console.error('Failed to load tailored resumes:', err);
      setListError(true);
    }
  }, []);

  useEffect(() => {
    loadTailoredResumes();
  }, [loadTailoredResumes]);

  // Refresh list when window gains focus (e.g., returning from viewer after delete)
  useEffect(() => {
    const handleFocus = () => {
      loadTailoredResumes();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadTailoredResumes, checkResumeStatus]);

  const handleUploadComplete = (resumeId: string) => {
    setIsUploadDialogOpen(false);
    loadRequestIdRef.current += 1;
    void loadTailoredResumes();
    localStorage.setItem('master_resume_id', resumeId);
    adoptMasterResume(resumeId);
    // Check status after upload completes
    checkResumeStatus(resumeId);
    // Update cached counters
    incrementResumes();
    setHasMasterResume(true);
  };

  const handleChooseUpload = () => {
    setIsMasterChoiceDialogOpen(false);
    setIsUploadDialogOpen(true);
  };

  const handleChooseWizard = () => {
    setIsMasterChoiceDialogOpen(false);
    router.push('/resume-wizard');
  };

  const handleInitializeMasterKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsMasterChoiceDialogOpen(true);
    }
  };

  const handleRetryProcessing = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!masterResumeId || retryMasterRef.current === masterResumeId) return;
    const resumeId = masterResumeId;
    retryMasterRef.current = resumeId;
    const requestId = ++statusRequestIdRef.current;
    const isCurrent = () =>
      mountedRef.current &&
      requestId === statusRequestIdRef.current &&
      activeMasterIdRef.current === resumeId;
    setIsRetrying(true);
    setProcessingStatus('loading');
    try {
      const result = await retryProcessing(resumeId);
      if (!isCurrent()) return;
      if (result.processing_status === 'ready') {
        setProcessingStatus('ready');
      } else if (
        result.processing_status === 'processing' ||
        result.processing_status === 'pending'
      ) {
        pollAttemptsRef.current = 0;
        setProcessingStatus(result.processing_status);
      } else {
        setProcessingStatus('failed');
      }
    } catch (err) {
      if (!isCurrent()) return;
      console.error('Retry processing failed:', err);
      if (err instanceof Error && err.message.includes('status 404')) {
        localStorage.removeItem('master_resume_id');
        adoptMasterResume(null);
        setHasMasterResume(false);
        return;
      }
      setProcessingStatus('failed');
    } finally {
      if (isCurrent()) {
        retryMasterRef.current = null;
        setIsRetrying(false);
      }
    }
  };

  const handleDeleteAndReupload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDeleteAndReupload = async () => {
    if (!masterResumeId) return;
    const resumeId = masterResumeId;
    loadRequestIdRef.current += 1;
    try {
      setShowDeleteDialog(false);
      setDeleteError(false);
      await deleteResume(resumeId);
      if (!mountedRef.current || activeMasterIdRef.current !== resumeId) return;
      decrementResumes();
      setHasMasterResume(false);
      localStorage.removeItem('master_resume_id');
      adoptMasterResume(null);
      setProcessingStatus('loading');
      setIsUploadDialogOpen(true);
      await loadTailoredResumes();
    } catch (err) {
      if (!mountedRef.current || activeMasterIdRef.current !== resumeId) return;
      console.error('Failed to delete resume:', err);
      setShowDeleteDialog(false);
      setDeleteError(true);
    }
  };

  const getStatusDisplay = () => {
    switch (processingStatus) {
      case 'loading':
        return {
          text: t('dashboard.status.checking'),
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          color: 'text-steel-grey',
        };
      case 'processing':
        return {
          text: t('dashboard.status.processing'),
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          color: 'text-blue-700',
        };
      case 'ready':
        return { text: t('dashboard.status.ready'), icon: null, color: 'text-green-700' };
      case 'failed':
        return {
          text: t('dashboard.status.failed'),
          icon: <AlertCircle className="w-3 h-3" />,
          color: 'text-red-600',
        };
      default:
        return { text: t('dashboard.status.pending'), icon: null, color: 'text-steel-grey' };
    }
  };

  const getMonogram = (title: string): string => {
    const words = title.split(/\s+/).filter((w) => /^[a-zA-Z]/.test(w));
    return words
      .slice(0, 3)
      .map((w) => w.charAt(0).toUpperCase())
      .join('');
  };

  // Muted palette that complements the #F0F0E8 canvas
  const cardPalette = [
    { bg: '#1D4ED8', fg: '#FFFFFF' }, // Hyper Blue
    { bg: '#15803D', fg: '#FFFFFF' }, // Signal Green
    { bg: '#000000', fg: '#FFFFFF' }, // Ink
    { bg: '#92400E', fg: '#FFFFFF' }, // Warm Brown
    { bg: '#7C3AED', fg: '#FFFFFF' }, // Violet
    { bg: '#0E7490', fg: '#FFFFFF' }, // Teal
    { bg: '#B91C1C', fg: '#FFFFFF' }, // Deep Red
    { bg: '#4338CA', fg: '#FFFFFF' }, // Indigo
  ];

  const hashTitle = (title: string): number => {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = (hash << 5) - hash + title.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const totalCards = 1 + tailoredResumes.length + 1;
  const fillerCount = Math.max(0, (5 - (totalCards % 5)) % 5);
  const extraFillerCount = 5;
  // Use Tailwind classes for fillers now that we have them in config or use specific hex if needed
  // Using the hex values from before to maintain exact look, or we could map them to variants
  const fillerPalette = ['bg-secondary', 'bg-[#D8D8D2]', 'bg-[#CFCFC7]', 'bg-[#E0E0D8]'];

  const listErrorAlert = listError ? (
    <div
      role="alert"
      className="m-6 rounded-none border-2 border-red-600 bg-red-100 p-6 shadow-sw-default"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <div>
          <p className="font-mono text-sm font-bold uppercase text-red-600">
            {t('dashboard.errors.loadFailed')}
          </p>
          <Button className="mt-4" variant="outline" onClick={loadTailoredResumes}>
            <RefreshCw className="h-4 w-4" />
            {t('common.retry')}
          </Button>
        </div>
      </div>
    </div>
  ) : null;
  if (listError && tailoredResumes.length === 0) return listErrorAlert;

  return (
    <div className="space-y-6">
      {listErrorAlert}
      {/* Configuration Warning Banner */}
      {masterResumeId && !isLlmConfigured && !statusLoading && (
        <div className="border-2 border-warning bg-amber-50 p-4 shadow-sw-default mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <div>
              <p className="font-mono text-sm font-bold uppercase tracking-wider text-amber-800">
                {t('dashboard.llmNotConfiguredTitle')}
              </p>
              <p className="font-mono text-xs text-amber-700 mt-0.5">
                {t('dashboard.llmNotConfiguredMessage')}
              </p>
            </div>
          </div>
          <Link href="/settings">
            <Button variant="outline" size="sm" className="border-warning text-amber-700">
              <Settings className="w-4 h-4 mr-2" />
              {t('nav.settings')}
            </Button>
          </Link>
        </div>
      )}

      <SwissGrid>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 w-full auto-rows-[200px]">
          {/* 1. Permanent Upload / Initialize Master Resume Card at Index 0 */}
          {!isLlmConfigured && !statusLoading ? (
            <Link href="/settings" className="block w-full h-[200px]">
              <Card
                variant="interactive"
                className="w-full h-[200px] aspect-square border-dashed border-amber-500/30 bg-[#161618] hover:border-amber-500/60 p-4 flex flex-col justify-between"
              >
                <div className="flex-1 flex flex-col justify-between">
                  <div className="w-9 h-9 rounded-lg border border-amber-500/20 bg-amber-500/10 flex items-center justify-center mb-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <CardTitle className="text-sm uppercase text-amber-400 mb-1">
                      {t('dashboard.setupRequiredTitle')}
                    </CardTitle>
                    <CardDescription className="text-amber-200/70 text-[11px] line-clamp-2">
                      {t('dashboard.setupRequiredMessage')}
                    </CardDescription>
                    <div className="flex items-center gap-1.5 mt-2 text-amber-400 group-hover:text-amber-300">
                      <Settings className="w-3.5 h-3.5" />
                      <span className="font-mono text-[10px] font-bold uppercase">
                        {t('nav.goToSettings')}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ) : (
            <Card
              variant="interactive"
              className="w-full h-[200px] aspect-square bg-[#161618] border border-white/10 hover:border-[#FF521D]/60 hover:bg-[#1C1C1E] p-4 flex flex-col justify-between"
              role="button"
              tabIndex={0}
              aria-label={t('dashboard.initializeMasterResume')}
              onClick={() => setIsMasterChoiceDialogOpen(true)}
              onKeyDown={handleInitializeMasterKeyDown}
            >
              <div className="flex-1 flex flex-col justify-between pointer-events-none">
                <div className="w-9 h-9 rounded-lg bg-[#FF521D]/10 border border-[#FF521D]/30 text-[#FF521D] flex items-center justify-center mb-2">
                  <span className="text-xl font-mono leading-none">+</span>
                </div>
                <div>
                  <CardTitle className="text-sm normal-case font-bold text-white leading-tight">
                    {t('dashboard.initializeMasterResume')}
                  </CardTitle>
                  <CardDescription className="mt-1 text-[#A1A1AA] text-[10px] font-mono">
                    {'// '}
                    {t('dashboard.initializeSequence')}
                  </CardDescription>
                </div>
              </div>
            </Card>
          )}

          {/* 2. All Resumes (Master and Tailored) */}
          {tailoredResumes.map((resume) => {
            const title =
              resume.title ||
              resume.jobSnippet ||
              resume.filename ||
              (resume.is_master ? t('dashboard.masterResume') : t('dashboard.tailoredResume'));
            const isMaster = resume.is_master;
            const isCurrentMaster = resume.resume_id === masterResumeId;

            return (
              <Card
                key={resume.resume_id}
                variant="interactive"
                className={`w-full h-[200px] aspect-square bg-[#161618] border ${
                  isMaster
                    ? 'border-[#4ED996]/30 hover:border-[#4ED996]/70'
                    : 'border-white/10 hover:border-[#FF521D]/50'
                } p-4 flex flex-col justify-between cursor-pointer group`}
                onClick={() => router.push(`/resumes/${resume.resume_id}`)}
              >
                <div className="flex-1 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-[9px] text-[#4ED996] px-1.5 py-0.5 rounded bg-[#4ED996]/10 border border-[#4ED996]/20 font-semibold uppercase">
                      {t('dashboard.statusLine', {
                        status: isCurrentMaster ? getStatusDisplay().text : resume.processing_status,
                      })}
                    </span>
                    {(isCurrentMaster &&
                      (processingStatus === 'failed' || processingStatus === 'processing')) ||
                    resume.processing_status === 'failed' ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-[#FF521D] hover:bg-[#FF521D]/10"
                        onClick={handleRetryProcessing}
                        disabled={isRetrying}
                        aria-label={t('dashboard.retryProcessing')}
                        title={t('dashboard.retryProcessing')}
                      >
                        {isRetrying ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                      </Button>
                    ) : null}
                  </div>

                  <CardTitle className="text-xs text-white group-hover:text-[#FF521D] transition-colors leading-tight">
                    <span className="block font-sans font-bold leading-tight w-full line-clamp-2">
                      {title}
                    </span>
                  </CardTitle>

                  <div className="mt-auto pt-2 flex flex-col gap-1">
                    {isCurrentMaster &&
                    (processingStatus === 'failed' || processingStatus === 'processing') ? (
                      <div
                        className="flex gap-1 pt-1 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] h-6 px-1.5 rounded border-white/20"
                          onClick={handleRetryProcessing}
                          disabled={isRetrying}
                        >
                          {isRetrying
                            ? t('dashboard.retryingProcessing')
                            : t('dashboard.retryProcessing')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] h-6 px-1.5 rounded border-red-500/40 text-red-400 hover:bg-red-500/10"
                          onClick={handleDeleteAndReupload}
                        >
                          {t('dashboard.deleteAndReupload')}
                        </Button>
                      </div>
                    ) : (
                      <CardDescription className="text-[10px] text-[#A1A1AA] font-mono">
                        {t('dashboard.edited', {
                          date: formatDate(resume.updated_at || resume.created_at),
                        })}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          {/* 3. Create Tailored Resume */}
          <Card className="w-full h-[200px] aspect-square bg-[#161618] border border-white/10 p-4 flex flex-col items-center justify-center text-center" variant="default">
            <div className="flex-1 flex flex-col items-center justify-center text-center h-full">
              <Button
                onClick={() => router.push('/tailor')}
                disabled={!isTailorEnabled}
                className="w-10 h-10 bg-[#FF521D] text-white rounded-xl shadow-[0_4px_14px_-3px_rgba(255,82,29,0.4)] hover:bg-[#E04515] hover:scale-105 transition-all p-0 flex items-center justify-center"
              >
                <Plus className="w-5 h-5" />
              </Button>
              <p className="text-xs font-mono mt-3 uppercase tracking-wider text-[#4ED996] font-semibold">
                {t('dashboard.createResume')}
              </p>
            </div>
          </Card>
        </div>

        <MasterResumeChoiceDialog
          open={isMasterChoiceDialogOpen}
          onOpenChange={setIsMasterChoiceDialogOpen}
          onChooseUpload={handleChooseUpload}
          onChooseWizard={handleChooseWizard}
        />
        <ResumeUploadDialog
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          onUploadComplete={handleUploadComplete}
          trigger={
            <button type="button" className="hidden" tabIndex={-1} aria-hidden="true" />
          }
        />

        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title={t('confirmations.deleteMasterResumeTitle')}
          description={t('confirmations.deleteMasterResumeDescription')}
          confirmLabel={t('dashboard.deleteAndReupload')}
          cancelLabel={t('confirmations.keepResumeCancelLabel')}
          onConfirm={confirmDeleteAndReupload}
          variant="danger"
        />

        <ConfirmDialog
          open={deleteError}
          onOpenChange={setDeleteError}
          title={t('common.error')}
          description={t('dashboard.errors.deleteFailed')}
          confirmLabel={t('common.retry')}
          cancelLabel={t('common.cancel')}
          onConfirm={confirmDeleteAndReupload}
          onCancel={() => setDeleteError(false)}
          variant="danger"
        />
      </SwissGrid>
    </div>
  );
}
