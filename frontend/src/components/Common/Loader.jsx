/**
 * LOADER.JSX - Loading Spinner Component
 * Shows a spinning animation while content is loading
 * 
 * @component Loader
 */

import React from 'react';

const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-gray-700 rounded-full"></div>
        {/* Spinning inner ring */}
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-green-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
    </div>
  );
};

export default Loader;