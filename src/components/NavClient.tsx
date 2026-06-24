"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth.context";

export default function NavClient() {
  const { isAuthed } = useAuth();

  return (
    <nav className="nav">
      <Link href="/" className="navLink">Home</Link>
      <Link href="/about" className="navLink">About</Link>
      <Link href="/support" className="navLink">Support</Link>

      {isAuthed && (
        <>
          <Link href="/vulnerability-index" className="navLink">
            Vulnerability Index
          </Link>

          <Link href="/pathways" className="navLink">
            Pathways
          </Link>

          <Link href="/projects" className="navLink">
            Projects
          </Link>

          <Link href="/intermediaries" className="navLink">
            Intermediaries
          </Link>
        </>
      )}
    </nav>
  );
}