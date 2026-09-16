'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';
import { Button } from './button';
import { useTranslations } from '@/lib/i18n';

/**
 * Swiss International Style Confirm Dialog Component
 *
 * A modal dialog for confirming user actions with semantic variants:
 * - danger: Destructive actions (delete, remove)
 * - warning: Caution actions (reset, overwrite)
 * - success: Positive confirmations
 * - default: Neutral confirmations
 */

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  errorMessage?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDisabled?: boolean;
  cancelDisabled?: boolean;
  variant?: 'danger' | 'warning' | 'success' | 'default';
  closeOnConfirm?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  errorMessage,
  confirmLabel,
  cancelLabel,
  confirmDisabled = false,
  cancelDisabled = false,
  variant = 'default',
  closeOnConfirm = true,
  onConfirm,
  onCancel,
  showCancelButton = true,
}) => {
  const { t } = useTranslations();
  const finalConfirmLabel = confirmLabel ?? t('common.confirm');
  const finalCancelLabel = cancelLabel ?? t('common.cancel');

  const handleConfirm = () => {
    if (confirmDisabled) return;
    onConfirm();
    if (closeOnConfirm) {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    if (cancelDisabled) return;
    onCancel?.();
    onOpenChange(false);
  };

  const variantStyles = {
    danger: {
      icon: (
        <div className="w-10 h-10 rounded-lg border border-red-500/30 bg-red-500/10 flex items-center justify-center shrink-0">
          <span className="text-red-400 text-lg font-bold font-mono">!</span>
        </div>
      ),
      buttonVariant: 'destructive' as const,
    },
    warning: {
      icon: (
        <div className="w-10 h-10 rounded-lg border border-[#FF521D]/30 bg-[#FF521D]/10 flex items-center justify-center shrink-0">
          <span className="text-[#FF521D] text-lg font-bold font-mono">!</span>
        </div>
      ),
      buttonVariant: 'warning' as const,
    },
    success: {
      icon: (
        <div className="w-10 h-10 rounded-lg border border-[#4ED996]/30 bg-[#4ED996]/10 flex items-center justify-center shrink-0">
          <span className="text-[#4ED996] text-lg font-bold font-mono">&#10003;</span>
        </div>
      ),
      buttonVariant: 'success' as const,
    },
    default: {
      icon: (
        <div className="w-10 h-10 rounded-lg border border-[#FF521D]/30 bg-[#FF521D]/10 flex items-center justify-center shrink-0">
          <span className="text-[#FF521D] text-lg font-bold font-mono">?</span>
        </div>
      ),
      buttonVariant: 'default' as const,
    },
  };

  const { icon, buttonVariant } = variantStyles[variant];

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && cancelDisabled) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-[425px] p-0 gap-0 bg-[#161618] border border-white/12 text-[#F5F5F5] rounded-xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)]">
        <DialogHeader className="p-6 pb-4 bg-[#161618]">
          <div className="flex items-start gap-4">
            {icon}
            <div className="min-w-0 flex-1">
              <DialogTitle className="font-sans text-xl font-bold tracking-tight text-white">
                {title}
              </DialogTitle>
              <DialogDescription className="font-sans text-xs text-[#A1A1AA] mt-2 max-h-60 overflow-y-auto whitespace-pre-wrap [overflow-wrap:anywhere] leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        {errorMessage && (
          <div className="px-6 pb-4">
            <div className="border border-red-500/20 bg-red-500/10 p-3 rounded-lg font-mono text-xs text-red-300 max-h-60 overflow-y-auto whitespace-pre-wrap [overflow-wrap:anywhere]">
              {errorMessage}
            </div>
          </div>
        )}
        <DialogFooter className="p-4 bg-[#161618] border-t border-white/10 flex flex-row justify-end gap-3">
          {showCancelButton && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={cancelDisabled}
              className="rounded-lg border-white/14 text-[#A1A1AA]"
            >
              {finalCancelLabel}
            </Button>
          )}
          <Button
            variant={buttonVariant}
            onClick={handleConfirm}
            className="rounded-lg"
            disabled={confirmDisabled}
          >
            {finalConfirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
