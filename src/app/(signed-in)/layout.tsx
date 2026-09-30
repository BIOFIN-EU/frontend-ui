import RequireAuth from "@/components/RequireAuth";

// Every page in this group needs a signed-in user. Visitors who aren't
// signed in are sent to /login and brought back here afterwards.
export default function SignedInLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
