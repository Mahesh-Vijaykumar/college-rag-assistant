import React from 'react';

const Input = ({
    label,
    id,
    type = 'text',
    placeholder,
    value,
    onChange,
    className = '',
    error,
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1.5">
                    {label}
                </label>
            )}
            <input
                id={id}
                type={type}
                className={`
          w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-700 text-white placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          transition-all duration-200
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

export default Input;
