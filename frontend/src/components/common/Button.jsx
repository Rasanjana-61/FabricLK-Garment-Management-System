import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '' }) => {
    const baseStyle =
        "px-4 py-2 rounded-md font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-300";

    const variants = {
        primary: "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] focus:ring-[var(--color-primary)]",
        secondary: "bg-[var(--color-secondary)] text-[var(--color-text-main)] hover:bg-[var(--color-secondary-hover)] focus:ring-[var(--color-secondary)]",
        danger: "bg-[var(--color-danger)] hover:bg-[var(--color-danger-hover)] focus:ring-[var(--color-danger)]",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseStyle} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
