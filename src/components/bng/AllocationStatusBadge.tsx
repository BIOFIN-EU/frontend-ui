import type { BngAllocationStatus } from "@/types/bng";
import { useBngLabels } from "@/queries/bng";
import { Badge, type BadgeTone } from "@/components/ui/Badge";

const TONE: Record<BngAllocationStatus, BadgeTone> = {
  requested: "warning",
  reserved: "info",
  allocated: "success",
  retired: "violet",
  declined: "danger",
  released: "neutral",
};

export function AllocationStatusBadge({ status }: { status: BngAllocationStatus }) {
  const labels = useBngLabels();
  return (
    <Badge tone={TONE[status] ?? "neutral"}>{labels.allocationStatus(status)}</Badge>
  );
}
