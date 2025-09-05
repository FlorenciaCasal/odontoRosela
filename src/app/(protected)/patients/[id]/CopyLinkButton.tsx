"use client";

export default function CopyLinkButton({ link, label = "Copiar link (Calendar)" }: { link: string; label?: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      alert("Link copiado ✔");
    } catch {
      prompt("Copiá el link:", link);
    }
  }
  return (
    <button className="border px-3 py-1" onClick={copy}>
      {label}
    </button>
  );
}

