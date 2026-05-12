"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth.context";

export default function NavClient() {
  const { isAuthed } = useAuth();

  return (
    <nav className="nav">
      <Link href="/" className="navLink">Home</Link>
        {isAuthed && (
      <Link href="/risk-model" className="navLink">Investment Priorities</Link>
            )}
      <Link href="/about" className="navLink">About</Link>
      <Link href="/support" className="navLink">Support</Link>

      {isAuthed && (
        <Link href="/workflow" className="navLink">Workflow</Link>

      )}
      {isAuthed && (
        <Link href="/cases" className="navLink">Cases</Link>

      )}
    </nav>
  );
}
