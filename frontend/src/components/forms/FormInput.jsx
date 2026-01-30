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
        type={type}
        className={clsx('input', error && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
        {...(register ? register(name) : {})}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}