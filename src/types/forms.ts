export type VisibleIfRule = {
  field: string;
  op: "equals";
  value: any;
};

export type FieldOption = {
  label: string;
  value: string;
  description?: string | null;
  // Shown under this heading in the list (options of a group are adjacent).
  groupLabel?: string;
};

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
    | "content"
    | "date";

  label: string;
  content?: string;
  help?: string;
  // List each option with its description in the field's info popover.
  describeOptions?: boolean;

  required?: boolean;
  options?: FieldOption[];
  visible_if?: VisibleIfRule;

  // A select whose options depend on another field's value (the workflow
  // config's filter_by): options are those that fit it. Changing that field
  // clears this one if its value no longer fits.
  filterBy?: string;
  // The value of that field the options are for (options lag a render
  // behind the form while a new list loads).
  optionsFor?: string;
  // Options are loading, or can't be chosen yet (the field above is empty).
  optionsLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  // Every option, to name a saved value that no longer fits.
  allOptions?: FieldOption[];
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
