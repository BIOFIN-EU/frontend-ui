export type LookupOption = {
  value: string;
  label: string;
  // From the lookup table in physical-api, when it has one.
  description?: string | null;
  // Lists grouped by a category (e.g. NbS interventions by type 1-3): the
  // option's group and that group's heading.
  group?: string;
  group_label?: string;
};
