import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({
  className,
  ...props
}) => {
  return (
    <input
      className={clsx(
        'block w-full rounded-md border border-gray-300 bg-white shadow-sm',
        'focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50',
        'disabled:bg-gray-100 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  );
};
