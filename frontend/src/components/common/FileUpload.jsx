import React, { useRef } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

export default function FileUpload({ onFileSelect, accept, label, description }) {
  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 cursor-pointer transition-colors"
    >
      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm font-medium text-gray-900">{label || 'Click to upload'}</p>
      {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleChange}
      />
    </div>
  );
}