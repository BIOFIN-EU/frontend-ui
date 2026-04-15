"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth.context";
import UserMenu from "./UserMenu";

export default function HeaderAuthClient() {
  const { isAuthed, user, logout } = useAuth();

  if (!isAuthed) {
    return (
      <div className="authArea">
        <Link className="navLink" href="/login">Login</Link>
        <Link className="navCta" href="/signup">Sign up</Link>
      </div>
    );
  }

  return (
    <div className="authArea">
      <UserMenu
        name={user?.name ?? user?.email ?? "Account"}
        email={user?.email}
        onLogout={logout}
      />
    </div>
  );
}