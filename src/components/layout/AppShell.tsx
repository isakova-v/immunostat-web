import { PropsWithChildren } from "react";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="h-screen w-full grid grid-rows-[auto,1fr]">
      <Topbar />
      <div className="grid grid-cols-[260px,1fr]">
        <Sidebar />
        <main className="p-6 overflow-auto bg-muted/20">{children}</main>
      </div>
    </div>
  );
}