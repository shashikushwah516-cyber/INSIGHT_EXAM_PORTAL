import { useEffect, useRef } from 'react';
import { setupKeyNavigation } from '../utils/keyNav';

export const useKeyboardNavigation = (handlers = {}, enabled = true) => {
    const handlersRef = useRef(handlers);
    useEffect(() => {
        handlersRef.current = handlers;
    });

    useEffect(() => {
        if (!enabled) return;
        const proxyHandlers = new Proxy({}, {
            get: (_, prop) => {
                const val = handlersRef.current?.[prop];
                if (typeof val === 'function') {
                    return (...args) => handlersRef.current?.[prop]?.(...args);
                }
                return val;
            }
        });
        const cleanup = setupKeyNavigation(proxyHandlers);
        return cleanup;
    }, [enabled]);
};

export default useKeyboardNavigation;
