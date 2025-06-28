import { forwardRef } from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { A11yAttributes } from '@/types/index';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center',
    'font-medium text-sm',
    'rounded-md',
    'border border-transparent',
    'transition-all duration-200',
    'focus-ring',
    'disabled:opacity-50 disabled:pointer-events-none',
    'select-none',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-primary-600 text-white',
          'hover:bg-primary-700',
          'active:bg-primary-800',
        ],
        destructive: [
          'bg-red-600 text-white',
          'hover:bg-red-700',
          'active:bg-red-800',
        ],
        outline: [
          'border-gray-300 text-gray-700',
          'bg-white',
          'hover:bg-gray-50',
          'active:bg-gray-100',
        ],
        secondary: [
          'bg-gray-100 text-gray-900',
          'hover:bg-gray-200',
          'active:bg-gray-300',
        ],
        ghost: [
          'text-gray-700',
          'hover:bg-gray-100',
          'active:bg-gray-200',
        ],
        link: [
          'text-primary-600 underline-offset-4',
          'hover:underline',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants>,
    A11yAttributes {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        type={type}
        aria-disabled={isDisabled}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <svg
            className="-ml-1 mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* Left icon */}
        {leftIcon && !loading && (
          <span className="-ml-1 mr-2 flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {/* Button content */}
        <span className={cn(loading && 'opacity-50')}>{children}</span>

        {/* Right icon */}
        {rightIcon && !loading && (
          <span className="ml-2 -mr-1 flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };