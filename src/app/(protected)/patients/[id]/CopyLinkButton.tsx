"use client";

export default function CopyLinkButton({ link }: { link: string }) {
    async function copy() {
        try {
            await navigator.clipboard.writeText(link);
            alert("Link copiado ✔");
        } catch {
            // Fallback si clipboard no está disponible
            prompt("Copiá el link:", link);
        }
    }

    return (
        <button className="border px-3 py-1" onClick={copy}>
            Copiar link para Calendar
        </button>
    );
}
