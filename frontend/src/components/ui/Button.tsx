import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-accent-contrast border border-accent hover:bg-accent-hover hover:border-accent-hover',
  secondary: 'bg-surface text-ink border border-line hover:border-accent hover:text-accent',
  ghost: 'bg-transparent text-ink-muted border border-transparent hover:bg-surface-sunken hover:text-ink',
  danger: 'bg-surface text-danger border border-line hover:border-danger hover:bg-danger-soft',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
};

const BASE =
  'inline-flex items-center justify-center rounded-sm font-medium transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  active?: boolean;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  active = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const style = active && variant !== 'primary' ? VARIANTS.primary : VARIANTS[variant];
  return (
    <button type="button" className={`${BASE} ${SIZES[size]} ${style} ${className}`} {...rest}>
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  active?: boolean;
  size?: Size;
}

export function IconButton({
  label,
  children,
  active = false,
  size = 'md',
  className = '',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={rest.onClick ? active : undefined}
      className={`inline-flex items-center justify-center rounded-sm transition-colors duration-150 ${
        size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
      } ${
        active ? 'bg-accent-soft text-accent' : 'text-ink-muted hover:bg-surface-sunken hover:text-accent'
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
