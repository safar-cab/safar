import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">{icon}</span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-12 bg-neutral-50 border rounded-lg text-neutral-900 placeholder:text-neutral-400 outline-none transition-all',
            icon ? 'pl-10 pr-4' : 'px-4',
            error
              ? 'border-error-500 focus:ring-2 focus:ring-error-100'
              : 'border-neutral-200 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-error-600 mt-1">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';
