"use client";

import { User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function UserMenu({
  name,
  email,
  onLogout,
}: {
  name: string;
  email?: string;
  onLogout: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await onLogout();
  };

  return (
    <div className="userMenu" ref={ref}>
      <button
        type="button"
        className="avatarButton"
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
      >
        <User size={20} strokeWidth={1.8} />
      </button>

      {open && (
        <div className="userDropdown">
          <Link href="/profile" className="dropdownItem">
            Profile
          </Link>

          <button
            type="button"
            className="dropdownItem"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}