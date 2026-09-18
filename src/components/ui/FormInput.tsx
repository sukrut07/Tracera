import React from 'react';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full h-11 px-3.5 bg-white border-2 ${
          error ? 'border-[#E73520]' : 'border-[#0A0A0A]'
        } text-[#0A0A0A] font-sans text-sm font-medium placeholder:text-[#888888] placeholder:font-normal focus:outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] focus:shadow-[2px_2px_0_#E73520] transition-all disabled:opacity-50 disabled:bg-[#F7F5EF] ${className}`}
        {...props}
      />
    );
  }
);

FormInput.displayName = 'FormInput';
