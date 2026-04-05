export function parseTaskLabels(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(",")
        .map((label) => label.trim().replace(/\s+/g, " "))
        .filter((label) => label.length > 0)
        .slice(0, 8),
    ),
  );
}

export function formatTaskLabels(labels: string[]): string {
  return labels.join(", ");
}

export function toTaskDueAtInputValue(dueAt: string | null): string {
  if (!dueAt) {
    return "";
  }

  const date = new Date(dueAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetMinutes = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offsetMinutes * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

export function normalizeTaskDueAt(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return null;
  }

  const date = new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export function formatTaskDueAt(dueAt: string | null): string | null {
  if (!dueAt) {
    return null;
  }

  const date = new Date(dueAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatTaskAttachmentSize(sizeBytes: number): string {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
