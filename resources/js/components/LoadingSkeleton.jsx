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
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 skeleton rounded-full"></div>
        <div className="w-8 h-4 skeleton rounded"></div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="w-20 h-6 skeleton rounded-full"></div>
    </td>
    <td className="px-6 py-4">
      <div className="w-16 h-6 skeleton rounded-full"></div>
    </td>
  </tr>
);

export const PodiumSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[1, 2, 3].map((index) => (
      <div 
        key={index}
        className="relative p-6 rounded-xl shadow-lg animate-pulse podium-card"
      >
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 skeleton rounded"></div>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 skeleton rounded"></div>
          <div className="w-20 h-6 skeleton rounded"></div>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 skeleton rounded-full"></div>
          <div className="space-y-2">
            <div className="w-24 h-4 skeleton rounded"></div>
            <div className="w-16 h-3 skeleton rounded"></div>
          </div>
        </div>
        
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="w-16 h-3 skeleton rounded"></div>
              <div className="w-12 h-4 skeleton rounded"></div>
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <div className="w-16 h-3 skeleton rounded"></div>
            <div className="w-8 h-4 skeleton rounded"></div>
          </div>
          <div className="w-full skeleton rounded-full h-2"></div>
        </div>
      </div>
    ))}
  </div>
);

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
