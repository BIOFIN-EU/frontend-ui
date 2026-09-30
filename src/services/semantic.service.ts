import { apiFetch } from "@/lib/api";

const BASE = "/api/semantic";

export const semanticService = {
  // The project as a JSON-LD document (BIOFIN-EU ontology). Silent: the
  // Export page shows the error itself.
  exportProject(caseId: number | string): Promise<unknown> {
    return apiFetch<unknown>(`${BASE}/projects/${caseId}`, { silent: true });
  },

  // The dashboard's extensions to the BIOFIN-EU ontology (Turtle text).
  extensionOntology(): Promise<string> {
    return apiFetch<string>(`${BASE}/ontology/ext`, { silent: true });
  },
};
