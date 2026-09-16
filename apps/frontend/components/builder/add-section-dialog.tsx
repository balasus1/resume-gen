'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, FileText, List, ListOrdered } from 'lucide-react';
import type { SectionType } from '@/components/dashboard/resume-component';
import { useTranslations } from '@/lib/i18n';

interface AddSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (displayName: string, sectionType: SectionType) => void;
}

type SelectableSectionType = Exclude<SectionType, 'personalInfo'>;

/**
 * AddSectionDialog Component
 *
 * Dialog for creating new custom sections.
 * Allows user to enter a name and select a section type.
 */
export const AddSectionDialog: React.FC<AddSectionDialogProps> = ({
  open,
  onOpenChange,
  onAdd,
}) => {
  const { t } = useTranslations();
  const [displayName, setDisplayName] = useState('');
  const [sectionType, setSectionType] = useState<SelectableSectionType>('text');

  const handleSubmit = () => {
    if (displayName.trim()) {
      onAdd(displayName.trim(), sectionType);
      setDisplayName('');
      setSectionType('text');
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && displayName.trim()) {
      handleSubmit();
    }
  };

  const sectionTypes: {
    type: SelectableSectionType;
    label: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      type: 'text',
      label: t('builder.customSections.sectionTypes.textBlockLabel'),
      icon: <FileText className="w-5 h-5" />,
      description: t('builder.customSections.sectionTypes.textBlockDescription'),
    },
    {
      type: 'itemList',
      label: t('builder.customSections.sectionTypes.itemListLabel'),
      icon: <ListOrdered className="w-5 h-5" />,
      description: t('builder.customSections.sectionTypes.itemListDescription'),
    },
    {
      type: 'stringList',
      label: t('builder.customSections.sectionTypes.stringListLabel'),
      icon: <List className="w-5 h-5" />,
      description: t('builder.customSections.sectionTypes.stringListDescription'),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 rounded-none bg-[#27272a] border border-white/10 text-white">
        <DialogHeader className="p-6 pb-4 border-b border-white/10">
          <DialogTitle className="font-serif text-xl font-bold uppercase tracking-tight text-white">
            {t('builder.customSections.dialogTitle')}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-zinc-400 mt-2">
            {t('builder.customSections.dialogDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Section Name */}
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-wider text-zinc-300">
              {t('builder.customSections.sectionNameLabel')}
            </Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('builder.customSections.sectionNamePlaceholder')}
              className="rounded-none border border-white/10 bg-[#1e1e20] text-white placeholder:text-zinc-500"
              autoFocus
            />
          </div>

          {/* Section Type */}
          <div className="space-y-3">
            <Label className="font-mono text-xs uppercase tracking-wider text-zinc-300">
              {t('builder.customSections.sectionTypeLabel')}
            </Label>
            <div className="space-y-2">
              {sectionTypes.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setSectionType(item.type)}
                  className={`w-full p-4 border text-left transition-colors ${
                    sectionType === item.type
                      ? 'border-blue-500 bg-blue-950/30 shadow-sm'
                      : 'border-white/10 bg-[#1e1e20] hover:border-white/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 border ${
                        sectionType === item.type
                          ? 'border-blue-500 bg-blue-950/40 text-blue-400'
                          : 'border-white/10 bg-[#27272a] text-zinc-300'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-sans font-medium text-sm text-white">{item.label}</div>
                      <div className="font-mono text-xs text-zinc-400 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                    {sectionType === item.type && (
                      <div className="w-4 h-4 border-2 border-blue-500 bg-blue-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 bg-[#1e1e20] border-t border-white/10 flex-row justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline" className="rounded-none border-white/10 text-zinc-300 hover:text-white hover:bg-[#27272a]">
              {t('common.cancel')}
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!displayName.trim()} className="rounded-none">
            <Plus className="w-4 h-4 mr-2" />
            {t('builder.addSection')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * AddSectionButton Component
 *
 * Button that triggers the AddSectionDialog.
 */
interface AddSectionButtonProps {
  onAdd: (displayName: string, sectionType: SectionType) => void;
}

export const AddSectionButton: React.FC<AddSectionButtonProps> = ({ onAdd }) => {
  const { t } = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full rounded-none border-dashed border-2 border-white/20 py-6 text-zinc-300 hover:text-white hover:bg-[#27272a] hover:border-white/40 transition-all"
      >
        <Plus className="w-5 h-5 mr-2" />
        {t('builder.customSections.addCustomSectionButton')}
      </Button>
      <AddSectionDialog open={open} onOpenChange={setOpen} onAdd={onAdd} />
    </>
  );
};
