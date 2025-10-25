"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
  { value: "data",     label: "Data" },
  { value: "visuals",  label: "Visuals" },
  { value: "hla",      label: "HLA" },
  { value: "settings", label: "Settings" },
];

export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const router = useRouter();

  // /projects/:projectId/<tab>
  const current = TABS.find(t => pathname.endsWith("/" + t.value))?.value ?? "data";

  function onChange(val: string) {
    router.push(`/projects/${projectId}/${val}`);
  }

  return (
    <Tabs value={current} onValueChange={onChange} className="w-full">
      <TabsList>
        {TABS.map(t => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}