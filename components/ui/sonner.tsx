'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      richColors
      expand
      toastOptions={{
        style: {
          fontSize: '14px',
          fontWeight: 600,
          borderRadius: '12px',
          padding: '14px 18px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        },
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-300 group-[.toaster]:shadow-lg font-sans',
          description: 'group-[.toast]:text-slate-600 font-medium text-xs',
          actionButton:
            'group-[.toast]:bg-slate-900 group-[.toast]:text-white font-bold text-xs',
          cancelButton:
            'group-[.toast]:bg-slate-100 group-[.toast]:text-slate-700 font-bold text-xs',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
