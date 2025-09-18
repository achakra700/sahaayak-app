import React from 'react';

const AuthIllustration: React.FC = () => {
    return (
        <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'var(--accent-primary)', stopOpacity: 0.8 }} />
                    <stop offset="100%" style={{ stopColor: 'var(--text-accent)', stopOpacity: 0.6 }} />
                </linearGradient>
                <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            
            {/* Background shapes */}
            <circle cx="100" cy="80" r="70" fill="url(#grad1)" opacity="0.3" filter="url(#softGlow)" />
            <path d="M 250,50 Q 350,150 250,250 Q 150,150 250,50" fill="url(#grad1)" opacity="0.2" filter="url(#softGlow)" />
            
            {/* Central figure */}
            <g transform="translate(200, 150) scale(1.2)">
                <path d="M 0,-40 C 20,-50 30,-30 30,-10 C 30,10 20,30 0,40 C -20,30 -30,10 -30,-10 C -30,-30 -20,-50 0,-40 Z" fill="none" stroke="var(--text-primary)" strokeWidth="2" />
                <circle cx="0" cy="-5" r="10" fill="var(--bg-surface)" />
                <circle cx="-7" cy="-8" r="1.5" fill="var(--text-primary)" />
                <circle cx="7" cy="-8" r="1.5" fill="var(--text-primary)" />
                <path d="M -5,2 Q 0,7 5,2" fill="none" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round" />
                 {/* Glowing heart */}
                <path d="M 0,15 L -5,20 A 5 5, 0, 0, 1, 5,20 Z" fill="var(--danger-primary)" filter="url(#softGlow)" opacity="0.8">
                     <animate attributeName="opacity" values="0.8; 1; 0.8" dur="2s" repeatCount="indefinite" />
                </path>
            </g>
            
            {/* Floating elements */}
            <text x="50" y="200" fontFamily="Poppins" fontSize="20" fill="var(--text-secondary)" opacity="0.7">🌿</text>
            <text x="320" y="100" fontFamily="Poppins" fontSize="24" fill="var(--text-secondary)" opacity="0.7">💙</text>
            <circle cx="80" cy="250" r="5" fill="var(--accent-primary)" opacity="0.5">
                <animateTransform attributeName="transform" type="translate" values="0 0; 0 -10; 0 0" dur="3s" repeatCount="indefinite" />
            </circle>
             <circle cx="350" y="220" r="3" fill="var(--text-accent)" opacity="0.6">
                 <animateTransform attributeName="transform" type="translate" values="0 0; 5 -5; 0 0" dur="4s" repeatCount="indefinite" />
            </circle>
        </svg>
    );
};

export default AuthIllustration;