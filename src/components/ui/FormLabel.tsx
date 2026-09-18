import React from 'react';

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

export function FormLabel({ children, required, className = '', ...props }: FormLabelProps) {
  return (
    <label
      className={`block font-sans text-[11px] font-semibold uppercase tracking-[0.04em] text-[#0A0A0A] mb-1.5 ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-[#E73520] ml-1 font-bold">*</span>}
    </label>
  );
}
