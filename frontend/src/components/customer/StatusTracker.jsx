import React from 'react';
import { Package, Play, Truck, CheckCircle } from 'lucide-react';

const StatusTracker = ({ status }) => {
    const statuses = [
        { 
            name: 'Processing', 
            icon: Package,
            description: 'Order is being processed'
        },
        { 
            name: 'Started', 
            icon: Play,
            description: 'Pickup initiated'
        },
        { 
            name: 'On the Way', 
            icon: Truck,
            description: 'Out for delivery'
        },
        { 
            name: 'Delivered', 
            icon: CheckCircle,
            description: 'Successfully delivered'
        }
    ];
    
    const currentStatusIndex = statuses.findIndex(s => s.name === status);

    return (
        <div className="w-full my-8">
            <div className="flex items-center justify-between relative">
                {statuses.map((statusItem, index) => {
                    const Icon = statusItem.icon;
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    const isPending = index > currentStatusIndex;
                    
                    return (
                        <React.Fragment key={statusItem.name}>
                            <div className="flex flex-col items-center relative z-10">
                                {/* Status Circle with Icon */}
                                <div
                                    className={`
                                        relative w-12 h-12 rounded-full flex items-center justify-center 
                                        transition-all duration-700 ease-out transform
                                        ${isCompleted 
                                            ? 'bg-[var(--color-primary)] text-white scale-110 shadow-lg' 
                                            : isPending
                                            ? 'bg-[var(--color-secondary)] text-gray-400 scale-100'
                                            : 'bg-[var(--color-primary)] text-white scale-110 shadow-lg'
                                        }
                                        ${isCurrent ? 'animate-pulse' : ''}
                                    `}
                                    style={{
                                        boxShadow: isCompleted || isCurrent 
                                            ? '0 4px 20px rgba(26, 115, 232, 0.3)' 
                                            : 'none'
                                    }}
                                >
                                    {/* Animated ring for current status */}
                                    {isCurrent && (
                                        <div 
                                            className="absolute inset-0 rounded-full animate-ping"
                                            style={{ 
                                                backgroundColor: 'var(--color-primary)',
                                                opacity: '0.3'
                                            }}
                                        />
                                    )}
                                    
                                    <Icon 
                                        size={18} 
                                        className={`
                                            transition-all duration-500
                                            ${isCompleted && !isCurrent ? 'animate-bounce' : ''}
                                            ${isCurrent ? 'animate-pulse' : ''}
                                        `}
                                    />
                                </div>
                                
                                {/* Status Text */}
                                <div className="mt-3 text-center">
                                    <p
                                        className={`
                                            text-sm font-medium transition-all duration-500
                                            ${isCompleted 
                                                ? 'text-[var(--color-primary)] font-semibold' 
                                                : 'text-gray-500'
                                            }
                                            ${isCurrent ? 'animate-pulse' : ''}
                                        `}
                                    >
                                        {statusItem.name}
                                    </p>
                                    <p 
                                        className={`
                                            text-xs mt-1 transition-all duration-500
                                            ${isCompleted 
                                                ? 'text-[var(--color-text-secondary)] opacity-100' 
                                                : 'text-gray-400 opacity-70'
                                            }
                                        `}
                                    >
                                        {statusItem.description}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Progress Line */}
                            {index < statuses.length - 1 && (
                                <div className="flex-1 mx-4 relative">
                                    {/* Background line */}
                                    <div 
                                        className="h-1 rounded-full"
                                        style={{ backgroundColor: 'var(--color-secondary)' }}
                                    />
                                    
                                    {/* Progress line with animation */}
                                    <div
                                        className={`
                                            absolute top-0 h-1 rounded-full transition-all duration-1000 ease-out
                                            ${index < currentStatusIndex 
                                                ? 'w-full' 
                                                : index === currentStatusIndex
                                                ? 'w-1/2 animate-pulse'
                                                : 'w-0'
                                            }
                                        `}
                                        style={{ 
                                            backgroundColor: 'var(--color-primary)',
                                            boxShadow: index <= currentStatusIndex 
                                                ? '0 2px 10px rgba(26, 115, 232, 0.3)' 
                                                : 'none'
                                        }}
                                    />
                                    
                                    {/* Moving dot animation for current step */}
                                    {index === currentStatusIndex && (
                                        <div
                                            className="absolute top-0 w-2 h-1 rounded-full animate-ping"
                                            style={{ 
                                                backgroundColor: 'var(--color-primary)',
                                                left: '50%',
                                                transform: 'translateX(-50%)'
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            
            {/* Progress Percentage */}
            <div className="mt-6 text-center">
                <div 
                    className="text-sm font-medium transition-all duration-500"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    Progress: {Math.round(((currentStatusIndex + 1) / statuses.length) * 100)}%
                </div>
                
                {/* Progress Bar */}
                <div 
                    className="mt-2 w-full h-2 rounded-full mx-auto max-w-md overflow-hidden"
                    style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                    <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                            backgroundColor: 'var(--color-primary)',
                            width: `${((currentStatusIndex + 1) / statuses.length) * 100}%`,
                            boxShadow: '0 2px 10px rgba(26, 115, 232, 0.3)'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default StatusTracker;