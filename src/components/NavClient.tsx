"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { Lock, Menu, X } from "lucide-react";
import { useAuth } from "@/context/auth.context";
import HeaderAuthClient from "./HeaderAuthClient";
import ThemeToggle from "./ThemeToggle";

export default function NavClient({ brand }: { brand: ReactNode }) {
  const { isAuthed, isInitializing } = useAuth();
  // Signed out, the pages that need an account are still listed, with a lock,
  // and lead to the login page (which brings the visitor back afterwards).
  const locked = !isAuthed && !isInitializing;
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const open = openPath === pathname;
  // The BIOFIN-EU project website is linked from the home page's tiles.
  const links: { href: string; label: string; external?: boolean; locked?: boolean }[] = [

    ...[
      { href: "/pathways", label: "Pathways" },
      { href: "/projects", label: "Projects" },
      { href: "/intermediaries", label: "Intermediaries" },
    ].map((link) =>
      locked ? { ...link, href: `/login?next=${encodeURIComponent(link.href)}`, locked: true } : link
    ),
      { href: "/support", label: "Support" },
  ];

  function close() {
    setOpenPath(null);
  }

  return (
    <div className="siteHeaderInner" onKeyDown={(event) => {
      if (event.key === "Escape" && open) {
        close();
        toggleRef.current?.focus();
      }
    }}>
      {brand}
      <button
        ref={toggleRef}
        type="button"
        className="mobileMenuToggle navLink"
        aria-expanded={open}
        aria-controls="site-navigation"
        onClick={() => setOpenPath(open ? null : pathname)}
      >
        {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        Menu
      </button>
      <div id="site-navigation" className={`siteNavigation${open ? " isOpen" : ""}`}>
        <nav className="nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={link.locked ? "navLink inline-flex items-center gap-1.5" : "navLink"}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              title={link.locked ? "Log in to open this page" : undefined}
              onClick={close}
            >
              {link.label}
              {link.locked && (
                <>
                  <Lock className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                  <span className="sr-only">(login required)</span>
                </>
              )}
            </Link>
          ))}
        </nav>
        <div className="headerControls" onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) close();
        }}>
          <ThemeToggle />
          <HeaderAuthClient />
        </div>
      </div>
    </div>
  );
}
