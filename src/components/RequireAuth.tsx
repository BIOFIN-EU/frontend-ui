"use client";

import { useAuth } from "@/context/auth.context";

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="h1">Profile</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}