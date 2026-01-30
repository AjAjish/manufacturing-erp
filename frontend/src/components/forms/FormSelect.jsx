import React from 'react';
import clsx from 'clsx';

export default function FormSelect({
  label,
  options,
  error,
  register,
  name,
  placeholder,
  ...props
}) {
  return (
    <div>
      {label && (
        <label htmlFor={name} className="label">
          {label}
        </label>
      )}
      <select
        id={name}
        className={clsx('input', error && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
        {...(register ? register(name) : {})}
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