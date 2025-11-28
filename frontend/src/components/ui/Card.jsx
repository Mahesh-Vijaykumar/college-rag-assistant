import React from 'react';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`bg-dark-800 rounded-xl border border-dark-700 p-6 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
