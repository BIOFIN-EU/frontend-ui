import type { WorkflowStep } from "@/types/workflow";
import type { StepSchema } from "@/types/forms";

function prettifyLabel(name: string) {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AdaptWorkflowStepToForm(step: WorkflowStep): StepSchema {
  return {
    step: 0,
    title: step.title,
    fields: step.fields.map((f) => ({
      id: f.name,
      label: prettifyLabel(f.name),
      type: f.type as StepSchema["fields"][number]["type"],
      required: !!f.required,
      options: Array.isArray(f.options) ? f.options : [],
    }))
  };
}