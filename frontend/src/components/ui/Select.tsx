import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useDebounce } from '@/hooks/useDebounce';

interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  loading?: boolean;
  error?: string;
  className?: string;
  clearable?: boolean;
}

export const Select = memo(function Select({
  label,
  placeholder = 'Select...',
  options,
  value,
  onChange,
  searchable,
  onSearch,
  loading,
  error,
  className,
  clearable,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (onSearch && debouncedSearch !== undefined) {
      onSearch(debouncedSearch);
    }
  }, [debouncedSearch, onSearch]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node) &&
      triggerRef.current &&
      !triggerRef.current.contains(e.target as Node)
    ) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleClickOutside]);

  const filteredOptions =
    searchable && !onSearch
      ? options.filter(
          (o) =>
            o.label.toLowerCase().includes(search.toLowerCase()) ||
            o.sublabel?.toLowerCase().includes(search.toLowerCase()),
        )
      : options;

  const rect = triggerRef.current?.getBoundingClientRect();

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
      )}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full h-12 px-4 bg-neutral-50 border rounded-lg text-left flex items-center justify-between transition-all',
          error
            ? 'border-error-500'
            : open
              ? 'border-primary-500 ring-2 ring-primary-100 bg-white'
              : 'border-neutral-200',
        )}
      >
        <span className={cn('truncate', selected ? 'text-neutral-900' : 'text-neutral-400')}>
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {clearable && value && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 hover:bg-neutral-200 rounded"
            >
              <X className="w-3.5 h-3.5 text-neutral-400" />
            </span>
          )}
          <ChevronDown
            className={cn('w-4 h-4 text-neutral-400 transition-transform', open && 'rotate-180')}
          />
        </div>
      </button>
      {error && <p className="text-xs text-error-600 mt-1">{error}</p>}

      {open &&
        rect &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: rect.bottom + 4,
              left: rect.left,
              width: rect.width,
              zIndex: 9999,
            }}
            className="bg-white rounded-lg shadow-lg border border-neutral-200 overflow-hidden"
          >
            {searchable && (
              <div className="p-2 border-b border-neutral-100">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full h-9 pl-8 pr-3 bg-neutral-50 border border-neutral-200 rounded-md text-sm outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            )}
            <div className="max-h-60 overflow-y-auto py-1">
              {loading ? (
                <div className="px-3 py-4 text-center text-sm text-neutral-400">Loading...</div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-neutral-400">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      'w-full px-3 py-2.5 text-left flex items-center justify-between hover:bg-neutral-50 transition-colors',
                      option.value === value && 'bg-primary-50',
                    )}
                  >
                    <div>
                      <p
                        className={cn(
                          'text-sm',
                          option.value === value
                            ? 'text-primary-700 font-medium'
                            : 'text-neutral-700',
                        )}
                      >
                        {option.label}
                      </p>
                      {option.sublabel && (
                        <p className="text-xs text-neutral-400">{option.sublabel}</p>
                      )}
                    </div>
                    {option.value === value && (
                      <Check className="w-4 h-4 text-primary-600 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
});
