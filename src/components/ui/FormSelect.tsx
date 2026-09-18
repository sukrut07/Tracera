import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className = '', error, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={`w-full h-11 pl-3.5 pr-9 bg-white border-2 ${
            error ? 'border-[#E73520]' : 'border-[#0A0A0A]'
          } text-[#0A0A0A] font-sans text-sm font-medium focus:outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] focus:shadow-[2px_2px_0_#E73520] transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:bg-[#F7F5EF] ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#0A0A0A]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';
