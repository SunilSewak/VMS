import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline';
}

export function Badge({ children, variant = 'default', className = "", ...props }: BadgeProps) {
  const variants = {
    default: "bg-vms-gray-100 text-vms-gray-800 border-vms-gray-200",
    success: "bg-vms-success-bg text-vms-success border-vms-success/20",
    warning: "bg-vms-warning-bg text-vms-warning border-vms-warning/20",
    danger: "bg-vms-danger-bg text-vms-danger border-vms-danger/20",
    info: "bg-vms-primary-light text-vms-primary border-vms-primary/20",
    secondary: "bg-vms-gray-200 text-vms-gray-700 border-vms-gray-300",
    outline: "bg-transparent text-vms-gray-600 border-vms-gray-300"
  };

  return (
    <span 
      className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full border ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
