"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const path = usePathname();
  const items = [
    { href: "/projects", label: "Projects" },
    { href: "/projects/new", label: "New Project" },
  ];

  return (
    <aside className="border-r h-full p-4">
      <nav className="space-y-2">
        {items.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className={`block rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground ${
              path === i.href ? "bg-accent" : ""
            }`}
          >
            {i.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}