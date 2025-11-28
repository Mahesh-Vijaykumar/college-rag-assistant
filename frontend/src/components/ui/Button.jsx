import React from 'react';

const variants = {
    primary: 'bg-primary-600 hover:bg-primary-500 text-white',
    secondary: 'bg-dark-700 hover:bg-dark-600 text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    outline: 'border border-dark-700 text-gray-300 hover:border-gray-500 hover:text-white',
    ghost: 'text-gray-400 hover:text-white hover:bg-dark-800',
};

const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
};

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    onClick,
    type = 'button',
    ...props
}) => {
    return (
        <button
            type={type}
            className={`
        inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
