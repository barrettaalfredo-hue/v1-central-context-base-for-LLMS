export function toIso(value: string | Date): string {
  return new Date(value).toISOString().replace(/\.\d{3}Z$/, "Z");
}
