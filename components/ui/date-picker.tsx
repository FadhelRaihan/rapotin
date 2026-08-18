'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange?: (date: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
}

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'Pilih tanggal...',
  error,
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current selected date or fallback to today
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const initialYear = selectedDate ? selectedDate.getFullYear() : new Date().getFullYear();
  const initialMonth = selectedDate ? selectedDate.getMonth() : new Date().getMonth();

  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  // Close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const monthStr = String(viewMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const formatted = `${viewYear}-${monthStr}-${dayStr}`;

    if (onChange) {
      onChange(formatted);
    }
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const monthStr = String(today.getMonth() + 1).padStart(2, '0');
    const dayStr = String(today.getDate()).padStart(2, '0');
    const formatted = `${year}-${monthStr}-${dayStr}`;

    setViewYear(year);
    setViewMonth(today.getMonth());
    if (onChange) {
      onChange(formatted);
    }
    setIsOpen(false);
  };

  // Days in month calculation
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // Formatting display text
  const formatDisplay = (dateObj: Date | null) => {
    if (!dateObj || isNaN(dateObj.getTime())) return placeholder;
    const d = dateObj.getDate();
    const m = MONTH_NAMES_ID[dateObj.getMonth()];
    const y = dateObj.getFullYear();
    return `${d} ${m} ${y}`;
  };

  const today = new Date();
  const isToday = (day: number) =>
    today.getDate() === day &&
    today.getMonth() === viewMonth &&
    today.getFullYear() === viewYear;

  const isSelected = (day: number) =>
    selectedDate &&
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getFullYear() === viewYear;

  return (
    <div className="w-full flex flex-col gap-1.5 relative" ref={containerRef}>
      {label && (
        <label className="text-sm font-bold text-slate-700">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all cursor-pointer',
          error && 'border-rose-500 focus:ring-rose-500',
          className
        )}
      >
        <span className={cn(selectedDate ? 'text-slate-900 font-medium' : 'text-slate-500 font-normal')}>
          {formatDisplay(selectedDate)}
        </span>
        <CalendarIcon className="h-4 w-4 text-[#7C3AED] opacity-90" />
      </button>

      {error && <span className="text-sm text-rose-600 font-semibold">{error}</span>}

      {/* Floating Custom Calendar Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-80 rounded-2xl border border-slate-300 bg-white p-4 shadow-2xl animate-in fade-in-80 zoom-in-95 font-sans">
          {/* Calendar Header: Month & Navigation */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-[#F3E8FF] hover:text-[#5B21B6] text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-sm font-bold text-slate-900">
              {MONTH_NAMES_ID[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-[#F3E8FF] hover:text-[#5B21B6] text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
            {DAY_NAMES_ID.map((dayName) => (
              <span key={dayName}>{dayName}</span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {/* Empty slots for offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <span key={`empty-${idx}`} />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const selected = isSelected(dayNum);
              const todayCurrent = isToday(dayNum);

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={cn(
                    'h-9 w-9 rounded-xl flex items-center justify-center font-medium transition-all cursor-pointer mx-auto text-sm',
                    selected
                      ? 'bg-[#7C3AED] text-white font-bold shadow-md shadow-purple-500/20'
                      : todayCurrent
                      ? 'border-2 border-[#7C3AED] text-[#5B21B6] font-bold bg-[#F3E8FF]'
                      : 'hover:bg-[#F3E8FF] hover:text-[#5B21B6] text-slate-900'
                  )}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Quick Action Footer */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer"
            >
              Hari Ini
            </button>

            {value && (
              <button
                type="button"
                onClick={() => {
                  if (onChange) onChange('');
                  setIsOpen(false);
                }}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                Hapus Tanggal
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
