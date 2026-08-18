'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface PinInputProps {
  length?: number;
  label?: string;
  hint?: string;
  onComplete: (pin: string) => void;
  disabled?: boolean;
}

export function PinInput({ length = 6, label, hint, onComplete, disabled = false }: PinInputProps) {
  const [pin, setPin] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const newPin = [...pin];
    newPin[index] = val.substring(val.length - 1);
    setPin(newPin);

    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullPin = newPin.join('');
    if (fullPin.length === length && !newPin.includes('')) {
      onComplete(fullPin);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    const newPin = Array(length).fill('');
    for (let i = 0; i < pastedData.length; i++) {
      newPin[i] = pastedData[i];
    }
    setPin(newPin);

    if (pastedData.length === length) {
      onComplete(pastedData);
    } else {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {label && (
        <label className="text-sm font-bold text-slate-800 mb-1 text-center">
          {label}
        </label>
      )}
      {hint && (
        <p className="text-xs text-slate-600 font-medium mb-2 text-center">
          {hint}
        </p>
      )}
      <div className="flex gap-2.5 sm:gap-3.5 justify-center my-3">
        {pin.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(e, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            onPaste={handlePaste}
            className={cn(
              'w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-mono tabular-nums font-bold rounded-2xl border-2 border-slate-300 bg-white text-slate-900 shadow-md focus:outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/25 transition-all duration-200',
              digit && 'border-2 border-[#7C3AED] bg-[#F3E8FF] text-[#5B21B6] shadow-md scale-[1.03]'
            )}
          />
        ))}
      </div>
    </div>
  );
}
