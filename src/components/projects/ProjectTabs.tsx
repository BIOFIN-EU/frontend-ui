"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Leaf, Users } from "lucide-react";

type Props = {
  caseId: string;
  canManageUsers: boolean;
};

export function ProjectTabs({ caseId, canManageUsers }: Props) {
  const pathname = usePathname();
  const base = `/projects/${caseId}`;

  const tabs = [
    { href: base, label: "Overview", icon: LayoutDashboard, active: pathname === base },
    {
      href: `${base}/vulnerability`,
      label: "Vulnerability Index",
      icon: Leaf,
      active: pathname.startsWith(`${base}/vulnerability`),
    },
    ...(canManageUsers
      ? [
          {
            href: `${base}/access`,
            label: "Access",
            icon: Users,
            active: pathname.startsWith(`${base}/access`),
          },
        ]
      : []),
  ];

  return (
    <nav
      aria-label="Project sections"
      className="flex flex-wrap gap-2 border-b border-fg/10"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={tab.active ? "page" : undefined}
            className={[
              "-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition",
              // `!` beats globals.css's `a { color: inherit }`, as in components/ui/Button.tsx.
              tab.active
                ? "border-accent-400 !text-fg"
                : "border-transparent !text-fg/65 hover:!text-fg",
            ].join(" ")}
          >
            <Icon className="h-4 w-4 text-accent-300" aria-hidden="true" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
