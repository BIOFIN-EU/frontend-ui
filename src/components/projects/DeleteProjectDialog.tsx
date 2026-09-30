"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useDeleteCase } from "@/queries/projects";

type Props = {
  caseId: number | string;
  projectName?: string | null;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeleteProjectDialog({ caseId, projectName, open, onClose, onDeleted }: Props) {
  // Also removes the project from the cached project list.
  const deleteCase = useDeleteCase();

  return (
    <ConfirmDialog
      open={open}
      title={`Delete project #${caseId}?`}
      confirmLabel="Delete project"
      busyLabel="Deleting…"
      onClose={onClose}
      onConfirm={async () => {
        await deleteCase.mutateAsync(caseId);
        onDeleted();
      }}
    >
      {projectName && <p className="font-semibold text-fg">{projectName}</p>}
      <p>
        This cannot be undone. The project and all its data will no longer be available to
        anyone.
      </p>
    </ConfirmDialog>
  );
}
