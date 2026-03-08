"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Goal = {
    id: string;
    title: string;
    color: string;
    completed: boolean;
    date: string; // YYYY-MM-DD
};

export type Task = {
    id: string;
    title: string;
    priority: "low" | "medium" | "high";
    completed: boolean;
};

export type NoteBlock = {
    id: string;
    type: "h1" | "h2" | "h3" | "text" | "quote";
    content: string;
    color?: string;
};

export type Note = {
    id: string;
    title: string;
    blocks: NoteBlock[];
    updatedAt: number;
};

export type BoardElement = {
    id: string;
    type: "text" | "image";
    x: number;
    y: number;
    content: string; // text or image base64/url
    color?: string;
    width?: number; // resizable width
};

export type BoardConnection = {
    id: string;
    fromId: string;
    toId: string;
};

export type DrawingPoint = { x: number; y: number };
export type BoardDrawing = {
    id: string;
    points: DrawingPoint[];
    color: string;
};

type AppState = {
    goals: Goal[];
    tasks: Task[];
    notes: Note[];
    boardElements: BoardElement[];
    boardConnections: BoardConnection[];
    boardDrawings?: BoardDrawing[];
};

const initialState: AppState = {
    goals: [],
    tasks: [],
    notes: [],
    boardElements: [],
    boardConnections: [],
    boardDrawings: []
};

type StoreContextType = {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
    isLoaded: boolean;
};

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AppState>(initialState);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage
    useEffect(() => {
        setIsLoaded(false); // Reset to be safe
        const saved = localStorage.getItem("lariflow_data");
        if (saved) {
            try {
                setState(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse local storage", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to local storage automatically
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("lariflow_data", JSON.stringify(state));
        }
    }, [state, isLoaded]);

    if (!isLoaded) return null; // Don't render until client-side hydration is complete

    return (
        <StoreContext.Provider value={{ state, setState, isLoaded }}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error("useStore must be used within a StoreProvider");
    }
    return context;
}
