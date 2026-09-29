import { BNG_STATUS_LABEL, type BngAllocationStatus } from "@/types/bng";

const STYLE: Record<BngAllocationStatus, string> = {
  requested: "bg-amber-500/15 text-amber-200 ring-amber-400/25",
  reserved: "bg-sky-500/15 text-sky-200 ring-sky-400/25",
  allocated: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25",
  retired: "bg-violet-500/15 text-violet-200 ring-violet-400/25",
  declined: "bg-red-500/15 text-red-200 ring-red-400/25",
  released: "bg-white/10 text-white/60 ring-white/10",
};

export function AllocationStatusBadge({ status }: { status: BngAllocationStatus }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${STYLE[status] ?? STYLE.released}`}
    >
      {BNG_STATUS_LABEL[status] ?? status}
    </span>
  );
}
