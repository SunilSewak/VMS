import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ children, variant = 'primary', size = 'md', className = "", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-vms-primary text-white hover:bg-vms-primary-dark shadow-md focus:ring-vms-primary",
    secondary: "bg-vms-accent text-vms-primary-dark hover:bg-vms-accent-dark shadow-md focus:ring-vms-accent",
    outline: "border-2 border-vms-secondary text-vms-secondary hover:bg-vms-primary-light focus:ring-vms-secondary",
    ghost: "text-vms-gray-600 hover:bg-vms-primary-light hover:text-vms-primary focus:ring-vms-gray-200"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button 
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
