"use client";

import { useParams } from "next/navigation";

import { ProjectAccessPanel } from "@/components/projects/access/ProjectAccessPanel";

// Every member sees who is on the project; only managers can change it.
export default function CaseAccessPage() {
  const params = useParams<{ caseId: string }>();
  return <ProjectAccessPanel caseId={params.caseId} />;
}
