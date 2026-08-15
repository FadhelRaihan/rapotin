'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Finish loading animation whenever route changes
    setIsNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.href && target.href.startsWith(window.location.origin)) {
        const targetUrl = new URL(target.href);
        // Only trigger loading bar if navigating to a different pathname/page
        if (targetUrl.pathname !== window.location.pathname) {
          setIsNavigating(true);
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-[#F3E8FF] overflow-hidden pointer-events-none">
      <div className="h-full bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#6D28D9] w-full animate-[loading-bar_1.2s_ease-in-out_infinite]" />
    </div>
  );
}
