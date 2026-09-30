// Controlled Application-Level Keyboard Navigation Engine
// Specifically engineered for visually impaired candidates per Section 5 & WCAG 2.2 AA/AAA

export const setupKeyNavigation = (handlers = {}) => {
    const handleKeyDown = (event) => {
        // =========================================================================
        // 1. KEYBOARD CONFLICT PROTECTION (Section 9)
        // Global shortcuts must NOT interfere with text input questions, textareas,
        // search fields, login fields, registration fields, or any editable input.
        // =========================================================================
        const target = event.target;
        const targetTag = (target?.tagName || '').toLowerCase();
        const isInputField =
            targetTag === 'input' ||
            targetTag === 'textarea' ||
            targetTag === 'select' ||
            target?.isContentEditable ||
            target?.getAttribute?.('contenteditable') === 'true' ||
            target?.getAttribute?.('role') === 'textbox';

        if (isInputField) {
            // Allow natural keyboard behavior inside form controls
            return;
        }

        const key = event.key;
        const lowerKey = key.toLowerCase();

        // Check if submission confirmation dialog is currently active
        const isModalOpen = typeof handlers.isSubmitModalOpen === 'function'
            ? handlers.isSubmitModalOpen()
            : !!handlers.isSubmitModalOpen;

        // =========================================================================
        // 2. SUBMISSION CONFIRMATION CONTROLS (Section 6 & 7)
        // Y = Confirm Submission
        // Escape = Cancel Submission
        // =========================================================================
        if (isModalOpen) {
            if (lowerKey === 'y') {
                event.preventDefault();
                if (handlers.onConfirmSubmit) {
                    handlers.onConfirmSubmit();
                }
                return;
            }

            if (key === 'Escape') {
                event.preventDefault();
                if (handlers.onCancelSubmit) {
                    handlers.onCancelSubmit();
                } else if (handlers.onEscape) {
                    handlers.onEscape();
                }
                return;
            }

            // Lock out all exam navigation while the submission confirmation modal is open
            return;
        }

        // =========================================================================
        // 3. CORE ACCESSIBLE EXAM CONTROLS (Section 8)
        // =========================================================================

        // R = Repeat Current Question (Section 2)
        if (lowerKey === 'r') {
            event.preventDefault();
            if (handlers.onRepeatQuestion) {
                handlers.onRepeatQuestion();
            } else if (handlers.onRepeatContent) {
                handlers.onRepeatContent();
            } else if (handlers.onReadQuestion) {
                handlers.onReadQuestion();
            }
            return;
        }

        // Arrow Right = Next Question (Section 4)
        if (key === 'ArrowRight') {
            event.preventDefault();
            if (handlers.onNextQuestion) {
                handlers.onNextQuestion();
            } else if (handlers.onNext) {
                handlers.onNext();
            }
            return;
        }

        // Arrow Left = Previous Question (Section 4)
        if (key === 'ArrowLeft') {
            event.preventDefault();
            if (handlers.onPrevQuestion) {
                handlers.onPrevQuestion();
            } else if (handlers.onPrev) {
                handlers.onPrev();
            }
            return;
        }

        // 1, 2, 3, 4 = Option Selection (Section 1 & 3)
        if (['1', '2', '3', '4'].includes(key)) {
            event.preventDefault();
            if (handlers.onNumberKey) {
                handlers.onNumberKey(key);
            }
            return;
        }

        // S = Submit Exam (Opens Confirmation Modal) (Section 5)
        if (lowerKey === 's') {
            event.preventDefault();
            if (handlers.onOpenSubmit) {
                handlers.onOpenSubmit();
            } else if (handlers.onSubmit) {
                handlers.onSubmit();
            }
            return;
        }

        // Escape = Stop audio speech
        if (key === 'Escape') {
            if (handlers.onEscape) {
                handlers.onEscape();
            }
            return;
        }

        // =========================================================================
        // 4. AUXILIARY / COMPATIBILITY CONTROLS
        // =========================================================================

        // Spacebar = Also triggers Repeat Question (when not on a button)
        if (key === ' ' && targetTag !== 'button') {
            event.preventDefault();
            if (handlers.onRepeatQuestion) {
                handlers.onRepeatQuestion();
            } else if (handlers.onRepeatContent) {
                handlers.onRepeatContent();
            } else if (handlers.onReadQuestion) {
                handlers.onReadQuestion();
            }
            return;
        }

        // Option Up / Down navigation
        if (key === 'ArrowDown') {
            if (handlers.onOptionDown) {
                event.preventDefault();
                handlers.onOptionDown();
            }
            return;
        }

        if (key === 'ArrowUp') {
            if (handlers.onOptionUp) {
                event.preventDefault();
                handlers.onOptionUp();
            }
            return;
        }

        // Enter = Confirm highlighted option (when not focused on a native button)
        if (key === 'Enter') {
            if (handlers.onSelect && targetTag !== 'button') {
                event.preventDefault();
                handlers.onSelect();
            }
            return;
        }

        // M = Toggle Mark for Review
        if (lowerKey === 'm' && handlers.onMark) {
            event.preventDefault();
            handlers.onMark();
            return;
        }

        // Backspace or C = Clear Answer
        if ((key === 'Backspace' || lowerKey === 'c') && handlers.onClear) {
            event.preventDefault();
            handlers.onClear();
            return;
        }

        // I = Describe Visual Figure (Level 1 Quick Description - Part 6, 10, 15)
        if (lowerKey === 'i') {
            event.preventDefault();
            if (handlers.onDescribeVisual) {
                handlers.onDescribeVisual();
            } else if (handlers.onVisualQuick) {
                handlers.onVisualQuick();
            }
            return;
        }

        // D = Detailed Visual Description (Level 2 Detailed Description - Part 10, 15)
        if (lowerKey === 'd') {
            event.preventDefault();
            if (handlers.onDetailedVisual) {
                handlers.onDetailedVisual();
            } else if (handlers.onVisualDetailed) {
                handlers.onVisualDetailed();
            }
            return;
        }

        // T = Hear remaining time (Part 4 & 15)
        if (lowerKey === 't') {
            event.preventDefault();
            if (handlers.onReadTime) {
                handlers.onReadTime();
            } else if (handlers.onTellTime) {
                handlers.onTellTime();
            }
            return;
        }

        // ? or H = Help Cheatsheet
        if ((key === '?' || lowerKey === 'h') && handlers.onHelp) {
            event.preventDefault();
            handlers.onHelp();
            return;
        }

        // Legacy N (Next) and P (Prev) keys
        if (lowerKey === 'n') {
            event.preventDefault();
            if (handlers.onNextQuestion) handlers.onNextQuestion();
            else if (handlers.onNext) handlers.onNext();
            return;
        }

        if (lowerKey === 'p') {
            event.preventDefault();
            if (handlers.onPrevQuestion) handlers.onPrevQuestion();
            else if (handlers.onPrev) handlers.onPrev();
            return;
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
};