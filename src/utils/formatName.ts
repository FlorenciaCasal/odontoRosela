export default function formatName(value?: string): string {
  if (!value) return "";

  return value
    .trim()
    .toLowerCase()        // todo en minúsculas
    .replace(/\s+/g, " ") // colapsa espacios múltiples
    .split(" ")
    .map((word) =>
      word.charAt(0).toLocaleUpperCase("es-AR") + word.slice(1)
    )
    .join(" ");
}