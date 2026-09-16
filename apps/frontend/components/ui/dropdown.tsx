'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

export interface DropdownOption {
  id: string;
  label: string;
  description?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}: DropdownProps) {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Stable id wiring the trigger's aria-controls to the popup's id, and
  // the popup's role="menu" to its role="menuitem" children.
  const menuId = React.useId();

  const selectedOption = options.find((opt) => opt.id === value);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  return (
    <div className={`space-y-1 ${className}`} ref={containerRef}>
      {label && (
        <label className="font-mono text-xs font-bold uppercase tracking-wider text-ink-soft block">
          {label}
        </label>
      )}

      {description && <p className="text-sm text-ink-soft">{description}</p>}

      <div className="relative">
        {/* Trigger Button.
            aria-haspopup="menu" matches the actual popup semantics: options
            commit on click (not select-then-activate), which is a menu
            pattern, not listbox. aria-controls wires the trigger to the
            popup id so screen readers know they're linked. */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-controls={isOpen ? menuId : undefined}
          aria-label={label}
          className="w-full flex items-center justify-between border border-white/10 bg-[#1E1E20] px-4 py-3 font-mono text-xs text-[#F5F5F5] transition-colors rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex-1 text-left min-w-0">
            {selectedOption ? (
              <div>
                <div className="font-bold text-[#F5F5F5] truncate">{selectedOption.label}</div>
                {selectedOption.description && (
                  <div className="text-xs text-[#A1A1AA] mt-1 font-normal truncate">
                    {selectedOption.description}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-[#A1A1AA]">{t('common.selectOption')}</span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ml-2 shrink-0 text-[#A1A1AA] ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            id={menuId}
            role="menu"
            aria-label={label}
            className="absolute top-full left-0 right-0 mt-1 z-50 border border-white/10 bg-[#161618] shadow-2xl rounded-xl overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto p-1">
              {options.map((option) => (
                <React.Fragment key={option.id}>
                  <button
                    role="menuitemradio"
                    aria-checked={option.id === value}
                    onClick={() => handleSelect(option.id)}
                    className={`w-full px-3.5 py-2.5 text-left font-mono text-xs rounded-lg transition-colors ${
                      option.id === value
                        ? 'bg-[#FF521D] text-white font-bold'
                        : 'bg-transparent text-[#F5F5F5] hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-bold text-xs">{option.label}</div>
                        {option.description && (
                          <div className="text-[11px] mt-0.5 opacity-80">{option.description}</div>
                        )}
                      </div>
                      {option.id === value && <div className="text-lg font-bold mt-0.5">✓</div>}
                    </div>
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
