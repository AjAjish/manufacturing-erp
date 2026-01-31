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
        name={name}
        className={clsx('input', error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10 dark:focus:ring-red-500/20')}
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
      {error && <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}