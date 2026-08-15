'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  disabled?: boolean;
}

export function PinInput({ length = 6, onComplete, disabled = false }: PinInputProps) {
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
    <div className="flex gap-2.5 sm:gap-3 justify-center my-4">
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
            'w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono tabular-nums font-bold rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-[#111827] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all duration-200',
            digit && 'border-[#7C3AED] bg-[#F3E8FF] text-[#7C3AED] shadow-sm'
          )}
        />
      ))}
    </div>
  );
}
