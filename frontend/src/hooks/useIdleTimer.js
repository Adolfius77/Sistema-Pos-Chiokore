import { useState, useEffect, useRef, useCallback } from 'react';

export const useIdleTimer = (timeout = 60000) => { // 60 seconds default
    const [isIdle, setIsIdle] = useState(false);
    const timerRef = useRef(null);

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsIdle(false);
        timerRef.current = setTimeout(() => setIsIdle(true), timeout);
    }, [timeout]);

    useEffect(() => {
        const events = ['mousedown', 'keydown', 'touchstart', 'mousemove'];
        
        events.forEach(event => window.addEventListener(event, resetTimer));
        resetTimer(); // Start timer

        return () => {
            events.forEach(event => window.removeEventListener(event, resetTimer));
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [resetTimer]);

    return isIdle;
};
