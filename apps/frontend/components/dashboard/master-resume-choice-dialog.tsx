'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/lib/i18n';
import Upload from 'lucide-react/dist/esm/icons/upload';
import Bot from 'lucide-react/dist/esm/icons/bot';

interface MasterResumeChoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChooseUpload: () => void;
  onChooseWizard: () => void;
}

export function MasterResumeChoiceDialog({
  open,
  onOpenChange,
  onChooseUpload,
  onChooseWizard,
}: MasterResumeChoiceDialogProps) {
  const { t } = useTranslations();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#161618] border border-white/12 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)] p-0 gap-0 rounded-xl text-[#F5F5F5]">
        <DialogHeader className="border-b border-white/10 bg-[#161618] p-6 text-left">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[#FF521D]">
            {t('resumeWizard.entry.kicker')}
          </p>
          <DialogTitle className="font-sans text-2xl font-bold tracking-tight text-white mt-1">
            {t('resumeWizard.entry.title')}
          </DialogTitle>
          <DialogDescription className="font-sans text-sm text-[#A1A1AA] mt-1">
            {t('resumeWizard.entry.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 bg-[#18181A] p-6 md:grid-cols-2">
          <section className="flex min-h-60 flex-col border border-white/10 bg-[#1E1E20] rounded-xl p-5 hover:border-[#FF521D]/40 transition-colors">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/12 bg-white/5 text-[#FF521D]">
              <Upload className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
              {t('resumeWizard.entry.upload.kicker')}
            </p>
            <h3 className="mt-1 font-sans text-xl font-bold leading-tight text-white">
              {t('resumeWizard.entry.upload.title')}
            </h3>
            <p className="mt-2 font-sans text-xs text-[#A1A1AA] leading-relaxed">
              {t('resumeWizard.entry.upload.description')}
            </p>
            <Button variant="outline" className="mt-auto w-full border-white/14 text-white hover:bg-white/10" onClick={onChooseUpload}>
              {t('resumeWizard.entry.upload.action')}
            </Button>
          </section>

          <section className="flex min-h-60 flex-col border border-white/10 bg-[#1E1E20] rounded-xl p-5 hover:border-[#4ED996]/40 transition-colors">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-[#4ED996]/30 bg-[#4ED996]/10 text-[#4ED996]">
              <Bot className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4ED996]">
              {t('resumeWizard.entry.wizard.kicker')}
            </p>
            <h3 className="mt-1 font-sans text-xl font-bold leading-tight text-white">
              {t('resumeWizard.entry.wizard.title')}
            </h3>
            <p className="mt-2 font-sans text-xs text-[#A1A1AA] leading-relaxed">
              {t('resumeWizard.entry.wizard.description')}
            </p>
            <Button className="mt-auto w-full bg-[#FF521D] hover:bg-[#E04515]" onClick={onChooseWizard}>
              {t('resumeWizard.entry.wizard.action')}
            </Button>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
