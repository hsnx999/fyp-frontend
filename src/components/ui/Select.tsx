import React from 'react';
import clsx from 'clsx';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <select
      className={clsx(
        'block w-full rounded-md border border-gray-300 bg-white shadow-sm',
        'focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50',
        'disabled:bg-gray-100 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
};
