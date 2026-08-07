import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputPasswordProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const InputPassword = forwardRef<HTMLInputElement, InputPasswordProps>(
  ({ className = '', label, error, fullWidth = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`block ${fullWidth ? 'w-full' : ''} rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-12 text-sm text-gray-900 transition-colors focus:border-primary-green focus:outline-none focus:ring-1 focus:ring-primary-green disabled:bg-gray-50 disabled:text-gray-500 ${
              error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
            } ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
InputPassword.displayName = 'InputPassword';
