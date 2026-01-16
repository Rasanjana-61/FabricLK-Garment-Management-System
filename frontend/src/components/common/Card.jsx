import React from 'react';

const Card = ({ children, className = '', title }) => {
    return (
        <div className={`bg-white shadow-md rounded-lg p-6 ${className}`}>
            {title && <h2 className="text-xl font-bold mb-4 text-text-main">{title}</h2>}
            {children}
        </div>
    );
};

export default Card;
