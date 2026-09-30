import type { BngMyAccess } from "@/types/bng";

/**
 * How the user may act for something owned by `roles`: as their own role,
 * on behalf of it (a project manager), or not at all.
 */
export function capacityFor(access: BngMyAccess | null, roles: string[] | undefined, allowOnBehalf = true) {
  const own = (roles ?? []).find((role) => access?.roles.includes(role as BngMyAccess["roles"][number]));
  if (own) return { kind: "own" as const, role: own };
  if (allowOnBehalf && access?.can_record_on_behalf) return { kind: "on_behalf" as const, role: roles?.[0] };
  return { kind: "none" as const, role: roles?.[0] };
}
