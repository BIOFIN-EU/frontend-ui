import { useEffect, useState } from "react";
import { bngService } from "@/services/bng.service";
import type { BngMyAccess } from "@/types/bng";

const NO_ACCESS: BngMyAccess = { roles: [], can_update: false, can_record_on_behalf: false };

/** The current user's BNG roles on a project (null while loading). */
export function useBngMyAccess(caseId: number | string, enabled = true) {
  const [access, setAccess] = useState<BngMyAccess | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    bngService
      .getMyAccess(caseId)
      .then((value) => mounted && setAccess(value))
      .catch(() => mounted && setAccess(NO_ACCESS));
    return () => {
      mounted = false;
    };
  }, [caseId, enabled]);

  return access;
}

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
