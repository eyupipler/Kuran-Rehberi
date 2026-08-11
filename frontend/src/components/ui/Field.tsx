'use client';

import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { SearchIcon } from './icons';

const CONTROL =
  'w-full rounded-sm border border-line bg-surface text-ink placeholder:text-ink-faint transition-colors duration-150 focus:border-accent focus:outline-none';

const LABEL = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hideLabel?: boolean;
  children: ReactNode;
}

export function Select({ label, hideLabel = false, className = '', children, ...rest }: SelectProps) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : LABEL}>
        {label}
      </label>
      <select id={id} className={`${CONTROL} h-10 px-3 text-sm`} {...rest}>
        {children}
      </select>
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hideLabel?: boolean;
}

export function TextField({ label, hideLabel = false, className = '', ...rest }: TextFieldProps) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : LABEL}>
        {label}
      </label>
      <input id={id} type="text" className={`${CONTROL} h-10 px-3 text-sm`} {...rest} />
    </div>
  );
}

interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  /** Ana sayfa ve arama sayfasındaki büyük arama kutusu için 'lg'. */
  size?: 'md' | 'lg';
}

export function SearchField({ label, size = 'md', className = '', ...rest }: SearchFieldProps) {
  const id = useId();
  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <SearchIcon
        className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint ${
          size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
        }`}
      />
      <input
        id={id}
        type="search"
        className={`${CONTROL} ${size === 'lg' ? 'h-14 pl-11 pr-4 text-base' : 'h-10 pl-10 pr-3 text-sm'}`}
        {...rest}
      />
    </div>
  );
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="block text-xs text-ink-faint">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-sm border transition-colors duration-150 ${
          checked ? 'border-accent bg-accent' : 'border-line bg-surface-sunken'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-sm transition-transform duration-150 ${
            checked ? 'translate-x-6 bg-white' : 'translate-x-1 bg-line-strong'
          }`}
        />
      </button>
    </div>
  );
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: ReactNode; title?: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex divide-x divide-line rounded-sm border border-line"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          title={option.title}
          // Yalnızca ikon içeren seçeneklerde erişilebilir ad başlıktan gelir.
          aria-label={option.title}
          aria-pressed={value === option.value}
          className={`inline-flex h-10 items-center justify-center gap-1.5 px-3.5 text-xs font-medium transition-colors duration-150 first:rounded-l-sm last:rounded-r-sm ${
            value === option.value
              ? 'bg-accent text-accent-contrast'
              : 'bg-surface text-ink-muted hover:bg-surface-sunken hover:text-ink'
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
