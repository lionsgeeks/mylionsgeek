import React from 'react';
import { Search, RefreshCw, Users, AlertCircle } from 'lucide-react';

export const NoResults = ({ 
  searchText = '', 
  onClearSearch, 
  onRefresh, 
  type = 'search',
  message = null 
}) => {
  const getContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: <Search className="w-16 h-16 text-gray-400" />,
          title: searchText ? `No results for "${searchText}"` : 'No data available',
          subtitle: searchText ? 'Try adjusting your search terms' : 'No leaderboard data found',
          actions: [
            { label: 'Clear Search', onClick: onClearSearch, variant: 'secondary' },
            { label: 'Refresh Data', onClick: onRefresh, variant: 'primary' }
          ]
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-16 h-16 text-red-400" />,
          title: 'Something went wrong',
          subtitle: 'Unable to load leaderboard data',
          actions: [
            { label: 'Try Again', onClick: onRefresh, variant: 'primary' }
          ]
        };
      case 'empty':
        return {
          icon: <Users className="w-16 h-16 text-gray-400" />,
          title: 'No active coders',
          subtitle: 'Be the first to join the leaderboard!',
          actions: [
            { label: 'Refresh', onClick: onRefresh, variant: 'primary' }
          ]
        };
      default:
        return {
          icon: <Search className="w-16 h-16 text-gray-400" />,
          title: message || 'No results found',
          subtitle: 'Try adjusting your filters or search terms',
          actions: [
            { label: 'Clear Filters', onClick: onClearSearch, variant: 'secondary' },
            { label: 'Refresh', onClick: onRefresh, variant: 'primary' }
          ]
        };
    }
  };

  const content = getContent();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
          {content.icon}
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">!</span>
        </div>
      </div>
      
      <div className="text-center max-w-md">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {content.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {content.subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {content.actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                action.variant === 'primary'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
