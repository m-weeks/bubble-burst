import React, { useState, useEffect } from 'react';

const Ellipsis: React.FC = () => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prevDots => (prevDots.length < 3 ? prevDots + '.' : ''));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <span style={{ display: 'inline-block', position: 'relative' }}>
            <span style={{ visibility: 'hidden' }}>...</span>
            <span style={{ position: 'absolute', left: 0, top: 0 }}>
                {dots}
            </span>
        </span>
    );
};

export default Ellipsis;