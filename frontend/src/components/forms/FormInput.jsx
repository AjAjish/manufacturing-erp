import React from 'react';
import clsx from 'clsx';

export default function FormInput({
  label,
  type = 'text',
  error,
  register,
  name,
  ...props
}) {
  return (
    <div>
      {label && (
        <label htmlFor={name} className="label">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        className={clsx('input', error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10 dark:focus:ring-red-500/20')}
        {...(register ? register(name) : {})}
        {...props}
      />
      {error && <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}