import React from 'react';

export const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 skeleton rounded"></div>
        <div className="w-8 h-6 skeleton rounded"></div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 skeleton rounded-full"></div>
        <div className="space-y-2">
          <div className="w-24 h-4 skeleton rounded"></div>
          <div className="w-16 h-3 skeleton rounded"></div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="w-16 h-6 skeleton rounded-full"></div>
    </td>
    <td className="px-6 py-4">
      <div className="w-16 h-6 skeleton rounded-full"></div>
    </td>

    <td className="px-6 py-4">
      <div className="w-20 h-6 skeleton rounded-full"></div>
    </td>
    <td className="px-6 py-4">
      <div className="w-16 h-6 skeleton rounded-full"></div>
    </td>
  </tr>
);


export const PodiumSkeleton = () => {
  // Podium order: 2nd (left), 1st (middle, tallest), 3rd (right) 
  const podiumHeights = { 1: "h-[220px]", 2: "h-[180px]", 3: "h-[140px]", };
  return (
    <div className="flex justify-center items-end gap-6 max-w-5xl mx-auto animate-pulse">
      {[2, 1, 3].map((rank, idx) => (<div key={idx} className="flex flex-col items-center cursor-default lg:hidden " >
        {/* Avatar placeholder */}
        <div className="w-20 h-20 rounded-full bg-gray-300 lg:hidden flex dark:bg-gray-700 mb-3" /> {/* Name placeholder */}
        <div className="w-24 h-4 rounded bg-gray-300 lg:hidden flex dark:bg-gray-700 mb-2" /> {/* Podium block */}
        <div className={`w-28 ${podiumHeights[rank]} bg-gray-200 lg:hidden flex dark:bg-gray-600 rounded-t-lg`} /> </div>
      ))}
      {[2, 1, 3].map((rank, idx) => (<div key={idx} className="lg:flex flex-col items-center cursor-default hidden " >
        {/* Avatar placeholder */}
        <div className={`w-72 ${podiumHeights[rank]} bg-gray-200  dark:bg-gray-600 rounded-lg`} /> </div>
      ))}
    </div>
  );
}


export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`}></div>
  );
};

export const LoadingOverlay = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 bg-alpha/20 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-white dark:bg-alpha rounded-xl p-8 shadow-2xl flex flex-col items-center gap-4">
      <LoadingSpinner size="xl" />
      <p className="text-gray-600 dark:text-gray-300 font-medium">{message}</p>
    </div>
  </div>
);
