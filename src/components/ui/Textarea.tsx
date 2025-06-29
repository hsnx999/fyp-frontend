import React from 'react';
import clsx from 'clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea: React.FC<TextareaProps> = ({
  className,
  ...props
}) => {
  return (
    <textarea
      className={clsx(
        'block w-full rounded-md border border-gray-300 bg-white shadow-sm',
        'focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50',
        'disabled:bg-gray-100 disabled:cursor-not-allowed',
        'resize-none',
        className
      )}
      {...props}
    />
  );
};