import React, { PropsWithChildren } from "react";
import { Topbar } from "./Topbar";

export function AppShell({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Topbar />
            <main className="flex-1 w-full max-w-7xl mx-auto p-6">
                {children}
            </main>
        </div>
    );
}