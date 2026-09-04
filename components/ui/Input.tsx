import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: {
    input: 'rounded-lg px-3 py-2 text-xs',
    label: 'text-xs font-semibold mb-1',
  },
  md: {
    input: 'rounded-xl px-4 py-2.5 text-sm',
    label: 'text-sm font-semibold mb-1.5',
  },
  lg: {
    input: 'rounded-xl px-4 py-3 text-base',
    label: 'text-sm font-semibold mb-1.5',
  },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, fullWidth = true, inputSize = 'md', ...props }, ref) => {
    const size = sizeClasses[inputSize] || sizeClasses.md;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className={`block font-semibold text-gray-700 ${size.label}`}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`block ${fullWidth ? 'w-full' : ''} border border-gray-300 bg-white text-gray-900 transition-colors focus:border-primary-green focus:outline-none focus:ring-1 focus:ring-primary-green disabled:bg-gray-50 disabled:text-gray-500 ${
            size.input
          } ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-gray-400">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, helperText, fullWidth = true, inputSize = 'md', ...props }, ref) => {
    const size = sizeClasses[inputSize] || sizeClasses.md;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className={`block font-semibold text-gray-700 ${size.label}`}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`block ${fullWidth ? 'w-full' : ''} border border-gray-300 bg-white text-gray-900 transition-colors focus:border-primary-green focus:outline-none focus:ring-1 focus:ring-primary-green disabled:bg-gray-50 disabled:text-gray-500 min-h-[90px] ${
            size.input
          } ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-gray-400">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
  options?: { value: string; label: string; disabled?: boolean }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, helperText, fullWidth = true, inputSize = 'md', options, children, ...props }, ref) => {
    const size = sizeClasses[inputSize] || sizeClasses.md;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className={`block font-semibold text-gray-700 ${size.label}`}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`block ${fullWidth ? 'w-full' : ''} border border-gray-300 bg-white text-gray-900 transition-colors focus:border-primary-green focus:outline-none focus:ring-1 focus:ring-primary-green disabled:bg-gray-50 disabled:text-gray-500 appearance-none ${
            size.input
          } ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
          } ${className}`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem',
          }}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-gray-400">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
