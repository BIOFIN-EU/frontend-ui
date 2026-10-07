"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/auth.context";
import HeaderAuthClient from "./HeaderAuthClient";
import ThemeToggle from "./ThemeToggle";

export default function NavClient({ brand }: { brand: ReactNode }) {
  const { isAuthed } = useAuth();
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const open = openPath === pathname;
  const links = [
    { href: "/support", label: "Support" },
    ...(isAuthed ? [
      { href: "/pathways", label: "Project Pathways" },
      { href: "/projects", label: "Projects" },
      { href: "/intermediaries", label: "Intermediaries" },
    ] : []),
    { href: "https://biofin-project.eu/", label: "BIOFIN-EU Project", external: true },
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
              className="navLink"
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              onClick={close}
            >
              {link.label}
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
