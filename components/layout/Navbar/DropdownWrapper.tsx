'use client';

import { useEffect, useRef } from 'react';
import { X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface DropdownWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  position?: 'left' | 'right';
  width?: string;
  className?: string;
}

/**
 * Reusable Dropdown Wrapper Component
 * Handles:
 * - Positioning (left/right)
 * - Click outside to close
 * - Keyboard accessibility
 * - Animations
 */
export function DropdownWrapper({
  isOpen,
  onClose,
  trigger,
  children,
  position = 'right',
  width = 'w-[360px]',
  className,
}: DropdownWrapperProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      {trigger}

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-5 bg-white shadow-xl border border-gray-100 z-50 overflow-hidden animate-slide-down',
            position === 'left' ? 'left-0' : 'right-0',
            width,
            className
          )}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close dropdown"
          >
            <X size={18} />
          </button>

          {children}
        </div>
      )}
    </div>
  );
}

interface HoverDropdownProps {
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  position?: 'left' | 'right';
  width?: string;
}

/**
 * Hover Dropdown Wrapper for desktop navigation
 * Uses mouse events instead of click
 */
export function HoverDropdown({
  isOpen,
  onMouseEnter,
  onMouseLeave,
  trigger,
  children,
  position = 'left',
  width = 'w-[240px]',
}: HoverDropdownProps) {
  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {trigger}

      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-6 bg-white shadow-xl border border-zinc-100 z-50 overflow-hidden animate-slide-down ${
            position === 'right' ? 'right-0 left-auto' : ''
          } ${width}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
