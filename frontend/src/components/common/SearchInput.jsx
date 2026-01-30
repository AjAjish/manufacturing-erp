import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input pl-10"
        placeholder={placeholder}
      />
    </div>
  );
}