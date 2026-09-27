// Keyboard-First Navigation Controller for Visually Impaired Candidates

export const setupKeyNavigation = (handlers = {}) => {
    const handleKeyDown = (event) => {
        // If the user is actively typing in a text field, do not hijack normal typing
        const targetTag = event.target.tagName.toLowerCase();
        const isInputField = targetTag === 'input' || targetTag === 'textarea';

        if (isInputField && !['Enter', 'Escape'].includes(event.key)) {
            return;
        }

        const key = event.key.toUpperCase();

        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                if (handlers.onNext) {
                    event.preventDefault();
                    handlers.onNext();
                }
                break;

            case 'ArrowUp':
            case 'ArrowLeft':
                if (handlers.onPrev) {
                    event.preventDefault();
                    handlers.onPrev();
                }
                break;

            case 'Enter':
            case ' ':
                if (handlers.onSelect && !isInputField) {
                    event.preventDefault();
                    handlers.onSelect();
                }
                break;

            case 'Backspace':
                if (handlers.onBack && !isInputField) {
                    handlers.onBack();
                }
                break;

            case 'Escape':
                if (handlers.onEscape) {
                    handlers.onEscape();
                }
                break;

            default:
                // Option number keys (1-4)
                if (['1', '2', '3', '4'].includes(event.key)) {
                    if (handlers.onNumberKey) {
                        event.preventDefault();
                        handlers.onNumberKey(event.key);
                    }
                }
                // Letter shortcut keys
                else if (key === 'N' && handlers.onNext && !isInputField) {
                    event.preventDefault();
                    handlers.onNext();
                } else if (key === 'P' && handlers.onPrev && !isInputField) {
                    event.preventDefault();
                    handlers.onPrev();
                } else if (key === 'M' && handlers.onMark && !isInputField) {
                    event.preventDefault();
                    handlers.onMark();
                } else if (key === 'C' && handlers.onClear && !isInputField) {
                    event.preventDefault();
                    handlers.onClear();
                } else if ((key === 'R' || key === 'Q') && handlers.onReadQuestion && !isInputField) {
                    event.preventDefault();
                    handlers.onReadQuestion();
                } else if (key === 'O' && handlers.onReadOptions && !isInputField) {
                    event.preventDefault();
                    handlers.onReadOptions();
                } else if (key === 'T' && handlers.onReadTime && !isInputField) {
                    event.preventDefault();
                    handlers.onReadTime();
                } else if (key === 'S' && handlers.onReadSelected && !isInputField) {
                    event.preventDefault();
                    handlers.onReadSelected();
                } else if ((event.key === '?' || key === 'H') && handlers.onHelp && !isInputField) {
                    event.preventDefault();
                    handlers.onHelp();
                }
                break;
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
};