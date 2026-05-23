/**
 * ALERT.JSX - Alert Message Component
 * Displays styled alert messages with different types
 * 
 * @component Alert
 */

import React from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';

const Alert = ({ type, message, onClose }) => {
  // Configuration for different alert types
  const config = {
    success: {
      icon: FaCheckCircle,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
    },
    error: {
      icon: FaTimesCircle,
      bgColor: 'bg-red-500',
      textColor: 'text-white',
    },
    warning: {
      icon: FaExclamationCircle,
      bgColor: 'bg-yellow-500',
      textColor: 'text-white',
    },
    info: {
      icon: FaInfoCircle,
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
    },
  };

  const { icon: Icon, bgColor, textColor } = config[type] || config.info;

  return (
    <div className={`${bgColor} ${textColor} p-4 rounded-lg mb-4 flex items-center justify-between`}>
      <div className="flex items-center space-x-3">
        <Icon className="text-xl" />
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="hover:opacity-80">
          <FaTimesCircle />
        </button>
      )}
    </div>
  );
};

export default Alert;