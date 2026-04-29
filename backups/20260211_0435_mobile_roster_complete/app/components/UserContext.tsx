'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    role: string;
    companyId: string;
}

const UserContext = createContext<User | null>(null);

export function UserProvider({ children, initialUser }: { children: React.ReactNode; initialUser: User }) {
    return (
        <UserContext.Provider value={initialUser}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
