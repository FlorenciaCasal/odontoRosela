"use client";

type Props = { link: string; label?: string };

export default function CopyLinkButton({ link, label = "Copiar" }: Props) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      // opcional: podés sumar un pequeño feedback visual si tenés un toast
      alert("Link copiado");
    } catch {
      // fallback: selecciona el texto si no hay clipboard API
      window.prompt("Copiá el link:", link);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="border px-3 py-2 rounded"
    >
      {label}
    </button>
  );
}


