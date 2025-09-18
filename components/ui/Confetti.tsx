import React from 'react';

const Confetti: React.FC = () => (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-50">
        {[...Array(50)].map((_, i) => (
            <div key={i} className="confetti" style={{
                left: `${Math.random() * 100}%`,
                animation: `fall ${Math.random() * 3 + 2}s linear ${Math.random() * 2}s infinite`,
                background: ['#22d3ee', '#a78bfa', '#34d399', '#f472b6'][Math.floor(Math.random() * 4)]
            }}></div>
        ))}
         <style>{`
            .confetti {
                position: absolute;
                width: 8px;
                height: 16px;
                opacity: 0.7;
                border-radius: 50%;
            }
            @keyframes fall {
                0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
                100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
            }
        `}</style>
    </div>
);

export default Confetti;
