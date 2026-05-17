import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

interface StepIndicatorProps {
  steps: string[];
  current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between px-2 mb-6">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < current;
        const isActive = stepNum === current;

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
                  isCompleted && 'bg-success-500 text-white',
                  isActive && 'bg-primary-600 text-white shadow-sm',
                  !isCompleted && !isActive && 'bg-neutral-200 text-neutral-500',
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              <span className={cn(
                'text-[10px] mt-1 font-medium text-center w-14',
                isActive ? 'text-primary-600' : 'text-neutral-400',
              )}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                'h-0.5 flex-1 mx-1 mt-[-14px]',
                isCompleted ? 'bg-success-500' : 'bg-neutral-200',
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
