// src/hooks/use-effects.ts

// TypeScript types
interface EffectState {
    blurred: boolean;
    gradient: string;
    filter: string;
    shadow: boolean;
}

const initialState: EffectState = {
    blurred: false,
    gradient: '',
    filter: '',
    shadow: false,
};

let currentState: EffectState = { ...initialState };

// Error Handling Function
function handleError(message: string) {
    console.error(message);
    throw new Error(message);
}

// Function to apply blur effect
export function applyBlur(value: boolean): void {
    currentState.blurred = value;
    if (typeof value !== 'boolean') {
        handleError('Invalid value for applyBlur: must be a boolean');
    }
}

// Function to apply gradient effect
export function applyGradient(value: string): void {
    currentState.gradient = value;
    if (typeof value !== 'string') {
        handleError('Invalid value for applyGradient: must be a string');
    }
}

// Function to apply filter effect
export function applyFilter(value: string): void {
    currentState.filter = value;
    if (typeof value !== 'string') {
        handleError('Invalid value for applyFilter: must be a string');
    }
}

// Function to apply shadow effect
export function applyShadow(value: boolean): void {
    currentState.shadow = value;
    if (typeof value !== 'boolean') {
        handleError('Invalid value for applyShadow: must be a boolean');
    }
}

// Function to export current effect state
export function exportEffectState(): EffectState {
    return { ...currentState };
}