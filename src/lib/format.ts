export function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}