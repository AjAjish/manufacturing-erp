import React from 'react';

export default function Select({ label, options, value, onChange, placeholder, error, ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}