import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar() {
  return (
    <header className="h-14 border-b flex items-center justify-between px-4">
      <div className="flex items-center gap-2 font-semibold">
        <FlaskConical className="h-5 w-5" />
        ImmunoStat Web
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost">Docs</Button>
        <Button>New Project</Button>
      </div>
    </header>
  );
}