import { useState, useEffect } from 'react';

export interface GamificationState {
    xp: number;
    badges: string[];
    step: number;
}

const STORAGE_KEY = 'defi-wizard-state';

export const useGamification = () => {
    const [state, setState] = useState<GamificationState>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : { xp: 0, badges: [], step: 0 };
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const addXP = (amount: number) => {
        setState(prev => ({ ...prev, xp: prev.xp + amount }));
    };

    const addBadge = (badge: string) => {
        if (!state.badges.includes(badge)) {
            setState(prev => ({ ...prev, badges: [...prev.badges, badge] }));
        }
    };

    const nextStep = () => {
        setState(prev => ({ ...prev, step: prev.step + 1 }));
    };

    const resetState = () => {
        setState({ xp: 0, badges: [], step: 0 });
    };

    return { ...state, addXP, addBadge, nextStep, resetState };
};
