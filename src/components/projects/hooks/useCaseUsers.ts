import { useEffect, useState } from "react";
import { listCaseUsers } from "@/services/case-access.service";
import type { CaseUserAccess } from "@/types/case-access";

export function useCaseUsers(caseId: number) {
  const [users, setUsers] = useState<CaseUserAccess[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await listCaseUsers(caseId);
        if (mounted) setUsers(data);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [caseId]);

  return { users, loading, setUsers };
}