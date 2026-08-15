import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Skeleton Header */}
      <div className="flex flex-col gap-2">
        <div className="h-4 w-32 bg-[#E5E7EB] rounded-md animate-pulse"></div>
        <div className="h-8 w-64 bg-[#E5E7EB] rounded-lg animate-pulse"></div>
        <div className="h-4 w-96 bg-[#E5E7EB] rounded-md animate-pulse"></div>
      </div>

      {/* Skeleton Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 border border-[#E5E7EB] bg-white rounded-xl shadow-xs flex items-center justify-between h-28 animate-pulse"
          >
            <div className="flex flex-col gap-2">
              <div className="h-3 w-20 bg-[#E5E7EB] rounded"></div>
              <div className="h-7 w-16 bg-[#E5E7EB] rounded-md"></div>
              <div className="h-3 w-24 bg-[#E5E7EB] rounded"></div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#F3E8FF]/60 flex items-center justify-center"></div>
          </div>
        ))}
      </div>

      {/* Skeleton Content Card */}
      <div className="p-6 border border-[#E5E7EB] bg-white rounded-xl shadow-xs flex flex-col gap-4 min-h-[350px]">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="h-5 w-48 bg-[#E5E7EB] rounded animate-pulse"></div>
          <div className="h-4 w-24 bg-[#E5E7EB] rounded animate-pulse"></div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
          <div className="w-10 h-10 border-3 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-[#7C3AED] tracking-wide animate-pulse">
            Memuat Data...
          </p>
        </div>
      </div>
    </div>
  );
}
