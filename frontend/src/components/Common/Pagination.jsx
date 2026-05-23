/**
 * PAGINATION.JSX - Pagination Component
 * Handles page navigation for lists of songs/playlists
 * 
 * @component Pagination
 */

import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Don't show pagination if only one page
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition"
        aria-label="Previous page"
      >
        <FaChevronLeft size={16} />
      </button>
      
      {/* First Page and Ellipsis */}
      {getPageNumbers()[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition"
          >
            1
          </button>
          {getPageNumbers()[0] > 2 && <span className="text-gray-400">...</span>}
        </>
      )}
      
      {/* Page Numbers */}
      {getPageNumbers().map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-lg transition ${
            currentPage === page
              ? 'bg-green-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {page}
        </button>
      ))}
      
      {/* Last Page and Ellipsis */}
      {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
        <>
          {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
            <span className="text-gray-400">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition"
          >
            {totalPages}
          </button>
        </>
      )}
      