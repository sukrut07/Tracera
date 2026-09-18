import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans font-bold uppercase tracking-[0.04em] transition-all cursor-pointer user-select-none disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#0A0A0A]';

    const sizeStyles = {
      sm: 'text-xs h-9 px-3.5 gap-1.5',
      md: 'text-[13px] h-11 px-5 gap-2',
      lg: 'text-sm h-12 px-6 gap-2.5',
    };

    const variantStyles = {
      primary:
        'bg-[#0A0A0A] text-white shadow-[3px_3px_0_#0A0A0A] hover:bg-[#E73520] hover:shadow-[2px_2px_0_#0A0A0A] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
      secondary:
        'bg-white text-[#0A0A0A] shadow-[3px_3px_0_#0A0A0A] hover:bg-[#F7F5EF] hover:shadow-[2px_2px_0_#0A0A0A] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
      danger:
        'bg-[#E73520] text-white shadow-[3px_3px_0_#0A0A0A] hover:bg-[#D32814] hover:shadow-[2px_2px_0_#0A0A0A] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
      ghost:
        'border-transparent bg-transparent text-[#0A0A0A] hover:bg-[#EBE8DE] active:bg-[#E0DDD2]',
      outline:
        'bg-transparent text-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] hover:bg-[#F7F5EF]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
