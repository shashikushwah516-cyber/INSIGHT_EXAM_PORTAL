import { useEffect } from 'react';
import { setupKeyNavigation } from '../utils/keyNav';

export const useKeyboardNavigation = (handlers = {}, enabled = true) => {
    useEffect(() => {
        if (!enabled) return;
        const cleanup = setupKeyNavigation(handlers);
        return cleanup;
    }, [handlers, enabled]);
};

export default useKeyboardNavigation;
