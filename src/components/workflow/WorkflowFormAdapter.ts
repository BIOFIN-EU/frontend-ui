import type { WorkflowStep } from "@/types/workflow";
import type { StepSchema } from "@/types/forms";



export function AdaptWorkflowStepToForm(step: WorkflowStep): StepSchema {
  return {
    step: 0,
    title: step.title,
    fields: step.fields.map((f) => ({
      id: f.name,
      label: f.display_name,
      type: f.type as StepSchema["fields"][number]["type"],
      required: !!f.required,
      options: Array.isArray(f.options) ? f.options : [],
      options_source: f.options_source,   // ✅ ADD THIS
    })),
  };
}