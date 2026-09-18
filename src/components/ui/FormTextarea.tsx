import React from 'react';

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className = '', error, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full p-3 bg-white border-2 ${
          error ? 'border-[#E73520]' : 'border-[#0A0A0A]'
        } text-[#0A0A0A] font-sans text-sm font-medium placeholder:text-[#888888] placeholder:font-normal focus:outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] focus:shadow-[2px_2px_0_#E73520] transition-all disabled:opacity-50 disabled:bg-[#F7F5EF] ${className}`}
        {...props}
      />
    );
  }
);

FormTextarea.displayName = 'FormTextarea';
