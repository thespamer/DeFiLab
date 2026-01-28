import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface GamificationState {
    xp: number;
    badges: string[];
    step: number;
}

interface GamificationContextType extends GamificationState {
    addXP: (amount: number) => void;
    addBadge: (badge: string) => void;
    nextStep: () => void;
    resetState: () => void;
}

const STORAGE_KEY = 'defi-wizard-state';

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<GamificationState>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        try {
            return saved ? JSON.parse(saved) : { xp: 0, badges: [], step: 0 };
        } catch (e) {
            return { xp: 0, badges: [], step: 0 };
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const addXP = (amount: number) => {
        setState(prev => ({ ...prev, xp: prev.xp + amount }));
    };

    const addBadge = (badge: string) => {
        setState(prev => {
            if (prev.badges.includes(badge)) return prev;
            return { ...prev, badges: [...prev.badges, badge] };
        });
    };

    const nextStep = () => {
        setState(prev => ({ ...prev, step: prev.step + 1 }));
    };

    const resetState = () => {
        setState({ xp: 0, badges: [], step: 0 });
    };

    return (
        <GamificationContext.Provider value={{ ...state, addXP, addBadge, nextStep, resetState }}>
            {children}
        </GamificationContext.Provider>
    );
};

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (!context) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
};
