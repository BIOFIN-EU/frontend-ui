export type VisibleIfRule = {
  field: string;
  op: "equals";
  value: any;
};

export type FieldOption = { label: string; value: string; description?: string | null };

export type FieldSchema = {
  id: string;
  type:
    | "text"
    | "number"
    | "select"
    | "radio"
    | "checkbox"
    | "textarea"
    | "file"
    | "content";

  label: string;
  content?: string;
  help?: string;
  // List each option with its description in the field's info popover.
  describeOptions?: boolean;

  required?: boolean;
  options?: FieldOption[];
  visible_if?: VisibleIfRule;
};

export type StepSchema = {
  step: number;
  title: string;
  fields: FieldSchema[];
};

export type FormSchema = {
  form_id: string;
  version: string;
  title: string;
  steps: StepSchema[];
};

export type Progress = {
  form_id: string;
  form_version: string;
  current_step: number;
  answers: Record<string, any>;
  updated_at?: string;
};
