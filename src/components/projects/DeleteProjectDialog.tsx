"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { caseListService } from "@/services/case-list.service";

type Props = {
  caseId: number | string;
  projectName?: string | null;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeleteProjectDialog({ caseId, projectName, open, onClose, onDeleted }: Props) {
  return (
    <ConfirmDialog
      open={open}
      title={`Delete project #${caseId}?`}
      confirmLabel="Delete project"
      busyLabel="Deleting…"
      onClose={onClose}
      onConfirm={async () => {
        await caseListService.deleteCase(caseId);
        onDeleted();
      }}
    >
      {projectName && <p className="font-semibold text-white">{projectName}</p>}
      <p>
        This cannot be undone. The project and all its data will no longer be available to
        anyone.
      </p>
    </ConfirmDialog>
  );
}
